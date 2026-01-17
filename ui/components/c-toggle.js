class CToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() { return ['checked']; }

  connectedCallback() {
    this.render();
    this.shadowRoot.querySelector('input').addEventListener('change', (e) => {
      this.dispatchEvent(new CustomEvent('change', { detail: e.target.checked }));
    });
  }

  render() {
    const label = this.getAttribute('label') || '';
    const isChecked = this.hasAttribute('checked');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
        .label { font-size: 13px; color: #333; font-family: -apple-system, sans-serif; }
        .switch {
          position: relative;
          display: inline-block;
          width: 32px;
          height: 16px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #fff;
          border: 1px solid #ccc;
          transition: .2s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 10px;
          width: 10px;
          left: 2px;
          bottom: 2px;
          background-color: #000;
          transition: .2s;
        }
        input:checked + .slider { background-color: #000; border-color: #000; }
        input:checked + .slider:before { transform: translateX(16px); background-color: #fff; }
      </style>
      <span class="label">${label}</span>
      <label class="switch">
        <input type="checkbox" ${isChecked ? 'checked' : ''}>
        <span class="slider"></span>
      </label>
    `;
  }
}
customElements.define('c-toggle', CToggle);