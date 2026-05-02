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

let recording   = false;
let steps       = [];
let activeTabId = null;
let currentDocId = null;

function genDocId() {
  return 'doc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Persist a document into the documents array
function saveDocument(docId, stepData, extra, cb) {
  chrome.storage.local.get(['documents', 'brandLogo'], (data) => {
    const docs = data.documents || [];
    const idx  = docs.findIndex(d => d.id === docId);
    const now  = Date.now();
    // New documents always start as "Untitled Guide" — viewer polish generates the real title
    const base = idx >= 0 ? docs[idx] : {
      id: docId,
      createdAt: now,
      title: 'Untitled Guide',
      metadata: {},
      brandLogo: data.brandLogo || null,
    };
    const updated = { ...base, ...extra, steps: stepData, updatedAt: now };
    if (idx >= 0) docs[idx] = updated; else docs.unshift(updated);
    chrome.storage.local.set({ documents: docs, currentDocId: docId }, cb);
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.action === 'getState') {
    sendResponse({ recording, stepCount: steps.length, currentDocId });
    return true;
  }

  if (msg.action === 'startRecording') {
    steps = [];
    recording = true;
    currentDocId = genDocId();

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) { sendResponse({ ok: false }); return; }
      activeTabId = tabs[0].id;
      chrome.scripting.executeScript({ target: { tabId: activeTabId }, files: ['content.js'] }, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to inject content script:', chrome.runtime.lastError.message);
          recording = false;
          sendResponse({ ok: false });
          return;
        }
        sendResponse({ ok: true });
      });
    });
    return true;
  }

  if (msg.action === 'stopRecording') {
    recording = false;
    const tabId = activeTabId;
    if (tabId) {
      chrome.tabs.sendMessage(tabId, { action: 'stopListening' }).catch(() => {});
    }
    const docId = currentDocId || genDocId();
    currentDocId = docId;
    saveDocument(docId, steps, {}, () => {
      sendResponse({ ok: true });
      // Show success toast so user knows what to do next
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          action: 'showSuccessToast',
          stepCount: steps.length,
          viewUrl: chrome.runtime.getURL(`viewer.html?docId=${docId}`)
        }).catch(() => {});
      }
    });
    return true;
  }

  if (msg.action === 'viewGuide') {
    const docId = currentDocId || msg.docId;
    const url   = docId
      ? chrome.runtime.getURL(`viewer.html?docId=${docId}`)
      : chrome.runtime.getURL('viewer.html');
    chrome.tabs.create({ url });
    sendResponse({ ok: true });
    return true;
  }

  if (msg.action === 'openLibrary') {
    chrome.tabs.create({ url: chrome.runtime.getURL('library.html') });
    sendResponse({ ok: true });
    return true;
  }

  if (msg.action === 'newRecording') {
    steps = [];
    recording = false;
    currentDocId = null;
    sendResponse({ ok: true });
    return true;
  }

  // Content script reports a click event
  if (msg.action === 'clickCaptured' && recording) {
    const tabId = sender.tab ? sender.tab.id : activeTabId;
    if (!tabId) return;
    const captureTabId = tabId;
    setTimeout(async () => {
      // Hide overlay and wait for TWO animation frames so the browser
      // has actually repainted before we call captureVisibleTab.
      // executeScript resolves when the injected function's Promise resolves.
      try {
        await chrome.scripting.executeScript({
          target: { tabId: captureTabId },
          func: () => new Promise(resolve => {
            const el = document.getElementById('__chingu_overlay__');
            if (el) el.style.display = 'none';
            // rAF #1 queues the paint, rAF #2 confirms it finished
            requestAnimationFrame(() => requestAnimationFrame(resolve));
          })
        });
      } catch (_) {}

      chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        // Restore overlay after capture
        chrome.scripting.executeScript({
          target: { tabId: captureTabId },
          func: () => {
            const el = document.getElementById('__chingu_overlay__');
            if (el) el.style.display = '';
          }
        }).catch(() => {});

        if (chrome.runtime.lastError || !dataUrl) return;
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
        chrome.runtime.sendMessage({ action: 'stepCaptured', stepCount: steps.length }).catch(() => {});
        chrome.tabs.sendMessage(captureTabId, { action: 'updateStepCount', count: steps.length }).catch(() => {});
      });
    }, 300);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!recording || tabId !== activeTabId) return;
  if (changeInfo.status === 'complete') {
    chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] }).catch(() => {});
  }
});

function buildDescription(msg) {
  const tag = (msg.elementTag || '').toLowerCase();
  const text = msg.elementText ? msg.elementText.trim() : '';
  const truncated = text.length > 60 ? text.substring(0, 57) + '...' : text;
  const id = msg.elementId || '';
  const cls = msg.elementClass || '';

  if ((tag === 'input' || tag === 'textarea') && msg.inputValue) {
    const label = msg.placeholder || id || 'the field';
    return `Type "${msg.inputValue}" in ${label}`;
  }
  if (tag === 'button' || tag === 'a' || msg.role === 'button') {
    if (truncated) return `Click "${truncated}"`;
    if (id) return `Click the "${id}" ${tag === 'a' ? 'link' : 'button'}`;
    return `Click the ${tag === 'a' ? 'link' : 'button'}`;
  }
  if (tag === 'select') return msg.inputValue ? `Select "${msg.inputValue}"` : 'Open the dropdown';
  if (tag === 'input' && (msg.inputType === 'checkbox' || msg.inputType === 'radio')) {
    return truncated ? `Toggle "${truncated}"` : `Toggle the ${msg.inputType}`;
  }
  if (tag === 'li' || tag === 'nav' || tag === 'span' || tag === 'div') {
    if (truncated) return `Click "${truncated}"`;
  }
  if (tag === 'td' || tag === 'tr' || tag === 'th') {
    if (truncated) return `Click "${truncated}" in the table`;
  }
  if (truncated) return `Click "${truncated}"`;
  if (id) return `Click the "${id}" element`;
  if (cls) {
    const friendlyClass = cls.split(' ')[0].replace(/[-_]/g, ' ');
    return `Click the ${friendlyClass} area`;
  }
  return `Click on the page`;
}
