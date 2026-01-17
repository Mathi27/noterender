(async () => {
  try {
    // We get the full URL of the internal file
    const src = chrome.runtime.getURL('core/injector.js');
    
    // We dynamically import it as a module
    await import(src);
    console.log('[ColabToPDF] Module System Loaded');
  } catch (e) {
    console.error('[ColabToPDF] Loader Failed:', e);
  }
})();