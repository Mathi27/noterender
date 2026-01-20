/**
 * CORE: Injector
 * Creates the Floating "Generate PDF" Button
 */

import { PDFEngine } from './pdf-engine.js'; 

(function() {
    'use strict';

    function createFloatingButton() {
        if (document.getElementById('colab-pdf-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'colab-pdf-btn';
        btn.innerHTML = '📄 Generate PDF';
        
        // Floating Style (Merged from your content.js)
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: '10000',
            background: '#4285f4', // Google Blue
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '50px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontFamily: "'Google Sans', Roboto, sans-serif",
            fontSize: '14px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        });

        // Hover Effects
        btn.onmouseenter = () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
        };
        btn.onmouseleave = () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        };

        // Click Handler
        btn.addEventListener('click', () => {
            const engine = new PDFEngine();
            engine.generate();
        });

        document.body.appendChild(btn);
    }

    // Observer to handle Colab's dynamic loading
    const observer = new MutationObserver(() => {
        if (!document.getElementById('colab-pdf-btn')) {
            createFloatingButton();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    // Initial load
    setTimeout(createFloatingButton, 1500);
})();