// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 30) return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (d > 0)  return `${d} day${d > 1 ? 's' : ''} ago`;
  if (h > 0)  return `${h} hour${h > 1 ? 's' : ''} ago`;
  if (m > 0)  return `${m} min ago`;
  return 'Just now';
}

function escHtml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Load & render ──────────────────────────────────────────────────────────

let allDocs = [];

function loadAndRender() {
  chrome.storage.local.get(['documents', 'steps', 'guideTitle', 'guideMetadata', 'brandLogo'], data => {
    let docs = data.documents ? [...data.documents] : [];

    // Migrate legacy single-doc if it exists and isn't already in docs
    if (data.steps && data.steps.length > 0) {
      const legacyId = 'doc_legacy';
      const alreadyMigrated = docs.some(d => d.id === legacyId);
      if (!alreadyMigrated) {
        docs.unshift({
          id: legacyId,
          title: data.guideTitle || 'Untitled Guide',
          steps: data.steps,
          metadata: data.guideMetadata || {},
          brandLogo: data.brandLogo || null,
          createdAt: data.steps[0]?.timestamp || Date.now(),
          updatedAt: Date.now(),
        });
        chrome.storage.local.set({ documents: docs });
      }
    }

    allDocs = docs;
    renderDocs(docs);
  });
}

function renderDocs(docs) {
  const grid  = document.getElementById('grid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('docCount');
  count.textContent = docs.length;

  if (docs.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = docs.map(doc => {
    const realSteps = (doc.steps || []).filter(s => !s._type);
    const thumb = realSteps[0]?.screenshot || '';
    const title = escHtml(doc.title || 'Untitled Guide');
    const date  = timeAgo(doc.updatedAt || doc.createdAt || Date.now());

    return `
      <div class="card" data-id="${doc.id}">
        <div class="card-thumb">
          ${thumb
            ? `<img src="${thumb}" alt="" loading="lazy">`
            : `<div class="card-thumb-empty">
                <svg viewBox="0 0 200 200">
                  <ellipse cx="100" cy="112" rx="85" ry="74" fill="#C8956D" opacity="0.5"/>
                  <ellipse cx="100" cy="134" rx="46" ry="28" fill="#E8B98E" opacity="0.5"/>
                </svg>
              </div>`
          }
          <span class="step-badge">${realSteps.length} step${realSteps.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="card-body">
          <div class="card-title">${title}</div>
          <div class="card-meta">Updated ${date}</div>
          <div class="card-actions">
            <button class="btn btn-primary open-btn" data-id="${doc.id}">Open</button>
            <button class="btn btn-delete delete-btn" data-id="${doc.id}">🗑 Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── Open document ──────────────────────────────────────────────────────────

document.getElementById('grid').addEventListener('click', e => {
  // Open
  const openBtn = e.target.closest('.open-btn');
  if (openBtn) {
    const docId = openBtn.dataset.id;
    chrome.storage.local.set({ currentDocId: docId }, () => {
      chrome.tabs.create({ url: chrome.runtime.getURL(`viewer.html?docId=${docId}`) });
    });
    return;
  }

  // Delete
  const delBtn = e.target.closest('.delete-btn');
  if (delBtn) {
    pendingDeleteId = delBtn.dataset.id;
    document.getElementById('confirmOverlay').classList.add('active');
  }
});

// ── Delete confirm ─────────────────────────────────────────────────────────

let pendingDeleteId = null;

document.getElementById('confirmCancel').addEventListener('click', () => {
  pendingDeleteId = null;
  document.getElementById('confirmOverlay').classList.remove('active');
});

document.getElementById('confirmDelete').addEventListener('click', () => {
  if (!pendingDeleteId) return;
  // Capture the id synchronously BEFORE any async calls
  const idToDelete = pendingDeleteId;
  pendingDeleteId = null;
  document.getElementById('confirmOverlay').classList.remove('active');

  chrome.storage.local.get('documents', data => {
    const docs = (data.documents || []).filter(d => d.id !== idToDelete);
    chrome.storage.local.set({ documents: docs }, () => {
      allDocs = docs;
      renderDocs(filterDocs(document.getElementById('searchInput').value));
    });
  });
});

// ── Search ─────────────────────────────────────────────────────────────────

function filterDocs(query) {
  if (!query.trim()) return allDocs;
  const q = query.toLowerCase();
  return allDocs.filter(d => (d.title || '').toLowerCase().includes(q));
}

document.getElementById('searchInput').addEventListener('input', e => {
  renderDocs(filterDocs(e.target.value));
});

// ── New Recording ──────────────────────────────────────────────────────────

document.getElementById('btnNewRecording').addEventListener('click', () => {
  // Focus the extension popup — can't do that from a page, so open a helper tab instruction
  chrome.runtime.sendMessage({ action: 'newRecording' }, () => {
    window.close(); // close library tab
  });
});

// ── Export All (download JSON backup) ─────────────────────────────────────

document.getElementById('btnExportAll').addEventListener('click', () => {
  chrome.storage.local.get('documents', data => {
    const docs = data.documents || [];
    // Export without screenshot data to keep file small — just metadata + descriptions
    const exportData = docs.map(d => ({
      id: d.id,
      title: d.title,
      metadata: d.metadata,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      steps: (d.steps || []).map(s => s._type
        ? s
        : { number: s.number, description: s.description, url: s.url, note: s.note, noteType: s.noteType, timestamp: s.timestamp }
      )
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'chingu-guides-backup.json'; a.click();
    URL.revokeObjectURL(url);
  });
});

// ── Init ───────────────────────────────────────────────────────────────────

loadAndRender();
