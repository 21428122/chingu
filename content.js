// Guard against double-injection on the same page
if (!window.__chinguListening) {
  window.__chinguListening = true;

  // ── Floating recording overlay ────────────────────────────────────────────

  function injectOverlay() {
    if (document.getElementById('__chingu_overlay__')) return;

    // Keyframe animation (inject once per page)
    if (!document.getElementById('__chingu_styles__')) {
      const style = document.createElement('style');
      style.id = '__chingu_styles__';
      style.textContent = `
        @keyframes __cg_pulse__ {
          0%,100%{ transform:scale(1);   opacity:1;    }
          50%    { transform:scale(0.72);opacity:0.5;  }
        }
        @keyframes __cg_slidein__ {
          from { transform:translateY(80px); opacity:0; }
          to   { transform:translateY(0);   opacity:1; }
        }
        @keyframes __cg_fadeout__ {
          from { opacity:1; transform:translateY(0); }
          to   { opacity:0; transform:translateY(20px); }
        }
        #__chingu_overlay__ {
          animation: __cg_slidein__ 0.35s cubic-bezier(0.34,1.4,0.64,1) both;
        }
        #__chingu_overlay__.hiding {
          animation: __cg_fadeout__ 0.3s ease forwards;
        }
        #__chingu_stop_btn__:hover {
          background: #DC2626 !important;
          transform: scale(1.04) !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    const bar = document.createElement('div');
    bar.id = '__chingu_overlay__';
    bar.style.cssText = [
      'position:fixed',
      'bottom:24px',
      'right:24px',
      'z-index:2147483647',
      'display:flex',
      'align-items:center',
      'gap:10px',
      'padding:10px 14px 10px 16px',
      'background:rgba(10,10,20,0.92)',
      'backdrop-filter:blur(16px)',
      '-webkit-backdrop-filter:blur(16px)',
      'border-radius:999px',
      'border:1px solid rgba(255,255,255,0.12)',
      'box-shadow:0 8px 32px rgba(0,0,0,0.4)',
      'font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif',
      'font-size:13px',
      'font-weight:600',
      'color:white',
      'user-select:none',
      'cursor:default',
      'pointer-events:all',
    ].join(';');

    bar.innerHTML = `
      <span style="
        width:9px;height:9px;border-radius:50%;background:#EF4444;
        display:inline-block;flex-shrink:0;
        animation:__cg_pulse__ 1.6s cubic-bezier(0.4,0,0.6,1) infinite;
      "></span>
      <span style="color:#EF4444;letter-spacing:0.06em;font-size:11px">REC</span>
      <span id="__chingu_count__" style="color:rgba(255,255,255,0.55);font-weight:500">
        0 steps
      </span>
      <div style="width:1px;height:16px;background:rgba(255,255,255,0.15);flex-shrink:0"></div>
      <button id="__chingu_stop_btn__" style="
        background:#EF4444;color:white;border:none;border-radius:999px;
        padding:6px 16px;font-size:12px;font-weight:700;cursor:pointer;
        font-family:inherit;letter-spacing:-0.01em;
        transition:background 0.15s,transform 0.15s;
        outline:none;
      ">■ Stop</button>
    `;

    (document.body || document.documentElement).appendChild(bar);

    // Stop button → tell background to stop recording
    bar.querySelector('#__chingu_stop_btn__').addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      const btn = bar.querySelector('#__chingu_stop_btn__');
      btn.textContent = 'Saving…';
      btn.style.background = '#6366F1';
      btn.disabled = true;
      chrome.runtime.sendMessage({ action: 'stopRecording' });
    });
  }

  function updateOverlayCount(count) {
    const el = document.getElementById('__chingu_count__');
    if (el) el.textContent = `${count} step${count !== 1 ? 's' : ''}`;
  }

  function removeOverlay() {
    const bar = document.getElementById('__chingu_overlay__');
    if (!bar) return;
    bar.classList.add('hiding');
    setTimeout(() => bar.remove(), 320);
  }

  function showSuccessToast(stepCount, viewUrl) {
    const existing = document.getElementById('__chingu_toast__');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = '__chingu_toast__';
    toast.style.cssText = [
      'position:fixed',
      'bottom:24px',
      'right:24px',
      'z-index:2147483647',
      'display:flex',
      'align-items:center',
      'gap:12px',
      'padding:12px 16px',
      'background:white',
      'border-radius:14px',
      'border:1px solid #E2E8F0',
      'box-shadow:0 8px 32px rgba(15,23,42,0.15)',
      'font-family:Inter,-apple-system,sans-serif',
      'font-size:13px',
      'font-weight:600',
      'color:#0F172A',
      'animation:__cg_slidein__ 0.35s cubic-bezier(0.34,1.4,0.64,1) both',
      'max-width:320px',
    ].join(';');

    toast.innerHTML = `
      <span style="font-size:20px;line-height:1">✅</span>
      <span style="flex:1">
        <span style="color:#10B981">${stepCount} step${stepCount !== 1 ? 's' : ''} captured</span>
        <span style="color:#94A3B8;font-weight:400"> — guide is ready</span>
      </span>
      <a href="${viewUrl}" target="_blank" style="
        background:linear-gradient(135deg,#6366F1,#8B5CF6);
        color:white;text-decoration:none;border-radius:8px;
        padding:7px 14px;font-size:12px;font-weight:700;
        font-family:inherit;white-space:nowrap;flex-shrink:0;
      ">View Guide →</a>
      <button onclick="this.parentElement.remove()" style="
        background:none;border:none;cursor:pointer;color:#CBD5E1;
        font-size:18px;line-height:1;padding:0 2px;font-family:inherit;
        flex-shrink:0;
      ">×</button>
    `;

    (document.body || document.documentElement).appendChild(toast);

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = '__cg_fadeout__ 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
      }
    }, 8000);
  }

  // ── Element info ──────────────────────────────────────────────────────────

  function getElementInfo(el) {
    let target = el;
    const meaningfulTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL'];
    for (let i = 0; i < 5; i++) {
      if (!target.parentElement) break;
      if (meaningfulTags.includes(target.parentElement.tagName)) { target = target.parentElement; break; }
      if (target.parentElement.getAttribute('role') === 'button') { target = target.parentElement; break; }
      if (meaningfulTags.includes(target.tagName)) break;
      if (target.textContent && target.textContent.trim().length > 0 && target.textContent.trim().length < 100) break;
      target = target.parentElement;
    }

    let text = '';
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      text = target.placeholder || target.getAttribute('aria-label') || '';
    } else {
      text = getDirectText(target);
    }

    return {
      elementTag: target.tagName,
      elementText: text,
      elementId: target.id || '',
      elementClass: target.className && typeof target.className === 'string'
        ? target.className.split(' ').slice(0, 3).join(' ') : '',
      inputValue: (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
        ? target.value
        : (target.tagName === 'SELECT' ? target.options[target.selectedIndex]?.text : ''),
      inputType: target.type || '',
      placeholder: target.placeholder || '',
      role: target.getAttribute('role') || '',
      url: window.location.href
    };
  }

  function getDirectText(el) {
    let text = '';
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
      else if (node.nodeType === Node.ELEMENT_NODE &&
               ['SPAN', 'STRONG', 'EM', 'B', 'I', 'SMALL'].includes(node.tagName))
        text += node.textContent;
    }
    text = text.trim();
    if (!text && el.innerText) text = el.innerText.substring(0, 100);
    return text;
  }

  // ── Click / change capture ─────────────────────────────────────────────────

  function handleClick(e) {
    if (e.button !== 0 || e.ctrlKey || e.metaKey) return;
    // Never capture clicks on the Chingu overlay itself
    if (e.target.closest && e.target.closest('#__chingu_overlay__')) return;
    chrome.runtime.sendMessage({ action: 'clickCaptured', ...getElementInfo(e.target) });
  }

  function handleChange(e) {
    const tag = e.target.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return;
    if (e.target.closest && e.target.closest('#__chingu_overlay__')) return;
    chrome.runtime.sendMessage({ action: 'clickCaptured', ...getElementInfo(e.target) });
  }

  document.addEventListener('click', handleClick, true);
  document.addEventListener('change', handleChange, true);

  // ── Message listener ───────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'stopListening') {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('change', handleChange, true);
      window.__chinguListening = false;
      removeOverlay();
    }
    if (msg.action === 'updateStepCount') {
      updateOverlayCount(msg.count);
    }
    if (msg.action === 'showSuccessToast') {
      showSuccessToast(msg.stepCount, msg.viewUrl);
    }
  });

  // Inject overlay immediately — recording has started by the time this runs
  injectOverlay();
}
