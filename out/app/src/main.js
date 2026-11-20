// Midnight Vice — GTA 6 style cover art maker
// Features: multi-panel collage, photo upload, drag-to-pan/zoom, 6 grades,
// editable title/subtitle/tagline/quote/role tags, PNG export 3 sizes,
// layout switching, sample crew, shareable preview

import { GRADES, applyGrade } from './grades.js';

const PANEL_SIZES = { w: 280, h: 158 }; // 16:9 at app scale

// ----- DOM elements -----
const panelsEl = document.getElementById('panels');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const taglineInput = document.getElementById('tagline');
const quoteInput = document.getElementById('quote');
const roleTagsEl = document.getElementById('roleTags');
const shareLink = document.getElementById('shareLink');

const exportBtn = document.getElementById('exportBtn');
const gradePeek = document.getElementById('gradePeek');

// layout buttons
const layoutBtns = document.querySelectorAll('.layout-btn');

// zoom/fit controls (fixed panel)
const zoomSlider = document.getElementById('zoomSlider');
const zoomValue = document.getElementById('zoomValue');
const fitBtn = document.getElementById('fitBtn');
const fillBtn = document.getElementById('fillBtn');

// upload
const uploadEl = document.getElementById('upload');
const photoInput = document.getElementById('photoInput');

// state
let photos = []; // array of {img, grade, scale, x, y}
let currentLayout = 'hero-center';
let currentGrade = 'Midnight';
let zoomLevel = 100; // percent
let dragId = null;

// role tag editing
let editingTag = null;

// ----- Init: starter scene panels + load samples -----

function initStarterPanels() {
  const starterFilenames = ['boulevard.jpg', 'pier.jpg'];
  panelsEl.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const panel = document.createElement('div');
    panel.className = 'panel' + (i < 2 ? ' hero' : '');
    if (i < 2) {
      const img = document.createElement('img');
      img.className = 'photo';
      img.src = `app/samples/${starterFilenames[i]}`;
      img.alt = `Starter scene ${i}`;
      panel.appendChild(img);
    } else {
      panel.innerHTML = `<div class="upload" data-index="${i}">+ Add photo</div><input type="file" class="file-input" accept="image/*">`;
      panel.querySelector('.upload')?.querySelector('.file-input')?.addEventListener('change', (e) => handleFileChange(e, i));
    }
    panelsEl.appendChild(panel);
  }

  // Populate role tags with starter data
  populateRoleTags('THE DRIVER — OCEAN DRIVE · 2:12 AM · NO WITNESSES');
}

// ----- File handling -----

function handleFileChange(e, panelIndex) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(PANEL_SIZES.w / img.naturalWidth, PANEL_SIZES.h / img.naturalHeight);
      photos[panelIndex] = {
        img,
        grade: currentGrade,
        scale,
        x: 0, y: 0
      };
      redrawPanels();
      updateShareLink();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ----- Layout rendering -----

function redrawPanels() {
  panelsEl.innerHTML = '';
  photos = photos.filter(p => p);

  if (currentLayout === 'hero-center') renderHeroCenter();
  else if (currentLayout === 'hero-left') renderHeroLeft();
  else if (currentLayout === 'hero-right') renderHeroRight();
  else if (currentLayout === 'grid-6') renderGrid6();
}

// Layout: Hero-Center 7-panel — one big hero + 6 around
function renderHeroCenter() {
  const hero = photos[0];
  const panel = document.createElement('div');
  panel.className = 'panel hero';
  if (hero) {
    panel.style.background = 'var(--indigo)';
    const img = document.createElement('img');
    img.className = 'photo';
    img.src = hero.img.src;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    panel.appendChild(img);
    // popout
    const popout = document.createElement('div');
    popout.className = 'popout';
    panel.appendChild(popout);
    // grade select
    const gradeSelect = document.createElement('select');
    gradeSelect.className = 'grade-select';
    Object.keys(GRADES).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      if (g === currentGrade) opt.selected = true;
      gradeSelect.appendChild(opt);
    });
    gradeSelect.addEventListener('change', (e) => {
      currentGrade = e.target.value;
      applyGradeToPanel(panel, currentGrade);
    });
    panel.appendChild(gradeSelect);
    // tag
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = `CHARACTER — ${getLocationTag()}`;
    panel.appendChild(tag);
  } else {
    panel.innerHTML = `<div class="upload" data-index="0">+ Add photo</div><input type="file" class="file-input" accept="image/*">`;
    panel.querySelector('.upload')?.querySelector('.file-input')?.addEventListener('change', (e) => handleFileChange(e, 0));
  }
  panelsEl.appendChild(panel);

  for (let i = 1; i <= 6; i++) addBlankPanel(i);
  const heroPanel = panelsEl.firstElementChild;
  if (heroPanel) { /* setup drag later */ }
}

