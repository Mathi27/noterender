/**
 * CORE: Transformer (v8.0 - Deep Image Extraction)
 * PURPOSE: Extracts images hidden inside HTML/Markdown outputs.
 */
export class Transformer {
  
  static process(rawData) {
    if (!rawData || !rawData.cells) return { title: "Error", content: [] };

    return {
      title: rawData.title || 'Untitled Notebook',
      content: rawData.cells.map(cell => this._transformCell(cell)).filter(Boolean)
    };
  }

  static _transformCell(cell) {
    // Skip empty cells
    if ((!cell.text || !cell.text.trim()) && (!cell.outputs || cell.outputs.length === 0)) {
        return null; 
    }

    const isMarkdown = cell.type === 'text' || cell.type === 'markdown';

    return {
      type: isMarkdown ? 'markdown' : 'code',
      source: isMarkdown ? this._parseMarkdownImages(cell.text) : (cell.text || ''), 
      outputs: this._processOutputs(cell.outputs)
    };
  }

  static _parseMarkdownImages(text) {
    if (!text) return '';
    // Fix: Ensure we catch standard Markdown images
    return text.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
        return `<img src="${url}" alt="${alt}" class="md-image" />`;
    });
  }

  static _processOutputs(outputs) {
    if (!outputs || outputs.length === 0) return [];
    
    return outputs.map(output => {
      const data = output.data || {};
      
      // 1. Direct Image Types (The easy ones)
      if (data['image/png']) return { type: 'image', mime: 'image/png', data: data['image/png'] };
      if (data['image/jpeg']) return { type: 'image', mime: 'image/jpeg', data: data['image/jpeg'] };
      if (data['image/svg+xml']) {
         let svg = Array.isArray(data['image/svg+xml']) ? data['image/svg+xml'].join('') : data['image/svg+xml'];
         return { type: 'svg', data: svg };
      }

      // 2. Rich Text (The tricky ones - Charts often hide here)
      // Check text/html for <img> tags
      if (data['text/html']) {
        let html = Array.isArray(data['text/html']) ? data['text/html'].join('') : data['text/html'];
        // REGEX: Hunt for <img src="..."> pattern
        const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch && imgMatch[1]) {
           // We found an image hidden in HTML!
           return { type: 'image-src', src: imgMatch[1] };
        }
      }

      // Check text/markdown for ![...](...) patterns
      if (data['text/markdown']) {
        let md = Array.isArray(data['text/markdown']) ? data['text/markdown'].join('') : data['text/markdown'];
        const mdImgMatch = md.match(/!\[.*?\]\((.*?)\)/);
        if (mdImgMatch && mdImgMatch[1]) {
           return { type: 'image-src', src: mdImgMatch[1] };
        }
      }

      // 3. Plain Text Logs
      if (data['text/plain']) {
        let text = Array.isArray(data['text/plain']) ? data['text/plain'].join('') : data['text/plain'];
        if (text.includes('<matplotlib') || text.includes('<Figure') || text.includes('object at 0x')) return null;
        return { type: 'text', data: text };
      }
      
      // 4. Streams
      if (output.output_type === 'stream' && output.text) {
          let text = Array.isArray(output.text) ? output.text.join('') : output.text;
          return { type: 'text', data: text };
      }

      return null;
    }).filter(Boolean);
  }
}