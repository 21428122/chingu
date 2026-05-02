// --- Tab switching ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

// --- Record Tab ---
const btnRecord = document.getElementById('btnRecord');
const btnStop = document.getElementById('btnStop');
const btnView = document.getElementById('btnView');
const btnNew = document.getElementById('btnNew');
const idleControls = document.getElementById('idleControls');
const recordingControls = document.getElementById('recordingControls');
const doneControls = document.getElementById('doneControls');
const statusEl = document.getElementById('status');
const stepCountEl = document.getElementById('stepCount');

function showState(state) {
  idleControls.classList.toggle('hidden', state !== 'idle');
  recordingControls.classList.toggle('hidden', state !== 'recording');
  doneControls.classList.toggle('hidden', state !== 'done');

  if (state === 'idle') {
    statusEl.textContent = 'Ready to record';
    statusEl.className = 'status';
  } else if (state === 'recording') {
    statusEl.innerHTML = '<span class="recording-dot"></span>Recording...';
    statusEl.className = 'status recording';
  } else if (state === 'done') {
    statusEl.textContent = 'Recording complete';
    statusEl.className = 'status';
  }
}

// Load current state on popup open
chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
  if (!response) return;
  stepCountEl.textContent = response.stepCount || 0;
  if (response.recording) {
    showState('recording');
  } else if (response.stepCount > 0) {
    showState('done');
  } else {
    showState('idle');
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'stepCaptured') {
    stepCountEl.textContent = msg.stepCount;
  }
});

btnRecord.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'startRecording' }, (response) => {
    if (response && response.ok) {
      stepCountEl.textContent = '0';
      showState('recording');
    }
  });
});

btnStop.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'stopRecording' }, (response) => {
    if (response && response.ok) {
      showState('done');
    }
  });
});

btnView.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'viewGuide' });
});

btnNew.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'newRecording' }, () => {
    stepCountEl.textContent = '0';
    showState('idle');
  });
});

document.getElementById('btnLibrary').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'openLibrary' });
});
document.getElementById('btnLibraryDone').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'openLibrary' });
});

// --- Autopilot Tab ---
const btnAutopilot = document.getElementById('btnAutopilot');
const btnAutopilotStop = document.getElementById('btnAutopilotStop');
const autopilotInput = document.getElementById('autopilotInput');
const autopilotLog = document.getElementById('autopilotLog');
let autopilotRunning = false;

function addLog(text, type = 'info') {
  autopilotLog.classList.remove('hidden');
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  entry.textContent = text;
  autopilotLog.appendChild(entry);
  autopilotLog.scrollTop = autopilotLog.scrollHeight;
}

btnAutopilot.addEventListener('click', async () => {
  const rawInput = autopilotInput.value.trim();
  if (!rawInput) return;

  const instructions = rawInput.split('\n').map(s => s.trim()).filter(s => s);
  if (instructions.length === 0) return;

  autopilotRunning = true;
  btnAutopilot.classList.add('hidden');
  btnAutopilotStop.classList.remove('hidden');
  autopilotLog.innerHTML = '';
  autopilotLog.classList.remove('hidden');

  addLog(`Starting autopilot: ${instructions.length} steps`, 'info');

  // Start recording first so screenshots are captured
  await new Promise(resolve => {
    chrome.runtime.sendMessage({ action: 'startRecording' }, resolve);
  });

  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    addLog('No active tab found', 'fail');
    return;
  }

  // Inject autopilot script
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['autopilot.js']
    });
  } catch (e) {
    addLog(`Cannot inject into this page: ${e.message}`, 'fail');
    autopilotRunning = false;
    btnAutopilot.classList.remove('hidden');
    btnAutopilotStop.classList.add('hidden');
    return;
  }

  // Execute instructions one by one
  for (let i = 0; i < instructions.length; i++) {
    if (!autopilotRunning) {
      addLog('Stopped by user', 'info');
      break;
    }

    const instruction = instructions[i];
    addLog(`Step ${i + 1}: ${instruction}`, 'info');

    try {
      const result = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'autopilotStep',
          instruction
        }, resolve);
      });

      if (result && result.ok) {
        addLog(`  Done: ${result.element}`, 'ok');
      } else {
        addLog(`  Failed: ${result ? result.reason : 'No response'}`, 'fail');
      }
    } catch (e) {
      addLog(`  Error: ${e.message}`, 'fail');
    }

    // Wait between steps for page to update
    await new Promise(r => setTimeout(r, 1500));
  }

  // Stop recording
  await new Promise(resolve => {
    chrome.runtime.sendMessage({ action: 'stopRecording' }, resolve);
  });

  if (autopilotRunning) {
    addLog('Autopilot complete! Click "Record" tab to view guide.', 'ok');
  }

  autopilotRunning = false;
  btnAutopilot.classList.remove('hidden');
  btnAutopilotStop.classList.add('hidden');

  // Switch to record tab showing done state
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-tab="record"]').classList.add('active');
  document.getElementById('tab-record').classList.add('active');

  chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
    if (response) {
      stepCountEl.textContent = response.stepCount || 0;
      showState(response.stepCount > 0 ? 'done' : 'idle');
    }
  });
});

btnAutopilotStop.addEventListener('click', () => {
  autopilotRunning = false;
});
