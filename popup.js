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

// Listen for step count updates while popup is open
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
