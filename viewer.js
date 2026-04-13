const stepsContainer = document.getElementById('stepsContainer');
const emptyState = document.getElementById('emptyState');
const guideTitle = document.getElementById('guideTitle');
const guideMeta = document.getElementById('guideMeta');
const guideSubtitle = document.getElementById('guideSubtitle');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

// Load steps from storage
chrome.storage.local.get('steps', (data) => {
  const steps = data.steps || [];

  // Always ensure empty state is properly toggled
  if (steps.length === 0) {
    emptyState.classList.remove('hidden');
    document.getElementById('brandingSection').style.display = 'none';
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  // Auto-generate title from first URL
  try {
    const firstUrl = new URL(steps[0].url);
    const hostname = firstUrl.hostname.replace('www.', '');
    guideTitle.textContent = `How to use ${hostname}`;
    guideSubtitle.textContent = `${steps.length} steps`;
  } catch (e) {
    guideTitle.textContent = 'Untitled Guide';
  }

  // Meta info
  const date = new Date(steps[0].timestamp).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  guideMeta.textContent = `${steps.length} steps — Created ${date}`;

  // Render steps
  steps.forEach((step) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'step';
    stepEl.innerHTML = `
      <div class="step-header">
        <div class="step-number">${step.number}</div>
        <div>
          <div class="step-description" contenteditable="true">${escapeHtml(step.description)}</div>
          <div class="step-url">${escapeHtml(step.url)}</div>
        </div>
      </div>
      <img class="step-screenshot" src="${step.screenshot}" alt="Step ${step.number}" loading="lazy">
    `;
    stepsContainer.appendChild(stepEl);
  });
});

// Lightbox
stepsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('step-screenshot')) {
    lightboxImg.src = e.target.src;
    lightbox.classList.add('active');
  }
});

lightbox.addEventListener('click', () => {
  lightbox.classList.remove('active');
});

// Export PDF (uses browser print)
document.getElementById('btnPdf').addEventListener('click', () => {
  window.print();
});

// Copy link (for now, just copy the page URL)
document.getElementById('btnCopy').addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.getElementById('btnCopy');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy Link'; }, 2000);
  });
});

// Branding modal
const brandModal = document.getElementById('brandModal');
const brandLogo = document.getElementById('brandLogo');

document.getElementById('btnBrand').addEventListener('click', () => {
  brandModal.classList.add('active');
});

document.getElementById('brandCancel').addEventListener('click', () => {
  brandModal.classList.remove('active');
});

document.getElementById('brandSave').addEventListener('click', () => {
  const file = document.getElementById('logoUpload').files[0];
  if (!file) {
    brandModal.classList.remove('active');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    brandLogo.src = e.target.result;
    brandLogo.classList.add('visible');
    brandModal.classList.remove('active');

    // Save branding to storage so it persists
    chrome.storage.local.set({ brandLogo: e.target.result });
  };
  reader.readAsDataURL(file);
});

// Load saved branding
chrome.storage.local.get('brandLogo', (data) => {
  if (data.brandLogo) {
    brandLogo.src = data.brandLogo;
    brandLogo.classList.add('visible');
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