// Layout: Hero-Left — hero on left, panels right
function renderHeroLeft() {
  panelsEl.innerHTML = '';
  const heroPanel = document.createElement('div');
  heroPanel.className = 'panel hero';
  const hero = photos[0];
  if (hero) {
    heroPanel.style.background = 'var(--indigo)';
    const img = document.createElement('img');
    img.className = 'photo';
    img.src = hero.img.src;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    heroPanel.appendChild(img);
    const popout = document.createElement('div');
    popout.className = 'popout';
    heroPanel.appendChild(popout);
    const gradeSelect = document.createElement('select');
    gradeSelect.className = 'grade-select';
    Object.keys(GRADES).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      if (g === currentGrade) opt.selected = true;
      gradeSelect.appendChild(opt);
    });
    gradeSelect.addEventListener('change', (e) => {
      currentGrade = e.target.value;
      applyGradeToPanel(heroPanel, currentGrade);
    });
    heroPanel.appendChild(gradeSelect);
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = `CHARACTER — ${getLocationTag()}`;
    heroPanel.appendChild(tag);
  } else {
    heroPanel.innerHTML = `<div class="upload" data-index="0">+ Add photo</div><input type="file" class="file-input" accept="image/*">`;
    heroPanel.querySelector('.upload')?.querySelector('.file-input')?.addEventListener('change', (e) => handleFileChange(e, 0));
  }
  panelsEl.appendChild(heroPanel);
  for (let i = 1; i < 6; i++) addBlankPanel(i);
}

// Layout: Hero-Right pop-out — hero breaks frame borders
function renderHeroRight() {
  panelsEl.innerHTML = '';
  const heroPanel = document.createElement('div');
  heroPanel.className = 'panel hero popout';
  const hero = photos[0];
  if (hero) {
    heroPanel.style.background = 'var(--indigo)';
    const img = document.createElement('img');
    img.className = 'photo';
    img.src = hero.img.src;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    heroPanel.appendChild(img);
    const gradeSelect = document.createElement('select');
    gradeSelect.className = 'grade-select';
    Object.keys(GRADES).forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      if (g === currentGrade) opt.selected = true;
      gradeSelect.appendChild(opt);
    });
    gradeSelect.addEventListener('change', (e) => {
      currentGrade = e.target.value;
      applyGradeToPanel(heroPanel, currentGrade);
    });
    heroPanel.appendChild(gradeSelect);
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = `CHARACTER — ${getLocationTag()}`;
    heroPanel.appendChild(tag);
  } else {
    heroPanel.innerHTML = `<div class="upload" data-index="0">+ Add photo</div><input type="file" class="file-input" accept="image/*">`;
    heroPanel.querySelector('.upload')?.querySelector('.file-input')?.addEventListener('change', (e) => handleFileChange(e, 0));
  }
  panelsEl.appendChild(heroPanel);
  for (let i = 1; i < 7; i++) addBlankPanel(i);
}

// Layout: Grid 6-panel
function renderGrid6() {
  panelsEl.innerHTML = '';
  for (let i = 0; i < 6; i++) addBlankPanel(i);
}

// Add a blank panel with upload
function addBlankPanel(index) {
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `<div class="upload" data-index="${index}">+ Add photo</div><input type="file" class="file-input" accept="image/*">`;
  panel.querySelector('.upload')?.querySelector('.file-input')?.addEventListener('change', (e) => handleFileChange(e, index));
  panelsEl.appendChild(panel);
}

// ----- Grade application -----

function applyGradeToPanel(panel, gradeName) {
  const img = panel.querySelector('.photo');
  if (!img) return;
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  applyGrade(gradeName, ctx, canvas.width, canvas.height);
  const dataURL = canvas.toDataURL('image/png');
  img.src = dataURL;
  panel.style.filter = GRADES[gradeName]?.css || '';
}

// ----- Role tags -----

function populateRoleTags(tagText) {
  roleTagsEl.innerHTML = '';
  if (!tagText) return;

  const lines = tagText.split('·');
  lines.forEach((line, i) => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = line.trim();
    tag.addEventListener('click', () => editTag(tag));
    roleTagsEl.appendChild(tag);
  });
}

function editTag(tagEl) {
  editingTag = tagEl;
  const text = tagEl.textContent;
  const input = document.createElement('input');
  input.value = text;
  input.maxLength = 60;
  tagEl.innerHTML = '';
  tagEl.appendChild(input);
  input.focus();
  input.addEventListener('blur', () => finalizeTag(tagEl, input.value.trim()));
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { tagEl.textContent = text; } });
}

function finalizeTag(tagEl, newText) {
  if (!newText) {
    populateRoleTags(tagEl.textContent || '');
    return;
  }
  tagEl.textContent = newText;
  editingTag = null;
}

// ----- Layout switching -----

layoutBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    layoutBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLayout = btn.dataset.layout;
    redrawPanels();
    updateShareLink();
  });
});

// ----- Zoom / fit -----

fitBtn.addEventListener('click', () => {
  zoomLevel = 100;
  zoomSlider.value = 100;
  zoomValue.textContent = '100%';
  document.querySelectorAll('.panel').forEach(p => p.style.transform = '');
});

fillBtn.addEventListener('click', () => {
  zoomLevel = 100;
  zoomSlider.value = 100;
  zoomValue.textContent = '100%';
  document.querySelectorAll('.panel').forEach(p => p.style.transform = '');
});

zoomSlider.addEventListener('input', (e) => {
  zoomLevel = parseInt(e.target.value);
  zoomValue.textContent = `${zoomLevel}%`;
  document.querySelectorAll('.panel').forEach(p => {
    p.style.transform = `scale(${zoomLevel / 100})`;
  });
});

// ----- Upload / drag & drop -----

uploadEl.addEventListener('click', () => photoInput.click());

uploadEl.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadEl.style.background = 'rgba(0,212,170,0.1)';
});

uploadEl.addEventListener('dragleave', () => {
  uploadEl.style.background = 'rgba(0,0,0,0.5)';
});

uploadEl.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadEl.style.background = 'rgba(0,0,0,0.5)';
  const files = e.dataTransfer.files;
  if (files.length > 7) {
    alert('Select up to 7 photos at a time.');
    return;
  }
  Array.from(files).forEach((file, i) => {
    if (i >= 7) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(PANEL_SIZES.w / img.naturalWidth, PANEL_SIZES.h / img.naturalHeight);
        photos[i] = { img, grade: currentGrade, scale, x: 0, y: 0 };
        redrawPanels();
        updateShareLink();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
  if (photos.length < 7) photos = photos.concat(Array.from({ length: 7 - photos.length }));
});

// ----- Share link -----

function updateShareLink() {
  const size = document.querySelector('.layout-btn.active')?.dataset.layout || 'hero-center';
  const params = new URLSearchParams({
    view: 'cover',
    size: size,
    grade: currentGrade,
    title: titleInput.value,
    subtitle: subtitleInput.value,
    tagline: taglineInput.value,
    quote: quoteInput.value || 'SEVEN LIVES · ONE HARBOR · NO WAY BACK'
  });
  shareLink.href = `?view=cover&size=${size}&${params.toString()}`;
  shareLink.textContent = `?view=cover&size=${size}&${params.toString()}`;
}

// ----- Export -----

exportBtn.addEventListener('click', () => {
  const sizes = ['1080x1080', '1080x1350', '1920x1080'];
  sizes.forEach(sizeName => {
    const [sw, sh] = sizeName === '1080x1080' ? [1080, 1080] : sizeName === '1080x1350' ? [1080, 1350] : [1920, 1080];
    const sCanvas = document.createElement('canvas');
    sCanvas.width = sw;
    sCanvas.height = sh;
    const sCtx = sCanvas.getContext('2d');
    sCtx.fillStyle = '#050510';
    sCtx.fillRect(0, 0, sw, sh);
    sCtx.font = 'bold 48px "Anton", sans-serif';
    sCtx.fillStyle = '#00f7ff';
    sCtx.textAlign = 'center';
    sCtx.fillText(titleInput.value || 'MIDNIGHT VICE', sw / 2, 70);

    sCanvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `midnight-vice-${sizeName}.png`;
      a.click();
    }, 'image/png');
  });
});

// ----- Init -----

initStarterPanels();
populateRoleTags('THE DRIVER — OCEAN DRIVE · 2:12 AM · NO WITNESSES');
updateShareLink();

// Handle title/subtitle/tagline changes for live preview
titleInput.addEventListener('input', updateShareLink);
subtitleInput.addEventListener('input', updateShareLink);
taglineInput.addEventListener('input', updateShareLink);
quoteInput.addEventListener('input', updateShareLink);

// Keyboard shortcut: shuffle crew
document.addEventListener('keydown', (e) => {
  if (e.key === 's' && e.ctrlKey) {
    const tags = roleTagsEl.querySelectorAll('.tag');
    if (tags.length > 0) {
      const text = tags[Math.floor(Math.random() * tags.length)].textContent;
      populateRoleTags(text + ' · NEW LOCATION · ' + new Date().toLocaleTimeString() + ' · EDIT ME');
    }
  }
  if (e.key === 'l' && e.ctrlKey) {
    populateRoleTags('THE DRIVER — OCEAN DRIVE · 2:12 AM · NO WITNESSES\nLOOKOUT — VENICE BEACH · 3:45 AM · ONE WITNESS\nSUIT — DOWNTOWN · 4:10 AM · CASH PACKAGE\nWOMAN — MIAMI ROAD · 1:55 AM · NO WITNESSES');
  }
});