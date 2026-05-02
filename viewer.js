// ── State ──────────────────────────────────────────────────────────────────
const stepsContainer = document.getElementById('stepsContainer');
const emptyState     = document.getElementById('emptyState');
const guideTitle     = document.getElementById('guideTitle');
const guideMeta      = document.getElementById('guideMeta');
const guideSubtitle  = document.getElementById('guideSubtitle');
const guideSubtitleDisplay = document.getElementById('guideSubtitleDisplay');
const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightboxImg');

let currentSteps    = [];   // flat array: step objects + section markers (_type:'section')
let currentTitle    = 'Untitled Guide';
let guideMetadata   = {
  subtitle: '', version: '1.0', date: '', author: '', company: '', confidential: 'Confidential'
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function sectionLetter(idx) { return LETTERS[idx % 26] || String(idx + 1); }
function genId() { return '_' + Math.random().toString(36).slice(2, 9); }

// ── Render ─────────────────────────────────────────────────────────────────

function renderSteps(items, title) {
  currentSteps = items.map(s => ({ ...s }));
  currentTitle = title || 'Untitled Guide';

  const realSteps = items.filter(s => !s._type);
  guideTitle.textContent = currentTitle;
  guideSubtitle.textContent = `${realSteps.length} steps`;
  guideSubtitleDisplay.textContent = guideMetadata.subtitle || '';

  const firstStep = realSteps[0];
  const dateStr = firstStep
    ? new Date(firstStep.timestamp).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
    : '';
  const parts = [];
  if (guideMetadata.version) parts.push(`v${guideMetadata.version}`);
  if (guideMetadata.date)    parts.push(guideMetadata.date);
  if (guideMetadata.author)  parts.push(`by ${guideMetadata.author}`);
  if (dateStr && !guideMetadata.date) parts.push(`Created ${dateStr}`);
  guideMeta.textContent = parts.join(' · ');

  stepsContainer.innerHTML = '';

  let sectionCount = 0;
  items.forEach((item, idx) => {
    if (item._type === 'section') {
      stepsContainer.appendChild(buildSectionEl(item, idx, sectionCount));
      sectionCount++;
    } else {
      stepsContainer.appendChild(buildStepEl(item, idx));
    }
  });

  initDragDrop();
}

// ── Build section divider element ──────────────────────────────────────────

function buildSectionEl(section, arrayIdx, letterIdx) {
  const el = document.createElement('div');
  el.className = 'section-divider';
  el.dataset.arrayIndex = arrayIdx;
  el.innerHTML = `
    <div class="section-letter-badge">${sectionLetter(letterIdx)}</div>
    <div class="section-title-edit" contenteditable="true">${escapeHtml(section.title || 'New Section')}</div>
    <div class="section-controls">
      <button class="section-del-btn" data-array-index="${arrayIdx}" title="Delete section">× Remove</button>
    </div>
  `;
  return el;
}

// ── Build step element ─────────────────────────────────────────────────────

function buildStepEl(step, arrayIdx) {
  const el = document.createElement('div');
  el.className = 'step';
  el.dataset.arrayIndex = arrayIdx;

  const hasNote = step.note && step.note.trim();
  const noteType = step.noteType || 'info';
  const noteIcon = noteType === 'warning' ? '⚠' : 'ℹ';
  const noteClass = noteType === 'warning' ? 'note-warning' : 'note-info';

  el.innerHTML = `
    <div class="step-controls">
      <span class="drag-handle" title="Drag to reorder">⠿</span>
      <button class="ctrl-btn add-section" data-array-index="${arrayIdx}" title="Add section before this step">§ Section</button>
      <button class="ctrl-btn note-btn ${hasNote ? 'note-active' : ''}" data-array-index="${arrayIdx}" title="Add info note">ℹ Note</button>
      <button class="ctrl-btn delete" data-array-index="${arrayIdx}" title="Delete step">× Delete</button>
    </div>
    <div class="step-header">
      <div class="step-number">${step.number}</div>
      <div style="flex:1;min-width:0">
        <div class="step-description" contenteditable="true">${escapeHtml(step.description)}</div>
        <div class="step-url">${escapeHtml(step.url)}</div>
      </div>
    </div>
    ${hasNote ? `
      <div class="note-callout ${noteClass}">
        <span class="note-icon">${noteIcon}</span>
        <div class="note-text" contenteditable="true" data-placeholder="Add a tip or warning...">${escapeHtml(step.note)}</div>
        <button class="note-remove" data-array-index="${arrayIdx}">×</button>
      </div>
      <div class="note-type-toggle">
        <button class="note-type-btn ${noteType === 'info' ? 'active-info' : ''}" data-array-index="${arrayIdx}" data-type="info">ℹ Info</button>
        <button class="note-type-btn ${noteType === 'warning' ? 'active-warning' : ''}" data-array-index="${arrayIdx}" data-type="warning">⚠ Warning</button>
      </div>
    ` : ''}
    <div class="screenshot-wrap">
      <img class="step-screenshot" src="${step.screenshot}" alt="Step ${step.number}" loading="lazy">
      <button class="annotate-btn" data-array-index="${arrayIdx}">✏ Annotate</button>
    </div>
  `;
  return el;
}

// ── Sync state from DOM ────────────────────────────────────────────────────

function syncAll() {
  // Only sync container elements (.step and .section-divider), not inner buttons
  stepsContainer.querySelectorAll('.step, .section-divider').forEach(el => {
    const idx = parseInt(el.dataset.arrayIndex);
    if (isNaN(idx)) return;
    const item = currentSteps[idx];
    if (!item) return;

    if (item._type === 'section') {
      const titleEl = el.querySelector('.section-title-edit');
      if (titleEl) item.title = titleEl.textContent.trim();
    } else {
      const descEl = el.querySelector('.step-description');
      if (descEl) item.description = descEl.textContent.trim();
      const noteEl = el.querySelector('.note-text');
      if (noteEl) item.note = noteEl.textContent.trim();
    }
  });
  currentTitle = guideTitle.textContent.trim() || 'Untitled Guide';
}

// ── Drag and drop (steps only) ─────────────────────────────────────────────

function initDragDrop() {
  let srcIdx = null;

  stepsContainer.querySelectorAll('.step').forEach(stepEl => {
    const handle = stepEl.querySelector('.drag-handle');
    handle.addEventListener('mousedown', () => { stepEl.draggable = true; });
    stepEl.addEventListener('dragend', () => { stepEl.draggable = false; });

    stepEl.addEventListener('dragstart', e => {
      srcIdx = parseInt(stepEl.dataset.arrayIndex);
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => stepEl.classList.add('dragging'), 0);
    });
    stepEl.addEventListener('dragend', () => {
      stepEl.classList.remove('dragging');
      stepsContainer.querySelectorAll('.step').forEach(s => s.classList.remove('drag-over'));
    });
    stepEl.addEventListener('dragover', e => {
      e.preventDefault();
      stepsContainer.querySelectorAll('.step').forEach(s => s.classList.remove('drag-over'));
      stepEl.classList.add('drag-over');
    });
    stepEl.addEventListener('drop', e => {
      e.preventDefault();
      const tgtIdx = parseInt(stepEl.dataset.arrayIndex);
      if (srcIdx === null || srcIdx === tgtIdx) return;

      syncAll();
      const moved = currentSteps.splice(srcIdx, 1)[0];
      // Adjust target index after splice
      const adjustedTgt = tgtIdx > srcIdx ? tgtIdx - 1 : tgtIdx;
      currentSteps.splice(adjustedTgt, 0, moved);
      renumberSteps();
      renderSteps(currentSteps, currentTitle);
    });
  });
}

