// Guard against double-injection
if (!window.__chinguListening) {
  window.__chinguListening = true;

  function getElementInfo(el) {
    // Walk up to find the most meaningful element
    let target = el;
    const meaningfulTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL'];

    // If we clicked a span/svg/img inside a button or link, walk up
    for (let i = 0; i < 5; i++) {
      if (!target.parentElement) break;
      if (meaningfulTags.includes(target.parentElement.tagName)) {
        target = target.parentElement;
        break;
      }
      // Check for role="button" on parent
      if (target.parentElement.getAttribute('role') === 'button') {
        target = target.parentElement;
        break;
      }
      // If current element has meaningful info, stop walking
      if (meaningfulTags.includes(target.tagName)) break;
      if (target.textContent && target.textContent.trim().length > 0 &&
          target.textContent.trim().length < 100) break;
      target = target.parentElement;
    }

    // Get visible text content (not deeply nested text)
    let text = '';
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      text = target.placeholder || target.getAttribute('aria-label') || '';
    } else {
      // Get direct text, not all descendant text (avoids grabbing entire sections)
      text = getDirectText(target);
    }

    return {
      elementTag: target.tagName,
      elementText: text,
      elementId: target.id || '',
      elementClass: target.className && typeof target.className === 'string'
        ? target.className.split(' ').slice(0, 3).join(' ')
        : '',
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
    // Get text from this element and immediate children only
    let text = '';
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE &&
                 ['SPAN', 'STRONG', 'EM', 'B', 'I', 'SMALL'].includes(node.tagName)) {
        text += node.textContent;
      }
    }
    text = text.trim();

    // Fallback: if no direct text, use innerText but truncate
    if (!text && el.innerText) {
      text = el.innerText.substring(0, 100);
    }

    return text;
  }

  function handleClick(e) {
    // Don't capture right-clicks or modifier clicks
    if (e.button !== 0 || e.ctrlKey || e.metaKey) return;

    const info = getElementInfo(e.target);

    chrome.runtime.sendMessage({
      action: 'clickCaptured',
      ...info
    });
  }

  // Also capture input changes (for typed text)
  function handleChange(e) {
    const tag = e.target.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return;

    const info = getElementInfo(e.target);

    chrome.runtime.sendMessage({
      action: 'clickCaptured',
      ...info
    });
  }

  document.addEventListener('click', handleClick, true);
  document.addEventListener('change', handleChange, true);

  // Listen for stop signal
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'stopListening') {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('change', handleChange, true);
      window.__chinguListening = false;
    }
  });
}
