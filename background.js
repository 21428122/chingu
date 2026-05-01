// Dev auto-reload — polls dev-server.js; silently skipped when not running
let _devV;
async function _devPoll() {
  try {
    const { version } = await (await fetch('http://localhost:9988')).json();
    if (_devV === undefined) { _devV = version; return; }
    if (version !== _devV) chrome.runtime.reload();
  } catch (e) {}
}
_devPoll();
setInterval(_devPoll, 1000);

let recording = false;
let steps = [];
let activeTabId = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getState') {
    sendResponse({ recording, stepCount: steps.length });
    return true;
  }

  if (msg.action === 'startRecording') {
    steps = [];
    recording = true;

    // Get the active tab and inject the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        sendResponse({ ok: false });
        return;
      }
      activeTabId = tabs[0].id;

      chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        files: ['content.js']
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to inject content script:', chrome.runtime.lastError.message);
          recording = false;
          sendResponse({ ok: false });
          return;
        }
        sendResponse({ ok: true });
      });
    });
    return true; // async response
  }

  if (msg.action === 'stopRecording') {
    recording = false;

    // Tell content script to stop
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'stopListening' }).catch(() => {});
    }

    // Save steps to storage
    chrome.storage.local.set({ steps }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (msg.action === 'viewGuide') {
    chrome.tabs.create({ url: chrome.runtime.getURL('viewer.html') });
    sendResponse({ ok: true });
    return true;
  }

  if (msg.action === 'newRecording') {
    steps = [];
    recording = false;
    chrome.storage.local.remove('steps');
    sendResponse({ ok: true });
    return true;
  }

  // Content script reports a click event
  if (msg.action === 'clickCaptured' && recording) {
    const tabId = sender.tab ? sender.tab.id : activeTabId;
    if (!tabId) return;

    // Small delay to let the page update after the click
    setTimeout(() => {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError || !dataUrl) {
          console.error('Screenshot failed:', chrome.runtime.lastError?.message);
          return;
        }

        steps.push({
          number: steps.length + 1,
          screenshot: dataUrl,
          url: msg.url,
          elementTag: msg.elementTag,
          elementText: msg.elementText,
          elementId: msg.elementId,
          elementClass: msg.elementClass,
          inputValue: msg.inputValue,
          timestamp: Date.now(),
          description: buildDescription(msg)
        });

        // Notify popup of new step count
        chrome.runtime.sendMessage({
          action: 'stepCaptured',
          stepCount: steps.length
        }).catch(() => {}); // popup might be closed
      });
    }, 300);
  }
});

// Also capture when user navigates to a new page while recording
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!recording || tabId !== activeTabId) return;
  if (changeInfo.status === 'complete') {
    // Re-inject content script on navigation
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    }).catch(() => {});
  }
});

function buildDescription(msg) {
  const tag = (msg.elementTag || '').toLowerCase();
  const text = msg.elementText ? msg.elementText.trim() : '';
  const truncated = text.length > 60 ? text.substring(0, 57) + '...' : text;
  const id = msg.elementId || '';
  const cls = msg.elementClass || '';

  // Input / textarea: "Type [value] in [field]"
  if ((tag === 'input' || tag === 'textarea') && msg.inputValue) {
    const label = msg.placeholder || id || 'the field';
    return `Type "${msg.inputValue}" in ${label}`;
  }

  // Button / link with text
  if (tag === 'button' || tag === 'a' || msg.role === 'button') {
    if (truncated) return `Click "${truncated}"`;
    // Try to use id or aria-label as fallback
    if (id) return `Click the "${id}" ${tag === 'a' ? 'link' : 'button'}`;
    return `Click the ${tag === 'a' ? 'link' : 'button'}`;
  }

  // Select / dropdown
  if (tag === 'select') {
    return msg.inputValue ? `Select "${msg.inputValue}"` : 'Open the dropdown';
  }

  // Checkbox / radio
  if (tag === 'input' && (msg.inputType === 'checkbox' || msg.inputType === 'radio')) {
    return truncated ? `Toggle "${truncated}"` : `Toggle the ${msg.inputType}`;
  }

  // Navigation / menu items
  if (tag === 'li' || tag === 'nav' || tag === 'span' || tag === 'div') {
    if (truncated) return `Click "${truncated}"`;
  }

  // Table rows / cells
  if (tag === 'td' || tag === 'tr' || tag === 'th') {
    if (truncated) return `Click "${truncated}" in the table`;
  }

  // Generic click with text
  if (truncated) {
    return `Click "${truncated}"`;
  }

  // Last resort: try to build something useful from id or class
  if (id) return `Click the "${id}" element`;
  if (cls) {
    const friendlyClass = cls.split(' ')[0].replace(/[-_]/g, ' ');
    return `Click the ${friendlyClass} area`;
  }

  return `Click on the page`;
}