// ── Event delegation ───────────────────────────────────────────────────────

stepsContainer.addEventListener('click', e => {
  const arrayIdx = parseInt(e.target.dataset?.arrayIndex ?? -1);

  // Delete step
  if (e.target.classList.contains('delete')) {
    syncAll();
    currentSteps.splice(arrayIdx, 1);
    renumberSteps();
    renderSteps(currentSteps, currentTitle);
    return;
  }

  // Delete section
  if (e.target.classList.contains('section-del-btn')) {
    syncAll();
    currentSteps.splice(arrayIdx, 1);
    renderSteps(currentSteps, currentTitle);
    return;
  }

  // Add section before this step
  if (e.target.classList.contains('add-section')) {
    syncAll();
    const section = { _type: 'section', id: genId(), title: 'New Section' };
    currentSteps.splice(arrayIdx, 0, section);
    renderSteps(currentSteps, currentTitle);
    // Focus section title for rename
    setTimeout(() => {
      const newEl = stepsContainer.querySelector(`[data-array-index="${arrayIdx}"] .section-title-edit`);
      if (newEl) { newEl.focus(); selectAll(newEl); }
    }, 50);
    return;
  }

  // Toggle note
  if (e.target.classList.contains('note-btn')) {
    syncAll();
    const item = currentSteps[arrayIdx];
    if (!item || item._type) return;
    if (item.note && item.note.trim()) {
      item.note = '';
    } else {
      item.note = ' '; item.noteType = 'info';
    }
    renderSteps(currentSteps, currentTitle);
    setTimeout(() => {
      const noteEl = stepsContainer.querySelector(`[data-array-index="${arrayIdx}"] .note-text`);
      if (noteEl) { noteEl.focus(); noteEl.textContent = ''; }
    }, 50);
    return;
  }

  // Remove note
  if (e.target.classList.contains('note-remove')) {
    syncAll();
    const item = currentSteps[arrayIdx];
    if (item) { item.note = ''; item.noteType = 'info'; }
    renderSteps(currentSteps, currentTitle);
    return;
  }

  // Toggle note type
  if (e.target.classList.contains('note-type-btn')) {
    syncAll();
    const item = currentSteps[arrayIdx];
    if (item) item.noteType = e.target.dataset.type;
    renderSteps(currentSteps, currentTitle);
    return;
  }

  // Annotate button
  if (e.target.classList.contains('annotate-btn')) {
    openAnnotation(arrayIdx);
    return;
  }

  // Lightbox (click on image directly)
  if (e.target.classList.contains('step-screenshot')) {
    lightboxImg.src = e.target.src;
    lightbox.classList.add('active');
  }
});

lightbox.addEventListener('click', () => lightbox.classList.remove('active'));

