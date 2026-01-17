/**
 * CORE: Transformer
 * PURPOSE: Normalize raw Colab data into UI-ready structure.
 * SPECS: Zero dependencies, pure function.
 */

export class Transformer {
  
  static process(rawData) {
    if (!rawData || !rawData.cells) {
      throw new Error("Invalid notebook data");
    }

    const t0 = performance.now();

    const cleanData = {
      title: rawData.title || 'Untitled Notebook',
      metadata: {
        generatedAt: new Date().toISOString(),
        cellCount: rawData.cells.length
      },
      content: rawData.cells.map(cell => this._transformCell(cell)).filter(Boolean)
    };

    const t1 = performance.now();
    console.log(`[ColabToPDF] Transformed ${cleanData.metadata.cellCount} cells in ${(t1-t0).toFixed(2)}ms`);
    
    return cleanData;
  }

  static _transformCell(cell) {
    // 1. Skip empty cells (Brutal Efficiency)
    if (!cell.text || cell.text.trim() === '') return null;

    // 2. Normalize Structure
    return {
      id: cell.id,
      type: cell.type === 'text' ? 'markdown' : 'code',
      source: this._cleanSource(cell.text),
      outputs: this._processOutputs(cell.outputs)
    };
  }

  static _cleanSource(text) {
    // Remove excessive whitespace but keep indentation
    return text.replace(/\r\n/g, '\n');
  }

  static _processOutputs(outputs) {
    if (!outputs || outputs.length === 0) return [];
    
    return outputs.map(output => {
      // Prioritize visual outputs
      if (output.data && output.data['image/png']) {
        return { type: 'image', data: output.data['image/png'], format: 'png' };
      }
      if (output.data && output.data['text/html']) {
        // Sanitize HTML if strictly necessary, or keep as raw for iframe
        return { type: 'html', data: output.data['text/html'] };
      }
      if (output.stream_text || (output.data && output.data['text/plain'])) {
        return { 
            type: 'text', 
            data: output.stream_text || output.data['text/plain'] 
        };
      }
      return null;
    }).filter(Boolean);
  }
}