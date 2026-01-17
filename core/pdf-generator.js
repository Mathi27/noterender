// Surgical PDF Generator - Multiple fallback methods

class PDFGenerator {
  constructor() {
    this.methods = [
      this.generateWithPrintAPI.bind(this),
      this.generateWithCanvas.bind(this),
      this.generateWithCSSPagedMedia.bind(this)
    ];
  }

  async generate(htmlContent, options = {}) {
    const {
      method = 'auto',
      filename = `colab-${Date.now()}.pdf`,
      pageSize = 'A4',
      margin = '20mm',
      timeout = 10000
    } = options;

    try {
      let pdfData;
      
      if (method === 'auto') {
        // Try methods in order
        for (const methodFn of this.methods) {
          try {
            pdfData = await this.withTimeout(methodFn(htmlContent, options), timeout);
            if (pdfData) break;
          } catch (error) {
            console.warn('PDF generation method failed:', error.message);
            continue;
          }
        }
      } else {
        const methodIndex = ['print', 'canvas', 'css'].indexOf(method);
        if (methodIndex >= 0) {
          pdfData = await this.withTimeout(this.methods[methodIndex](htmlContent, options), timeout);
        }
      }

      if (!pdfData) {
        throw new Error('All PDF generation methods failed');
      }

      return {
        success: true,
        data: pdfData,
        filename,
        method: method === 'auto' ? 'fallback' : method
      };
    } catch (error) {
      console.error('PDF generation failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackHTML(htmlContent)
      };
    }
  }

  // Method 1: Browser's native print API
  async generateWithPrintAPI(htmlContent, options) {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = `
        position: fixed;
        width: 0;
        height: 0;
        border: none;
        visibility: hidden;
      `;
      
      document.body.appendChild(iframe);
      
      const cleanup = () => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        URL.revokeObjectURL(blobURL);
      };
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const blobURL = URL.createObjectURL(blob);
      
      iframe.onload = () => {
        try {
          // Wait for content to render
          setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // We can't capture the PDF from print() directly,
            // but we can trigger download through browser's print dialog
            // For actual PDF generation, we'd need to intercept the print
            
            cleanup();
            resolve(null); // Let browser handle the PDF generation
          }, 500);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };
      
      iframe.onerror = () => {
        cleanup();
        reject(new Error('Iframe failed to load'));
      };
      
      iframe.src = blobURL;
    });
  }

  // Method 2: HTML to Canvas to PDF (using html2canvas + jsPDF)
  async generateWithCanvas(htmlContent, options) {
    // Check if required libraries are available
    if (typeof html2canvas === 'undefined' || typeof jsPDF === 'undefined') {
      throw new Error('Required libraries not loaded');
    }
    
    const { pageSize = 'a4', orientation = 'portrait' } = options;
    
    // Create temporary container
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: ${pageSize === 'a4' ? '210mm' : '215.9mm'};
      background: white;
    `;
    container.innerHTML = htmlContent;
    document.body.appendChild(container);
    
    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      // Convert canvas to PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = pageSize === 'a4' ? 190 : 196;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
      
      // Get PDF as data URL
      const pdfData = pdf.output('datauristring').split(',')[1];
      
      return pdfData;
    } finally {
      document.body.removeChild(container);
    }
  }

  // Method 3: CSS Paged Media (for print)
  async generateWithCSSPagedMedia(htmlContent, options) {
    // Add print-specific styles
    const printStyles = `
      <style>
        @media print {
          body { margin: 0; padding: 0; }
          @page { size: ${options.pageSize}; margin: ${options.margin}; }
          .no-print { display: none !important; }
        }
      </style>
    `;
    
    const fullHTML = printStyles + htmlContent;
    
    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(fullHTML);
    printWindow.document.close();
    
    // Return promise that resolves when print dialog is closed
    return new Promise((resolve) => {
      printWindow.onfocus = () => {
        setTimeout(() => {
          printWindow.close();
          resolve(null);
        }, 1000);
      };
      
      printWindow.print();
    });
  }

  // Helper: Timeout wrapper
  withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }, ms);
      
      promise.then(
        (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      );
    });
  }

  // Fallback: Download as HTML with print instructions
  getFallbackHTML(htmlContent) {
    const fallbackHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ColabToPDF - Print Instructions</title>
        <style>
          body { font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .instructions { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          code { background: #e0e0e0; padding: 2px 4px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Print to PDF</h1>
        <div class="instructions">
          <p>To generate a PDF:</p>
          <ol>
            <li>Press <code>Ctrl + P</code> (Windows/Linux) or <code>Cmd + P</code> (Mac)</li>
            <li>Change destination to "Save as PDF"</li>
            <li>Click "Save"</li>
          </ol>
        </div>
        <hr>
        ${htmlContent}
      </body>
      </html>
    `;
    
    return btoa(fallbackHTML);
  }
}

// Export for use in extension
if (typeof module !== 'undefined') {
  module.exports = PDFGenerator;
} else {
  window.PDFGenerator = PDFGenerator;
}