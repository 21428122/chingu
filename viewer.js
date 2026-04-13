const stepsContainer = document.getElementById('stepsContainer');
const emptyState = document.getElementById('emptyState');
const guideTitle = document.getElementById('guideTitle');
const guideMeta = document.getElementById('guideMeta');
const guideSubtitle = document.getElementById('guideSubtitle');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

// Render steps into the container
function renderSteps(steps, title) {
  stepsContainer.innerHTML = '';

  guideTitle.textContent = title;
  guideSubtitle.textContent = `${steps.length} steps`;

  const date = steps[0] ? new Date(steps[0].timestamp).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : '';
  guideMeta.textContent = `${steps.length} steps — Created ${date}`;

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
}

// Load steps from storage and auto-polish
chrome.storage.local.get('steps', (data) => {
  const rawSteps = data.steps || [];

  if (rawSteps.length === 0) {
    emptyState.classList.remove('hidden');
    document.getElementById('brandingSection').style.display = 'none';
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  // Auto-polish on first load
  const polished = window.ChinguPolish
    ? window.ChinguPolish.polish(rawSteps)
    : { title: 'Untitled Guide', steps: rawSteps };

  renderSteps(polished.steps, polished.title);
});

// Manual polish button (re-polishes and shows a before/after count)
document.getElementById('btnPolish').addEventListener('click', () => {
  chrome.storage.local.get('steps', (data) => {
    const rawSteps = data.steps || [];
    if (rawSteps.length === 0) return;

    const polished = window.ChinguPolish
      ? window.ChinguPolish.polish(rawSteps)
      : { title: 'Untitled Guide', steps: rawSteps };

    const removed = rawSteps.length - polished.steps.length;
    renderSteps(polished.steps, polished.title);

    const btn = document.getElementById('btnPolish');
    if (removed > 0) {
      btn.textContent = `Cleaned ${removed} steps`;
    } else {
      btn.textContent = 'Already clean!';
    }
    setTimeout(() => { btn.textContent = 'Auto-Polish'; }, 2500);
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

// Export PDF using jsPDF — one click, no print dialog
document.getElementById('btnPdf').addEventListener('click', async () => {
  const btn = document.getElementById('btnPdf');
  btn.textContent = 'Generating...';
  btn.disabled = true;

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Title page
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // Chingu indigo
    const title = guideTitle.textContent || 'Untitled Guide';
    doc.text(title, margin, y + 10);
    y += 18;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(guideMeta.textContent || '', margin, y);
    y += 4;

    // Thin line
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Get steps from storage
    const data = await new Promise(r => chrome.storage.local.get('steps', r));
    const steps = data.steps || [];

    for (const step of steps) {
      // Check if we need a new page (need at least 80mm for step number + description + image)
      if (y > pageHeight - 80) {
        doc.addPage();
        y = margin;
      }

      // Step number circle + description
      doc.setFillColor(79, 70, 229);
      doc.circle(margin + 4, y + 2, 4, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(String(step.number), margin + 4, y + 3, { align: 'center' });

      // Description
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 26, 26);
      const desc = step.description || `Step ${step.number}`;
      doc.text(desc, margin + 12, y + 3);
      y += 8;

      // URL
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(170, 170, 170);
      doc.text(step.url || '', margin + 12, y);
      y += 6;

      // Screenshot
      if (step.screenshot) {
        try {
          // Load image to get dimensions
          const img = await loadImage(step.screenshot);
          const ratio = img.height / img.width;
          const imgWidth = contentWidth;
          let imgHeight = imgWidth * ratio;

          // Cap image height to avoid overflow
          const maxImgHeight = pageHeight - y - margin - 10;
          if (imgHeight > maxImgHeight) {
            // Start on a new page if image is too tall for remaining space
            if (maxImgHeight < 60) {
              doc.addPage();
              y = margin;
            }
            imgHeight = Math.min(imgHeight, pageHeight - margin * 2 - 20);
          }

          doc.addImage(step.screenshot, 'PNG', margin, y, imgWidth, imgHeight);
          y += imgHeight + 10;
        } catch (imgErr) {
          console.error('Failed to add screenshot:', imgErr);
          y += 5;
        }
      }
    }

    // Footer on last page
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text('Made with Chingu — free, open source SOPs', pageWidth / 2, pageHeight - 8, { align: 'center' });

    // Save
    const filename = title.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-');
    doc.save(`${filename}.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed. See console for details.');
  } finally {
    btn.textContent = 'Export PDF';
    btn.disabled = false;
  }
});

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

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
