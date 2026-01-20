/**
 * CORE: PDF Engine (v8.0)
 */
import { Transformer } from './transformer.js';
import { Extractor } from './extractor.js';

export class PDFEngine {
  constructor() {
    this.extractor = new Extractor();
    this.isGenerating = false;
  }

  async generate(options = {}) {
    if (this.isGenerating) return;
    this.isGenerating = true;

    try {
      this._showLoading();
      const rawData = await this.extractor.getNotebookData();
      const data = Transformer.process(rawData);
      await this._renderToFrame(data);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      this.isGenerating = false;
      this._hideLoading();
    }
  }

  async _renderToFrame(data) {
    let iframe = document.getElementById('colab-to-pdf-frame');
    if (iframe) iframe.remove();

    iframe = document.createElement('iframe');
    iframe.id = 'colab-to-pdf-frame';
    // Use fixed dimensions for consistency
    Object.assign(iframe.style, {
      position: 'fixed', top: '0', left: '0',
      width: '210mm', height: '0',
      visibility: 'hidden', zIndex: '-9999'
    });
    document.body.appendChild(iframe);

    const response = await fetch(chrome.runtime.getURL('templates/professional.html'));
    let template = await response.text();

    const contentHTML = this._generateHTML(data);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const cleanTitle = (data.title || "Untitled").replace(/[#*]/g, '').trim();

    const finalHTML = template
      .replace(/{{TITLE}}/g, cleanTitle)
      .replace(/{{DATE}}/g, dateStr)
      .replace(/{{CONTENT}}/g, contentHTML);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(finalHTML);
    doc.close();

    return new Promise((resolve) => {
      iframe.onload = () => {
        // Wait 2.5s for images to render (Crucial for large charts)
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            resolve();
        }, 2500); 
      };
    });
  }

  _generateHTML(data) {
    return data.content.map(cell => {
      if (cell.type === 'markdown') {
        return `<div class="cell markdown">${this._parseMarkdown(cell.source)}</div>`;
      } 
      
      if (cell.type === 'code') {
        const outputs = (cell.outputs || []).map(o => {
            // Direct Base64 Image
            if (o.type === 'image') return `<div class="output-image"><img src="data:${o.mime};base64,${o.data}" /></div>`;
            // SVG
            if (o.type === 'svg') return `<div class="output-image">${o.data}</div>`;
            // NEW: Source Link Image (Extracted from HTML)
            if (o.type === 'image-src') return `<div class="output-image"><img src="${o.src}" /></div>`;
            // Text
            if (o.type === 'text') return `<pre class="output-text">${o.data.replace(/</g, "&lt;")}</pre>`;
            return '';
        }).join('');

        return `
          <div class="cell">
            <div class="code-container">
                <div class="code-source">${cell.source}</div>
                ${outputs ? `<div class="outputs">${outputs}</div>` : ''}
            </div>
          </div>
        `;
      }
      return '';
    }).join('\n');
  }

  _parseMarkdown(text) {
    return text
      .replace(/^#\s+(.*?)$/gm, '<h1>$1</h1>')
      .replace(/^##\s+(.*?)$/gm, '<h2>$1</h2>')
      .replace(/^###\s+(.*?)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .replace(/\n/g, '<br>');
  }

  _showLoading() {
    const d = document.createElement('div');
    d.id = 'loader';
    d.innerHTML = '<div style="position:fixed;top:20px;right:20px;background:#1a73e8;color:white;padding:14px 28px;border-radius:50px;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-family:sans-serif;font-weight:600;">Generating PDF...</div>';
    document.body.appendChild(d);
  }
  _hideLoading() {
    const l = document.getElementById('loader');
    if(l) l.remove();
  }
}