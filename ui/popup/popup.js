document.addEventListener('DOMContentLoaded', () => {
  const btnGenerate = document.getElementById('btn-generate');
  const statusText = document.getElementById('status-text');
  
  // 1. Check if we are on Colab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab.url.includes("colab.research.google.com")) {
      statusText.textContent = "Connected";
    } else {
      statusText.textContent = "Invalid Tab";
      btnGenerate.setAttribute('disabled', 'true');
    }
  });

  // 2. Handle Generate Click
  btnGenerate.addEventListener('click', () => {
    statusText.textContent = "Processing...";
    
    // Get options from toggles
    const options = {
      includeCode: document.getElementById('opt-code').hasAttribute('checked'),
      includeOutput: document.getElementById('opt-output').hasAttribute('checked')
    };

    // Send message to Content Script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "GENERATE_PDF",
        options: options
      });
    });
  });
});