// ── Helpers ────────────────────────────────────────────────────────────────

function renumberSteps() {
  let n = 1;
  currentSteps.forEach(s => { if (!s._type) s.number = n++; });
}

function selectAll(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
}

// ── Guide Setup ────────────────────────────────────────────────────────────

const setupModal = document.getElementById('setupModal');

// Wire color picker ↔ hex input once, not on every open
const _gsHex = document.getElementById('gsAccentColorHex');
const _gsPicker = document.getElementById('gsAccentColor');
_gsHex.addEventListener('input', () => { if (/^#[0-9A-Fa-f]{6}$/.test(_gsHex.value)) _gsPicker.value = _gsHex.value; });
_gsPicker.addEventListener('input', () => { _gsHex.value = _gsPicker.value; });

document.getElementById('btnSetup').addEventListener('click', () => {

  document.getElementById('gsTitle').value       = currentTitle;
  document.getElementById('gsSubtitle').value    = guideMetadata.subtitle || '';
  document.getElementById('gsVersion').value     = guideMetadata.version || '';
  document.getElementById('gsDate').value        = guideMetadata.date || '';
  document.getElementById('gsAuthor').value      = guideMetadata.author || '';
  document.getElementById('gsCompany').value     = guideMetadata.company || '';
  document.getElementById('gsConfidential').value  = guideMetadata.confidential || 'Confidential';
  document.getElementById('gsAccentColorHex').value = guideMetadata.accentColor  || '#6366F1';
  document.getElementById('gsAccentColor').value    = guideMetadata.accentColor  || '#6366F1';
  setupModal.classList.add('active');
});

document.getElementById('setupCancel').addEventListener('click', () => setupModal.classList.remove('active'));

document.getElementById('setupSave').addEventListener('click', () => {
  currentTitle = document.getElementById('gsTitle').value.trim() || 'Untitled Guide';
  guideMetadata.subtitle     = document.getElementById('gsSubtitle').value.trim();
  guideMetadata.version      = document.getElementById('gsVersion').value.trim();
  guideMetadata.date         = document.getElementById('gsDate').value.trim();
  guideMetadata.author       = document.getElementById('gsAuthor').value.trim();
  guideMetadata.company      = document.getElementById('gsCompany').value.trim();
  guideMetadata.confidential = document.getElementById('gsConfidential').value.trim() || 'Confidential';
  guideMetadata.accentColor  = document.getElementById('gsAccentColorHex').value.trim() || '#6366F1';
  setupModal.classList.remove('active');
  renderSteps(currentSteps, currentTitle);
  chrome.storage.local.set({ guideTitle: currentTitle, guideMetadata });
});

// ── Save ───────────────────────────────────────────────────────────────────

document.getElementById('btnSave').addEventListener('click', () => {
  syncAll();

  const savePayload = () => {
    const btn = document.getElementById('btnSave');
    btn.textContent = 'Saved ✓';
    btn.style.cssText = 'background:linear-gradient(135deg,#10B981,#059669);color:white;border-color:transparent';
    setTimeout(() => { btn.textContent = 'Save'; btn.style.cssText = ''; }, 2000);
  };

  if (_docId) {
    // Save back into the documents array
    chrome.storage.local.get('documents', data => {
      const docs = data.documents || [];
      const idx  = docs.findIndex(d => d.id === _docId);
      const now  = Date.now();
      const entry = {
        id: _docId,
        title: currentTitle,
        steps: currentSteps,
        metadata: guideMetadata,
        brandLogo: brandLogoEl.classList.contains('visible') ? brandLogoEl.src : null,
        createdAt: idx >= 0 ? (docs[idx].createdAt || now) : now,
        updatedAt: now,
      };
      if (idx >= 0) docs[idx] = entry; else docs.unshift(entry);
      chrome.storage.local.set({ documents: docs }, savePayload);
    });
  } else {
    // Legacy flat storage
    chrome.storage.local.set({ steps: currentSteps, guideTitle: currentTitle, guideMetadata }, savePayload);
  }
});

// ── Doc ID from URL ────────────────────────────────────────────────────────

const _docId = new URLSearchParams(window.location.search).get('docId') || null;

// ── Library back button ────────────────────────────────────────────────────

document.getElementById('btnLibrary').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('library.html') });
});

// ── Initial load ───────────────────────────────────────────────────────────

function loadDoc(docId) {
  if (docId) {
    // Load specific document from documents array
    chrome.storage.local.get(['documents', 'brandLogo'], data => {
      const docs = data.documents || [];
      const doc  = docs.find(d => d.id === docId);
      if (!doc) {
        emptyState.classList.remove('hidden');
        document.getElementById('brandingSection').style.display = 'none';
        return;
      }
      if (doc.metadata) Object.assign(guideMetadata, doc.metadata);
      if (doc.brandLogo) {
        brandLogoEl.src = doc.brandLogo;
        brandLogoEl.classList.add('visible');
      } else if (data.brandLogo) {
        brandLogoEl.src = data.brandLogo;
        brandLogoEl.classList.add('visible');
      }
      initViewer(doc.steps || [], doc.title || 'Untitled Guide');
    });
  } else {
    // Legacy: load from flat storage keys
    chrome.storage.local.get(['steps', 'guideTitle', 'guideMetadata', 'brandLogo'], data => {
      const rawSteps = data.steps || [];
      if (data.guideMetadata) Object.assign(guideMetadata, data.guideMetadata);
      if (data.brandLogo) {
        brandLogoEl.src = data.brandLogo;
        brandLogoEl.classList.add('visible');
      }
      initViewer(rawSteps, data.guideTitle || 'Untitled Guide');
    });
  }
}

