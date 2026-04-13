/**
 * Chingu Autopilot — Content script for autonomous mode.
 * Injected into the page when autopilot is active.
 * Receives instructions and attempts to find + click matching elements.
 */

(function() {
  if (window.__chinguAutopilot) return;
  window.__chinguAutopilot = true;

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action !== 'autopilotStep') return;

    const instruction = (msg.instruction || '').toLowerCase().trim();
    if (!instruction) {
      sendResponse({ ok: false, reason: 'Empty instruction' });
      return;
    }

    const result = executeInstruction(instruction);
    sendResponse(result);
    return true;
  });

  function executeInstruction(instruction) {
    // Parse the instruction into an action + target
    const parsed = parseInstruction(instruction);

    if (parsed.action === 'type') {
      return handleType(parsed);
    }

    if (parsed.action === 'select') {
      return handleSelect(parsed);
    }

    // Default: click
    return handleClick(parsed);
  }

  function parseInstruction(instruction) {
    // "type hello in the search box"
    const typeMatch = instruction.match(/^type\s+["']?(.+?)["']?\s+(?:in|into|on)\s+(.+)$/i);
    if (typeMatch) {
      return { action: 'type', value: typeMatch[1], target: typeMatch[2] };
    }

    // "select Option A from the dropdown"
    const selectMatch = instruction.match(/^select\s+["']?(.+?)["']?\s+(?:from|in)\s+(.+)$/i);
    if (selectMatch) {
      return { action: 'select', value: selectMatch[1], target: selectMatch[2] };
    }

    // "click the Save button" / "click on Settings" / "go to Dashboard"
    const clickMatch = instruction.match(/^(?:click|tap|press|hit|go to|navigate to|open)\s+(?:the\s+|on\s+)?["']?(.+?)["']?$/i);
    if (clickMatch) {
      return { action: 'click', target: clickMatch[1] };
    }

    // Fallback: treat entire instruction as a click target
    return { action: 'click', target: instruction };
  }

  function handleClick(parsed) {
    const target = parsed.target;
    const el = findElement(target);

    if (!el) {
      return { ok: false, reason: `Could not find "${target}" on the page` };
    }

    // Scroll into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Highlight briefly
    highlightElement(el);

    // Click after a short delay (for scroll to finish)
    setTimeout(() => {
      el.click();
    }, 500);

    return {
      ok: true,
      action: 'click',
      element: describeElement(el),
      target
    };
  }

  function handleType(parsed) {
    const el = findElement(parsed.target, ['input', 'textarea']);

    if (!el) {
      return { ok: false, reason: `Could not find "${parsed.target}" input field` };
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlightElement(el);

    setTimeout(() => {
      el.focus();
      el.value = parsed.value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, 500);

    return {
      ok: true,
      action: 'type',
      element: describeElement(el),
      value: parsed.value,
      target: parsed.target
    };
  }

  function handleSelect(parsed) {
    const el = findElement(parsed.target, ['select']);

    if (!el) {
      return { ok: false, reason: `Could not find "${parsed.target}" dropdown` };
    }

    const option = Array.from(el.options).find(o =>
      o.text.toLowerCase().includes(parsed.value.toLowerCase())
    );

    if (!option) {
      return { ok: false, reason: `Could not find option "${parsed.value}" in dropdown` };
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlightElement(el);

    setTimeout(() => {
      el.value = option.value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, 500);

    return {
      ok: true,
      action: 'select',
      element: describeElement(el),
      value: option.text,
      target: parsed.target
    };
  }

  /**
   * Find an element on the page matching a text description.
   * Scoring system: exact text > partial text > aria-label > id > placeholder
   */
  function findElement(target, preferTags) {
    const candidates = [];
    const targetLower = target.toLowerCase().trim();

    // Get all visible, interactive elements
    const allElements = document.querySelectorAll(
      'a, button, input, textarea, select, [role="button"], [role="tab"], ' +
      '[role="menuitem"], [role="link"], [onclick], label, th, td, li, span, div'
    );

    for (const el of allElements) {
      // Skip hidden elements
      if (!isVisible(el)) continue;

      // Skip if preferTags specified and this isn't one
      if (preferTags && !preferTags.includes(el.tagName.toLowerCase())) continue;

      let score = 0;

      // Exact text match (highest)
      const text = getVisibleText(el).toLowerCase();
      if (text === targetLower) score += 100;
      else if (text.includes(targetLower)) score += 60;
      else if (targetLower.includes(text) && text.length > 2) score += 40;

      // Aria label
      const aria = (el.getAttribute('aria-label') || '').toLowerCase();
      if (aria === targetLower) score += 90;
      else if (aria.includes(targetLower)) score += 50;

      // Title attribute
      const title = (el.getAttribute('title') || '').toLowerCase();
      if (title === targetLower) score += 85;
      else if (title.includes(targetLower)) score += 45;

      // ID match
      const id = (el.id || '').toLowerCase().replace(/[-_]/g, ' ');
      if (id === targetLower) score += 80;
      else if (id.includes(targetLower)) score += 35;

      // Placeholder match (for inputs)
      const placeholder = (el.placeholder || '').toLowerCase();
      if (placeholder.includes(targetLower)) score += 70;

      // Name attribute
      const name = (el.getAttribute('name') || '').toLowerCase().replace(/[-_]/g, ' ');
      if (name.includes(targetLower)) score += 30;

      // Boost for interactive elements
      const tag = el.tagName.toLowerCase();
      if (['button', 'a', 'input', 'select', 'textarea'].includes(tag)) score += 10;
      if (el.getAttribute('role') === 'button') score += 10;

      if (score > 0) {
        candidates.push({ el, score });
      }
    }

    // Sort by score, return best match
    candidates.sort((a, b) => b.score - a.score);
    return candidates.length > 0 ? candidates[0].el : null;
  }

  function isVisible(el) {
    if (!el.offsetParent && el.tagName !== 'BODY') return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (parseFloat(style.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    return true;
  }

  function getVisibleText(el) {
    // For inputs, use placeholder or label
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      return el.placeholder || el.getAttribute('aria-label') || '';
    }
    // For others, use direct text content (not deeply nested)
    let text = '';
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
      else if (node.nodeType === Node.ELEMENT_NODE &&
               ['SPAN', 'STRONG', 'EM', 'B', 'I', 'SMALL', 'MARK'].includes(node.tagName)) {
        text += node.textContent;
      }
    }
    text = text.trim();
    if (!text) text = (el.innerText || '').substring(0, 200).trim();
    return text;
  }

  function describeElement(el) {
    const tag = el.tagName.toLowerCase();
    const text = getVisibleText(el).substring(0, 60);
    return `<${tag}>${text || el.id || el.className || 'element'}`;
  }

  function highlightElement(el) {
    const prev = el.style.outline;
    el.style.outline = '3px solid #4F46E5';
    el.style.outlineOffset = '2px';
    setTimeout(() => {
      el.style.outline = prev;
      el.style.outlineOffset = '';
    }, 1500);
  }
})();
