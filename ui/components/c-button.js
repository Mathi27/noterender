class CButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const variant = this.getAttribute('variant') || 'primary';
    const text = this.textContent;
    
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; }
        button {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          height: 32px;
          padding: 0 16px;
          border: 1px solid #ccc;
          background: ${variant === 'primary' ? '#000' : '#fff'};
          color: ${variant === 'primary' ? '#fff' : '#000'};
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.1s ease;
        }
        button:hover {
          background: ${variant === 'primary' ? '#333' : '#f2f2f2'};
        }
        button:active {
          transform: translateY(1px);
        }
        button:disabled {
          background: #f2f2f2;
          color: #999;
          border-color: #e6e6e6;
          cursor: not-allowed;
        }
      </style>
      <button part="button">${text}</button>
    `;
  }
}
customElements.define('c-button', CButton);