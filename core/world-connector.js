/**
 * WORLD CONNECTOR (v1.1 - Fixed)
 * Runs inside the MAIN world (Page Context).
 * Accesses 'window.colab' and sends data back to the isolated content script.
 */

(function() {
  // Listen for the "Extraction Signal" from the isolated content script
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'COLAB_EXTRACT_CMD') {
      extractAndReply();
    }
  });

  function extractAndReply() {
    try {
      // 1. Locate the Notebook Model
      let notebook = null;
      if (window.colab && window.colab.global && window.colab.global.notebook) {
        notebook = window.colab.global.notebook;
      }

      if (!notebook) {
        throw new Error("Colab Model not accessible");
      }

      // 2. Safe Title Extraction (The Fix)
      let title = "Untitled Notebook";
      try {
        // Try internal methods first, fallback to DOM title
        if (typeof notebook.getName === 'function') {
            title = notebook.getName();
        } else if (notebook.model && notebook.model.name) {
            title = notebook.model.name;
        } else {
            // Robust Fallback: Get it from the browser tab title
            // Colab titles usually look like "MyNotebook.ipynb - Colab"
            title = document.title.replace(' - Colab', '').replace('.ipynb', '');
        }
      } catch (e) {
        title = document.title || "Notebook";
      }

      // 3. Serialize the Data
      const cells = notebook.getCells().map(cell => {
         return {
           id: cell.getId(),
           type: cell.getType(),
           text: cell.getText(),
           // Safety check for outputs
           outputs: (cell.getOutputs && typeof cell.getOutputs === 'function') 
             ? cell.getOutputs().map(o => o.toJSON()) 
             : []
         };
      });

      console.log(`[ColabToPDF] Extracted ${cells.length} cells. Title: ${title}`);

      // 4. Send back to Content Script
      window.postMessage({
        type: 'COLAB_DATA_RESPONSE',
        payload: {
          title: title,
          cells: cells
        }
      }, '*');

    } catch (e) {
      console.error('[ColabToPDF] World-Connector Error:', e);
      window.postMessage({ type: 'COLAB_DATA_RESPONSE', payload: null }, '*');
    }
  }
})();