/**
 * BACKGROUND PROCESSOR
 * Minimal logic to handle extension installation and icon states.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[ColabToPDF] Installed successfully.');
});

// Optional: Listen for the "Download PDF" button click from the INJECTED UI 
// and open the popup or trigger action directly.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "TRIGGER_EXTRACTION") {
    console.log("Trigger received from Page UI");
    
    // Relay to the active tab's content script to start the engine
    if (sender.tab && sender.tab.id) {
       chrome.tabs.sendMessage(sender.tab.id, { action: "GENERATE_PDF" });
    }
  }
});