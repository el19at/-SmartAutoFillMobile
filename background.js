
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getRules") {
    browser.storage.local.get("rules").then((result) => {
      sendResponse(result.rules || []);
    });
    return true;
  }
  if (msg.action === "getSavedValues") {
    browser.storage.local.get(null).then((result) => {
      sendResponse(result || {});
    });
    return true;
  }
});
