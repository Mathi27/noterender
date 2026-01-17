/**
 * CORE: PDF Engine
 * PURPOSE: Render cleaned data into Printable HTML
 */

import { Transformer } from './transformer.js';
import { Extractor } from './extractor.js';

export class PDFEngine {
  constructor() {
    this.extractor = new Extractor();
  }

  async generate(options = {}) {
    try {
      // 1. Extract
      const rawData = await this.extractor.getNotebookData();
      
      // 2. Transform
      const data = Transformer.process(rawData);

      // 3. Render (Virtual DOM in hidden iframe)
      await this._renderToFrame(data, options);

    } catch (error) {
      console.error('[ColabToPDF] Engine Failure:', error);
      alert('Failed to generate PDF: ' + error.message);
    }
  }

  async _renderToFrame(data, options) {
    // Create a hidden iframe to render the PDF content
    let iframe = document.getElementById('colab-to-pdf-frame');
    if (iframe) iframe.remove();
    
    iframe = document.createElement('iframe');
    iframe.id = 'colab-to-pdf-frame';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '210mm'; // A4 width
    iframe.style.height = '0px'; // Hidden
    iframe.style.visibility = 'hidden'; 
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);

    // Fetch the Minimal Template
    const response = await fetch(chrome.runtime.getURL('templates/minimal.html'));
    let template = await response.text();

    // Inject CSS
    const cssResponse = await fetch(chrome.runtime.getURL('templates/system.css'));
    const systemCSS = await cssResponse.text();

    // Hydrate Template (Simple String Replacement for speed)
    // In a real build step, we might use a lightweight template engine like Mustache
    // But for <250KB limit, string literal replacement is surgically fast.
    
    const contentHTML = this._generateHTML(data);
    
    const finalHTML = template
      .replace('{{TITLE}}', data.title)
      .replace('{{STYLES}}', systemCSS)
      .replace('{{CONTENT}}', contentHTML);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(finalHTML);
    doc.close();

    // Wait for images to load then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        // iframe.remove(); // Cleanup after print (optional)
      }, 500);
    };
  }

  _generateHTML(data) {
    // Convert JSON objects to HTML strings
    return data.content.map(cell => {
      if (cell.type === 'markdown') {
        // NOTE: In production, integrate a micro-markdown parser here (e.g. marked.min.js)
        // For now, we wrap in simple paragraph
        return `<div class="cell markdown">${cell.source}</div>`;
      } 
      
      if (cell.type === 'code') {
        const outputs = cell.outputs.map(o => {
            if (o.type === 'image') return `<img src="data:image/png;base64,${o.data}" />`;
            if (o.type === 'text') return `<pre class="output">${o.data}</pre>`;
            return '';
        }).join('');

        return `
          <div class="cell code-group">
            <pre class="code-source"><code>${cell.source}</code></pre>
            <div class="outputs">${outputs}</div>
          </div>
        `;
      }
    }).join('\n');
  }
}