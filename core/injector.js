/**
 * MODULE: UI Injector
 * PURPOSE: Surgically insert PDF trigger into Colab Toolbar
 * PERFORMANCE: Uses MutationObserver to catch dynamic DOM load
 */
// ... (Previous Button Injection Code) ...

// LISTEN FOR COMMANDS (From Popup or Injected Button)
import { PDFEngine } from './pdf-engine.js'; // Ensure this is handled via module loading

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GENERATE_PDF") {
    console.log('[ColabToPDF] Starting Engine...');
    
    const engine = new PDFEngine();
    engine.generate(request.options || {});
  }
});


(function() {
    'use strict';

    const CONFIG = {
        TOOLBAR_SELECTOR: '#header-right', // The right side of Colab top bar
        BUTTON_ID: 'colab-to-pdf-trigger',
        LABEL: 'Download PDF'
    };

    function createTriggerButton() {
        const btn = document.createElement('button');
        btn.id = CONFIG.BUTTON_ID;
        
        // Use the new Google Material class
        btn.className = 'c-btn-google'; 
        
        // Add a Download Icon (SVG) + Text for full native look
        btn.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download PDF
        `;

        // We REMOVE the inline style overrides that forced square corners
        // Only keep structural necessity if needed, but CSS handles it now.
        
        btn.addEventListener('click', () => {
             // Visual feedback (Ripple effect simulation)
            btn.style.opacity = '0.8';
            setTimeout(() => btn.style.opacity = '1', 150);

            chrome.runtime.sendMessage({ action: "TRIGGER_EXTRACTION" });
        });

        return btn;
    }
    function inject() {
        if (document.getElementById(CONFIG.BUTTON_ID)) return; // Already injected

        const toolbar = document.querySelector(CONFIG.TOOLBAR_SELECTOR);
        if (toolbar) {
            const btn = createTriggerButton();
            toolbar.prepend(btn); // Add to the start of the right toolbar
            console.log('[ColabToPDF] Injection Successful');
        }
    }

    // Observer to handle Colab's lazy loading
    const observer = new MutationObserver((mutations) => {
        if (!document.getElementById(CONFIG.BUTTON_ID)) {
            inject();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    // Initial attempt
    setTimeout(inject, 1000);

})();