function initViewer(rawSteps, titleStr) {
  if (rawSteps.length === 0) {
    emptyState.classList.remove('hidden');
    document.getElementById('brandingSection').style.display = 'none';
    return;
  }
  emptyState.classList.add('hidden');

  const onlySteps = rawSteps.filter(s => !s._type);
  const sections  = rawSteps.filter(s => s._type === 'section');
  const polished  = window.ChinguPolish
    ? window.ChinguPolish.polish(onlySteps)
    : { title: titleStr, steps: onlySteps };

  const merged = [...polished.steps];
  sections.forEach(sec => {
    const insertAt = merged.findIndex(s => s.number >= (sec._afterNumber || 1));
    merged.splice(insertAt < 0 ? 0 : insertAt, 0, sec);
  });
  renderSteps(merged, titleStr || polished.title);
}

loadDoc(_docId);

// ── Auto-Polish ────────────────────────────────────────────────────────────
// Runs on currentSteps (the live in-memory state), never re-reads storage.
// Preserves section dividers, user edits, annotations, and the current title.

document.getElementById('btnPolish').addEventListener('click', () => {
  syncAll();

  const onlySteps = currentSteps.filter(s => !s._type);
  const sections  = currentSteps.filter(s => s._type === 'section');

  if (!onlySteps.length) return;

  const polished = window.ChinguPolish
    ? window.ChinguPolish.polish(onlySteps)
    : { steps: onlySteps };

  const removed = onlySteps.length - polished.steps.length;

  // Re-merge sections at their original positions
  const merged = [...polished.steps];
  sections.forEach(sec => {
    const insertAt = merged.findIndex(s => s.number >= (sec._afterNumber || 1));
    merged.splice(insertAt < 0 ? 0 : insertAt, 0, sec);
  });

  renderSteps(merged, currentTitle); // keep the user's saved title

  const btn = document.getElementById('btnPolish');
  btn.textContent = removed > 0 ? `Removed ${removed} duplicates` : 'Already clean!';
  setTimeout(() => { btn.textContent = '✨ Polish'; }, 2500);
});

// ── Copy link ──────────────────────────────────────────────────────────────

document.getElementById('btnCopy').addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.getElementById('btnCopy');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000);
  });
});

// ── Brand logo ─────────────────────────────────────────────────────────────

const brandModal = document.getElementById('brandModal');
const brandLogoEl = document.getElementById('brandLogo');

document.getElementById('btnBrand').addEventListener('click', () => brandModal.classList.add('active'));
document.getElementById('brandCancel').addEventListener('click', () => brandModal.classList.remove('active'));

document.getElementById('brandRemove').addEventListener('click', () => {
  brandLogoEl.src = '';
  brandLogoEl.classList.remove('visible');
  brandModal.classList.remove('active');
  chrome.storage.local.remove('brandLogo');
});

