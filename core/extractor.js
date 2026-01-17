/**
 * CORE: Extractor
 * PURPOSE: Access Colab's internal model to get raw notebook JSON.
 * STRATEGY: Messaging the "World Connector"
 */

export class Extractor {
  constructor() {
    this.maxRetries = 3;
  }

  async getNotebookData() {
    console.log('[ColabToPDF] Initiating extraction protocol...');
    
    return new Promise((resolve, reject) => {
      
      const listener = (event) => {
        // Only accept messages from the window itself (our world connector)
        if (event.source !== window || event.data.type !== 'COLAB_DATA_RESPONSE') return;
        
        window.removeEventListener('message', listener);
        
        if (event.data.payload) {
          resolve(event.data.payload);
        } else {
          reject(new Error('Payload empty'));
        }
      };

      window.addEventListener('message', listener);

      // Trigger the World Connector
      // We send a message to the window, which world-connector.js is listening for
      window.postMessage({ type: 'COLAB_EXTRACT_CMD' }, '*');
    });
  }
}