document.getElementById('brandSave').addEventListener('click', () => {
  const file = document.getElementById('logoUpload').files[0];
  if (!file) { brandModal.classList.remove('active'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    brandLogoEl.src = e.target.result;
    brandLogoEl.classList.add('visible');
    brandModal.classList.remove('active');
    chrome.storage.local.set({ brandLogo: e.target.result });
  };
  reader.readAsDataURL(file);
});

chrome.storage.local.get('brandLogo', data => {
  if (data.brandLogo) {
    brandLogoEl.src = data.brandLogo;
    brandLogoEl.classList.add('visible');
  }
});

// ══════════════════════════════════════════════════════════════════════════
// PDF EXPORT — InBody-quality landscape 16:9 format
// Page: 254×143mm (= 720×405 pts, matching InBody's exact proportions)
// ══════════════════════════════════════════════════════════════════════════

document.getElementById('btnPdf').addEventListener('click', async () => {
  syncAll();

  const btn = document.getElementById('btnPdf');
  btn.textContent = 'Building PDF…';
  btn.disabled = true;

  try {
    const { jsPDF } = window.jspdf;
    // Landscape 16:9 — matches InBody's 720×405 pt format exactly
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [254, 143] });
    const W   = 254;   // page width mm
    const H   = 143;   // page height mm
    const ML  = 10;    // margin left
    const MR  = 10;    // margin right
    const CW  = W - ML - MR;  // 234mm usable width

    const title     = currentTitle || 'Untitled Guide';
    const meta      = guideMetadata;
    const logoData  = brandLogoEl.src && brandLogoEl.classList.contains('visible') ? brandLogoEl.src : null;
    const company   = meta.company  || 'Chingu';
    const confLabel = meta.confidential || 'Confidential';
    const footerTxt = `© ${company}  |  ${confLabel}`;

    // ── Brand color setup ─────────────────────────────────────────────────
    // Parse accent color from metadata (set in Guide Setup)
    function hexRgb(hex) {
      const h = (hex || '#6366F1').replace('#', '');
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    }
    function darken([r,g,b], f=0.7) { return [Math.round(r*f), Math.round(g*f), Math.round(b*f)]; }
    function lighten([r,g,b], f=0.92) { return [Math.round(255-(255-r)*f), Math.round(255-(255-g)*f), Math.round(255-(255-b)*f)]; }

    const AC  = hexRgb(meta.accentColor || '#6366F1');  // accent
    const ACD = darken(AC, 0.72);                        // dark accent (stripe, footer)
    const ACL = lighten(AC, 0.88);                       // light accent (cream header bg)

    // InBody layout constants (all in mm for 254×143 page)
    const HDR_H  = 7.5;   // header bar height
    const FTR_H  = 10;    // footer bar height
    const FTR_Y  = H - FTR_H;  // footer starts at y=133
    const BADGE_H = 7;    // step badge height at bottom of screenshot

    // Collect items
    const items = currentSteps;
    const steps = items.filter(s => !s._type);

    // Pre-load all screenshots
    btn.textContent = 'Loading images…';
    const imgCache = {};
    for (const step of steps) {
      if (step.screenshot) {
        try { imgCache[step.screenshot] = await loadImage(step.screenshot); } catch {}
      }
    }

    // ── SHARED HELPERS ────────────────────────────────────────────────────

    // Thin cream header bar on every page (InBody style)
    function drawHeader() {
      // Cream background strip
      doc.setFillColor(...ACL);
      doc.rect(0, 0, W, HDR_H, 'F');
      // Thin accent bottom-border of header
      doc.setFillColor(...ACD);
      doc.rect(0, HDR_H - 0.6, W, 0.6, 'F');
      // Document title right-aligned in header
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...ACD);
      doc.text(title, W - MR, HDR_H - 2.2, { align: 'right' });
    }

    // Accent footer bar on every page
    function drawFooter() {
      doc.setFillColor(...AC);
      doc.rect(0, FTR_Y, W, FTR_H, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(footerTxt, W / 2, FTR_Y + FTR_H / 2 + 2.5, { align: 'center' });
      // Logo in footer-left if available
      if (logoData) {
        try { doc.addImage(logoData, 'JPEG', ML, FTR_Y + 1.5, 18, FTR_H - 3); } catch {
          try { doc.addImage(logoData, 'PNG', ML, FTR_Y + 1.5, 18, FTR_H - 3); } catch {}
        }
      }
    }

    // ── 1. COVER PAGE ─────────────────────────────────────────────────────
    btn.textContent = 'Building cover…';

    // Full page: accent color
    doc.setFillColor(...AC);
    doc.rect(0, 0, W, H, 'F');

    // Top cream band (top 19.5% of page = 28mm) — matching InBody's layout
    const COVER_CREAM_H = 28;
    doc.setFillColor(...ACL);
    doc.rect(0, 0, W, COVER_CREAM_H, 'F');

    // Dark thin separator
    doc.setFillColor(...ACD);
    doc.rect(0, COVER_CREAM_H, W, 1.4, 'F');

    // "User Manual" label in cream area
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...ACD);
    doc.text('USER MANUAL', ML, 10, { charSpace: 1.5 });

    // Company name in cream area
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...AC);
    doc.text(company.toUpperCase(), ML, 22, { charSpace: 0.5 });

    // Guide title (in main accent area)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    const titleLines = doc.splitTextToSize(title, CW - 30);
    doc.text(titleLines, ML, 46);

    // Subtitle
    if (meta.subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      const subLines = doc.splitTextToSize(meta.subtitle, CW - 30);
      doc.text(subLines, ML, 46 + titleLines.length * 9.5 + 4);
    }

    // Metadata (version, date, author) near bottom of main area
    const metaParts = [];
    if (meta.version) metaParts.push(`Version ${meta.version}`);
    if (meta.date)    metaParts.push(meta.date);
    if (meta.author)  metaParts.push(`Created By ${meta.author}(${company})`);
    if (metaParts.length) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(metaParts.join('  |  '), ML, FTR_Y - 6);
    }

    // Logo in top-right of cream area (fixed safe dimensions)
    if (logoData) {
      try { doc.addImage(logoData, 'JPEG', W - 52, 3, 40, 22); } catch {
        try { doc.addImage(logoData, 'PNG', W - 52, 3, 40, 22); } catch {}
      }
    }

    // Footer
    doc.setFillColor(...ACD);
    doc.rect(0, FTR_Y, W, FTR_H, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(footerTxt, W / 2, FTR_Y + FTR_H / 2 + 2.5, { align: 'center' });

    // ── 2. TABLE OF CONTENTS ──────────────────────────────────────────────
    btn.textContent = 'Building TOC…';
    doc.addPage();
    drawHeader();
    drawFooter();

    // "Table of Contents" heading
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Table of Contents', ML, 21);
    doc.setFillColor(...AC);
    doc.rect(ML, 23, 42, 1.5, 'F');

    // Gather sections
    const sectionList = [];
    let secLetterIdx = 0;
    items.forEach(item => {
      if (item._type === 'section') {
        sectionList.push({ letter: sectionLetter(secLetterIdx++), title: item.title || 'Section' });
      }
    });
    if (sectionList.length === 0) {
      sectionList.push({ letter: '—', title: title });
    }

    // 2-column layout (like InBody: A-D left, E-H right)
    const half = Math.ceil(sectionList.length / 2);
    const colW  = (CW - 10) / 2;
    const tocStartY = 30;

    sectionList.forEach((sec, idx) => {
      const col   = idx < half ? 0 : 1;
      const row   = idx < half ? idx : idx - half;
      const tocX  = ML + col * (colW + 10);
      const tocY  = tocStartY + row * 12;

      // Accent letter badge
      doc.setFillColor(...AC);
      doc.roundedRect(tocX, tocY - 5, 9, 8, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(sec.letter, tocX + 4.5, tocY, { align: 'center' });

      // Section title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const maxTitleW = colW - 14;
      const truncTitle = doc.splitTextToSize(sec.title, maxTitleW)[0];
      doc.text(truncTitle, tocX + 13, tocY);
    });

    // ── 3. SECTION + STEP PAGES ───────────────────────────────────────────
    btn.textContent = 'Building steps…';
    let currentSecLetterIdx = 0;
    let i = 0;

    while (i < items.length) {
      const item = items[i];

      if (item._type === 'section') {
        // ── SECTION DIVIDER PAGE (InBody style) ──────────────────────────
        doc.addPage();
        const letter   = sectionLetter(currentSecLetterIdx++);
        const secTitle = item.title || 'Section';

        // White background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, W, H, 'F');

        // Thin header
        drawHeader();

        // Left accent stripe (like InBody's left color bar)
        doc.setFillColor(...AC);
        doc.rect(0, HDR_H, 8, FTR_Y - HDR_H, 'F');

        // Large section letter — accent color, large
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(56);
        doc.setTextColor(...AC);
        doc.text(letter + '.', 22, 72);

        // Section title below the letter
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        const stLines = doc.splitTextToSize(secTitle, CW - 20);
        doc.text(stLines, 22, 86);

        drawFooter();
        i++;

      } else {
        // ── STEP PAGE ─────────────────────────────────────────────────────
        const step = item;
        doc.addPage();

        // White background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, W, H, 'F');

        drawHeader();
        drawFooter();

        // ── Step description area (between header and screenshot) ─────────
        const DESC_T = HDR_H + 1.5;   // description top
        const DESC_H = 9;              // description strip height
        const SHOT_T = DESC_T + DESC_H + 1;  // screenshot top

        // "Step N" label — bold accent
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...AC);
        doc.text(`Step ${step.number}`, ML, DESC_T + 6.5);

        // Description text (beside step label)
        const stepNumW = doc.getTextWidth(`Step ${step.number}`) + 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        const descAvailW = CW - stepNumW;
        const descLine1 = doc.splitTextToSize(step.description || '', descAvailW)[0] || '';
        doc.text(descLine1, ML + stepNumW, DESC_T + 6.5);

        // If description has a second line, shift screenshot down slightly
        const descFull = doc.splitTextToSize(step.description || '', descAvailW);
        let extraDescH = 0;
        if (descFull.length > 1) {
          doc.text(descFull[1], ML + stepNumW, DESC_T + 11);
          extraDescH = 5;
        }

        const SHOT_TOP = SHOT_T + extraDescH;

        // ── Note callout (if any) — tight strip above screenshot ──────────
        let noteH = 0;
        if (step.note && step.note.trim()) {
          const isWarn   = step.noteType === 'warning';
          const nbg      = isWarn ? [255, 251, 235] : [239, 246, 255];
          const nborder  = isWarn ? [253, 230, 138] : [191, 219, 254];
          const ntxt     = isWarn ? [120, 53, 15]   : [29, 78, 216];
          const icon     = isWarn ? '! ' : 'i ';

          const noteTxt  = icon + step.note.trim();
          const nLines   = doc.splitTextToSize(noteTxt, CW - 4);
          noteH = nLines.length * 4 + 5;

          doc.setFillColor(...nbg);
          doc.roundedRect(ML, SHOT_TOP, CW, noteH, 2, 2, 'F');
          doc.setDrawColor(...nborder);
          doc.setLineWidth(0.3);
          doc.roundedRect(ML, SHOT_TOP, CW, noteH, 2, 2, 'S');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(...ntxt);
          doc.text(nLines, ML + 3, SHOT_TOP + 4, { lineHeightFactor: 1.4 });
          noteH += 1.5;
        }

        // ── Screenshot fills remaining space (InBody style — dominates page) ──
        const SHOT_Y    = SHOT_TOP + noteH;
        const BADGE_Y   = FTR_Y - BADGE_H - 1;  // badge sits above footer
        const MAX_IMG_H = BADGE_Y - SHOT_Y - 1;
        const MAX_IMG_W = CW;

        if (step.screenshot && imgCache[step.screenshot]) {
          const img    = imgCache[step.screenshot];
          const ratio  = img.naturalHeight / img.naturalWidth;
          let   imgW   = MAX_IMG_W;
          let   imgH   = imgW * ratio;

          if (imgH > MAX_IMG_H) {
            imgH = MAX_IMG_H;
            imgW = imgH / ratio;
          }

          const imgX = ML + (MAX_IMG_W - imgW) / 2;

          // Dark accent border (matching InBody's screenshot border)
          doc.setFillColor(...ACD);
          doc.roundedRect(imgX - 1, SHOT_Y - 1, imgW + 2, imgH + 2, 2, 2, 'F');

          doc.addImage(step.screenshot, 'PNG', imgX, SHOT_Y, imgW, imgH);
        }

        // ── Step number badge (bottom-left corner, InBody style) ──────────
        doc.setFillColor(...ACD);
        doc.rect(ML, BADGE_Y, 14, BADGE_H, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(String(step.number), ML + 7, BADGE_Y + BADGE_H - 1.8, { align: 'center' });

        i++;
      }
    }

    // ── Save ──────────────────────────────────────────────────────────────
    const filename = title.replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '-') || 'guide';
    doc.save(`${filename}.pdf`);

  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed: ' + err.message);
  } finally {
    btn.textContent = 'Export PDF';
    btn.disabled = false;
  }
});

// ══════════════════════════════════════════════════════════════════════════
// ANNOTATION ENGINE
// ══════════════════════════════════════════════════════════════════════════

(function initAnnotationEngine() {
  const modal   = document.getElementById('annotateModal');
  const canvas  = document.getElementById('annotateCanvas');
  const ctx     = canvas.getContext('2d');

  let annStepIdx  = null;
  let history     = [];          // undo stack of dataURLs
  let tool        = 'arrow';
  let color       = '#EF4444';
  let lineWidth   = 3;
  let isDrawing   = false;
  let sx = 0, sy = 0;            // drag start coords
  let penPoints   = [];          // for freehand pen
  let scale       = 1;           // canvas px / natural image px
  let badgeCount  = 0;           // auto-increment for number badges

  // ── Tool / color / thickness buttons ──────────────────────────────────

  document.querySelectorAll('[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-tool]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tool = btn.dataset.tool;
      canvas.style.cursor = tool === 'text' ? 'text' : 'crosshair';
    });
  });

  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      color = dot.dataset.color;
    });
  });

  document.querySelectorAll('.thick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.thick-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      lineWidth = parseInt(btn.dataset.w);
    });
  });

  // ── Open ──────────────────────────────────────────────────────────────

  window.openAnnotation = function(arrayIdx) {
    annStepIdx = arrayIdx;
    const step = currentSteps[arrayIdx];
    if (!step || !step.screenshot) return;

    const img = new Image();
    img.onload = () => {
      const maxW = window.innerWidth  * 0.92;
      const maxH = (window.innerHeight - 80) * 0.90;
      scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);

      canvas.width  = Math.round(img.naturalWidth  * scale);
      canvas.height = Math.round(img.naturalHeight * scale);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      badgeCount = 0;
      const initSnap = canvas.toDataURL();
      history = [initSnap];
      // Pre-load the initial snapshot into cache so it restores synchronously
      const initImg = new Image();
      initImg.src = initSnap;
      imgSnapshotCache.set(initSnap, initImg);

      modal.classList.add('active');
    };
    img.src = step.screenshot;
  };

  // ── Close / cancel ────────────────────────────────────────────────────

  document.getElementById('annCancel').addEventListener('click', closeAnnotation);
  function closeAnnotation() {
    modal.classList.remove('active');
    annStepIdx = null;
    history = [];
  }

  // ── Undo ──────────────────────────────────────────────────────────────

  document.getElementById('annUndo').addEventListener('click', () => {
    if (history.length <= 1) return;
    history.pop();
    restoreSnapshot(history[history.length - 1]);
  });

  // ── Clear all ─────────────────────────────────────────────────────────

  document.getElementById('annClear').addEventListener('click', () => {
    if (history.length === 0) return;
    restoreSnapshot(history[0]);
    history = [history[0]];
  });

  // ── Save ──────────────────────────────────────────────────────────────

  document.getElementById('annDone').addEventListener('click', () => {
    if (annStepIdx === null) return;
    const item = currentSteps[annStepIdx];
    if (item) {
      item.screenshot = canvas.toDataURL('image/png');
      // Update the visible thumbnail immediately
      const thumbEl = stepsContainer.querySelector(`[data-array-index="${annStepIdx}"] .step-screenshot`);
      if (thumbEl) thumbEl.src = item.screenshot;
    }
    closeAnnotation();
  });

  // ── Canvas drawing events ─────────────────────────────────────────────

  canvas.addEventListener('mousedown', e => {
    isDrawing = true;
    const r = canvas.getBoundingClientRect();
    sx = e.clientX - r.left;
    sy = e.clientY - r.top;

    if (tool === 'pen') {
      penPoints = [{ x: sx, y: sy }];
    }
    if (tool === 'text') {
      // Text is handled on mouseup/click
    }
  });

  canvas.addEventListener('mousemove', e => {
    if (!isDrawing) return;
    const r  = canvas.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;

    if (tool === 'pen') {
      penPoints.push({ x: cx, y: cy });
      drawPenStroke(penPoints, false);
      return;
    }

    // numberbadge and text/labelbox: no drag preview needed
    if (tool === 'numberbadge' || tool === 'text' || tool === 'labelbox') return;

    // For shape tools: restore last committed state then draw preview
    if (history.length > 0) restoreSnapshot(history[history.length - 1]);
    drawShape(sx, sy, cx, cy);
  });

  canvas.addEventListener('mouseup', e => {
    if (!isDrawing) return;
    isDrawing = false;
    const r  = canvas.getBoundingClientRect();
    const ex = e.clientX - r.left;
    const ey = e.clientY - r.top;

    if (tool === 'text') {
      const label = prompt('Enter label text:');
      if (label) {
        const fs = Math.round(16 / scale);
        ctx.font = `bold ${fs}px Inter, sans-serif`;
        ctx.fillStyle = color;
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.lineWidth = 3;
        ctx.strokeText(label, ex, ey);
        ctx.fillText(label, ex, ey);
        commitSnapshot();
      }
      return;
    }

    if (tool === 'labelbox') {
      // No restore needed — we skip preview for this tool so canvas is clean
      const label = prompt('Enter label text:');
      if (label) {
        drawLabelBox(sx, sy, ex, ey, label);
        commitSnapshot();
      }
      return;
    }

    if (tool === 'numberbadge') {
      badgeCount++;
      drawNumberBadge(ex, ey, badgeCount);
      commitSnapshot();
      return;
    }

    if (tool === 'pen') {
      drawPenStroke(penPoints, true);
    } else {
      if (history.length > 0) restoreSnapshot(history[history.length - 1]);
      drawShape(sx, sy, ex, ey);
    }
    commitSnapshot();
  });

  canvas.addEventListener('mouseleave', () => {
    if (isDrawing && tool !== 'pen') {
      isDrawing = false;
      if (history.length > 0) restoreSnapshot(history[history.length - 1]);
    }
  });

  // ── Drawing primitives ────────────────────────────────────────────────

  function setStyle() {
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = lineWidth;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  }

  function drawShape(x1, y1, x2, y2) {
    setStyle();
    switch (tool) {
      case 'arrow':     drawArrow(x1, y1, x2, y2);     break;
      case 'rect':      drawRect(x1, y1, x2, y2);      break;
      case 'ellipse':   drawEllipse(x1, y1, x2, y2);   break;
      case 'highlight': drawHighlight(x1, y1, x2, y2); break;
    }
  }

  function drawArrow(x1, y1, x2, y2) {
    const headLen = Math.max(14, lineWidth * 4);
    const angle   = Math.atan2(y2 - y1, x2 - x1);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Filled arrowhead
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6),
               y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6),
               y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  function drawRect(x1, y1, x2, y2) {
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  }

  function drawEllipse(x1, y1, x2, y2) {
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    const rx = Math.abs(x2 - x1) / 2, ry = Math.abs(y2 - y1) / 2;
    if (rx < 1 || ry < 1) return;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawHighlight(x1, y1, x2, y2) {
    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 0.38;
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    ctx.globalAlpha = prevAlpha;
  }

  // Filled rounded box with white text centred inside
  function drawLabelBox(x1, y1, x2, y2, label) {
    const x = Math.min(x1, x2), y = Math.min(y1, y2);
    const w = Math.abs(x2 - x1) || 120, h = Math.abs(y2 - y1) || 28;
    const r = Math.min(6, w / 2, h / 2);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fill();

    const fs = Math.max(10, Math.min(h * 0.55, 18));
    ctx.font = `bold ${fs}px Inter, Arial, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2, w - 8);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // Filled circle with white number — auto-increments each click
  function drawNumberBadge(cx, cy, num) {
    const r = Math.max(14, lineWidth * 5);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // White ring
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const fs = r > 16 ? 14 : 11;
    ctx.font = `bold ${fs}px Inter, Arial, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(num), cx, cy + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  function drawPenStroke(pts, final) {
    if (pts.length < 2) return;
    if (!final && history.length > 0) restoreSnapshot(history[history.length - 1]);
    setStyle();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }

  // ── Snapshot helpers ──────────────────────────────────────────────────
  // Keep a parallel cache of pre-loaded Image objects so restoreSnapshot
  // is fully synchronous (no async onload flicker during mousemove preview).

  const imgSnapshotCache = new Map();   // dataUrl → HTMLImageElement

  function commitSnapshot() {
    const dataUrl = canvas.toDataURL();
    history.push(dataUrl);
    if (history.length > 30) {
      imgSnapshotCache.delete(history.shift());
    }
    // Pre-load now so it's ready instantly when needed
    if (!imgSnapshotCache.has(dataUrl)) {
      const img = new Image();
      img.src = dataUrl;
      imgSnapshotCache.set(dataUrl, img);
    }
  }

  function restoreSnapshot(dataUrl) {
    const cached = imgSnapshotCache.get(dataUrl);
    if (cached && cached.complete) {
      ctx.drawImage(cached, 0, 0);
    } else {
      // Fallback: async load (first frame only, no flicker risk)
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0); imgSnapshotCache.set(dataUrl, img); };
      img.src = dataUrl;
    }
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────

  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('active')) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      document.getElementById('annUndo').click();
    }
    if (e.key === 'Escape') closeAnnotation();
  });

})();

// ── loadImage helper ───────────────────────────────────────────────────────

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ── escapeHtml ─────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
