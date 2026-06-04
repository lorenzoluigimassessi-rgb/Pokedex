import { storage } from './storage.js';
import { showDetail } from './detail.js';
import { AVATARS } from './fte.js';
import { SPECIAL_FORMS, REGIONAL_BY_REGION } from './forms.js';
import { api } from './api.js';

const REGIONS = [
  { id: 'kanto', name: 'Kanto', range: [1, 151] },
  { id: 'johto', name: 'Johto', range: [152, 251] },
  { id: 'hoenn', name: 'Hoenn', range: [252, 386] },
  { id: 'sinnoh', name: 'Sinnoh', range: [387, 493] },
  { id: 'unova', name: 'Unova', range: [494, 649] },
  { id: 'kalos', name: 'Kalos', range: [650, 721] },
  { id: 'alola', name: 'Alola', range: [722, 809] },
  { id: 'galar', name: 'Galar', range: [810, 905] },
  { id: 'paldea', name: 'Paldea', range: [906, 1025] },
];

const REGION_PDX_IMG = {
  kanto:  'assets/pokedex/Kanto Pokedex.png',
  johto:  'assets/pokedex/Johto Pokedex.webp',
  hoenn:  'assets/pokedex/Hoenn Pokedex.webp',
  sinnoh: 'assets/pokedex/Sinnoh Pokedex.png',
  unova:  'assets/pokedex/Unova pokedex.png',
  kalos:  'assets/pokedex/Kalos Pokedex.png',
  alola:  'assets/pokedex/Alola pokedex.png',
  galar:  'assets/pokedex/Rotom_Phone.webp',
  paldea: 'assets/pokedex/Rotom_Phone.webp',
};

// Avatar drives interface color
const AVATAR_COLORS = {
  rosso:     { color: '#e23b3b', dark: '#9a0000', shadow: '0 0 0 6px #9a0000, 0 0 0 10px #660000, 0 28px 60px rgba(0,0,0,.55)' },
  blu:       { color: '#3b6fe2', dark: '#1a3fa0', shadow: '0 0 0 6px #1a3fa0, 0 0 0 10px #102060, 0 28px 60px rgba(0,0,0,.55)' },
  verde:     { color: '#4aab3b', dark: '#2a7a1a', shadow: '0 0 0 6px #2a7a1a, 0 0 0 10px #1a5010, 0 28px 60px rgba(0,0,0,.55)' },
  giallo:    { color: '#e8b800', dark: '#8a6400', shadow: '0 0 0 6px #8a6400, 0 0 0 10px #604400, 0 28px 60px rgba(0,0,0,.55)' },
  oro:       { color: '#c47c00', dark: '#7a4a00', shadow: '0 0 0 6px #7a4a00, 0 0 0 10px #502e00, 0 28px 60px rgba(0,0,0,.55)' },
  argento:   { color: '#6a7fa8', dark: '#3a4f78', shadow: '0 0 0 6px #3a4f78, 0 0 0 10px #243058, 0 28px 60px rgba(0,0,0,.55)' },
  cristallo: { color: '#3b8fe2', dark: '#1a5faa', shadow: '0 0 0 6px #1a5faa, 0 0 0 10px #103880, 0 28px 60px rgba(0,0,0,.55)' },
};

// All images now have transparent backgrounds
const PDX_IMG_HAS_BG = {};

function pdxImgStyle(region) {
  return PDX_IMG_HAS_BG[region] ? 'style="border-radius:8px;background:rgba(0,0,0,.25);padding:3px"' : '';
}

let currentRegion = 'kanto';
let displayedEntries = [];
let renderBatch = 100;
let rendered = 0;
let observer = null;
let container = null;
let onNavCatch = null;

export async function renderPokedexView(el) {
  container = el;
  onNavCatch = null;

  const trainer = storage.getTrainer();
  const collection = storage.getCollection();
  const totalCaught = Object.keys(collection).length;
  const avatar = AVATARS.find(a => a.id === trainer.avatar) || AVATARS[0];
  const colors = AVATAR_COLORS[avatar.id] || AVATAR_COLORS.rosso;

  // Apply avatar-driven colors
  const app = document.getElementById('app');
  app.style.setProperty('--skin', colors.color);
  app.style.setProperty('--skin-dark', colors.dark);
  app.style.setProperty('--frame-shadow', colors.shadow);
  app.style.setProperty('--skin-header-bg', `linear-gradient(160deg, ${colors.color} 0%, ${colors.dark} 100%)`);
  app.style.setProperty('--skin-soft', colors.color + '22');
  app.style.setProperty('--accent', colors.color);
  app.style.setProperty('--accent-deep', colors.dark);

  // Update browser chrome color
  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) { metaTheme = document.createElement('meta'); metaTheme.name = 'theme-color'; document.head.appendChild(metaTheme); }
  metaTheme.content = colors.color;

  container.innerHTML = `
    <div class="view-pokedex">
      <header class="pdx-header">
        <div class="pdx-header-row">
          <button class="pdx-avatar-btn" id="pdx-avatar-btn">
            <img src="assets/avatars/${avatar.file}" alt="${avatar.name}" onerror="this.style.display='none'">
          </button>
          <div class="pdx-header-text">
            <span class="pdx-header-label">Pokédex di</span>
            <h1 class="fredoka">${trainer.name || 'Allenatore'}</h1>
          </div>
          <img src="${REGION_PDX_IMG[currentRegion]}" alt="pokédex" class="pdx-header-pdx-img" id="pdx-header-pdx-img" ${pdxImgStyle(currentRegion)}>
        </div>
        <div class="pdx-progress">
          <div class="pdx-progress-bar"><div class="pdx-progress-fill" id="pdx-fill"></div></div>
          <span class="pdx-progress-text fredoka" id="pdx-progress-text">151<span>/1025</span></span>
        </div>
      </header>
      <div class="pdx-filters scroll" id="pdx-filters">
        ${REGIONS.map(r => `<button class="pill${r.id === currentRegion ? ' active' : ''}" data-region="${r.id}">${r.name}</button>`).join('')}
        <button class="pill pill-special${currentRegion === 'special' ? ' active' : ''}" data-region="special">✨ Evoluzioni Speciali</button>
      </div>
      <div class="pdx-grid grid scroll" id="pdx-grid"></div>
      <div id="pdx-sentinel" class="pdx-sentinel"></div>
    </div>
  `;

  document.getElementById('pdx-avatar-btn').addEventListener('click', () => showAvatarSheet(container, trainer, colors));

  container.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => onRegionChange(btn.dataset.region));
  });

  // Set header height for pills sticky offset
  requestAnimationFrame(() => {
    const header = container.querySelector('.pdx-header');
    if (header) document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
  });

  await loadEntries();
}

function showAvatarSheet(containerEl, trainer, currentColors) {
  const sheet = document.createElement('div');
  sheet.className = 'pdx-avatar-sheet-overlay';
  sheet.innerHTML = `
    <div class="pdx-avatar-sheet-backdrop"></div>
    <div class="pdx-avatar-sheet">
      <div class="pdx-avatar-sheet-handle"></div>
      <h3 class="fredoka pdx-avatar-sheet-title">Cambia Allenatore</h3>
      <div class="pdx-avatar-sheet-carousel" id="sheet-carousel">
        ${AVATARS.map((a, i) => `
          <div class="pdx-avatar-sheet-card${a.id === trainer.avatar ? ' center' : ''}" data-id="${a.id}" data-index="${i}">
            <div class="pdx-avatar-sheet-card-inner" style="--cap:${a.cap}">
              <img src="assets/avatars/${a.file}" alt="${a.name}" onerror="this.style.opacity='.3'">
            </div>
            <span class="fredoka pdx-avatar-sheet-name">${a.name}</span>
          </div>
        `).join('')}
      </div>
      <button class="btn-primary" id="sheet-confirm">Scegli</button>
    </div>
  `;
  containerEl.appendChild(sheet);

  const carousel = sheet.querySelector('#sheet-carousel');
  const cards = carousel.querySelectorAll('.pdx-avatar-sheet-card');
  let selectedId = trainer.avatar;

  const currentCard = carousel.querySelector('.center');
  if (currentCard) setTimeout(() => currentCard.scrollIntoView({ inline: 'center', block: 'nearest' }), 50);

  function updateCentered() {
    const midX = carousel.scrollLeft + carousel.offsetWidth / 2;
    let closest = null, closestDist = Infinity;
    cards.forEach(c => {
      const dist = Math.abs((c.offsetLeft + c.offsetWidth / 2) - midX);
      if (dist < closestDist) { closestDist = dist; closest = c; }
    });
    if (closest && closest.dataset.id !== selectedId) {
      cards.forEach(c => c.classList.toggle('center', c === closest));
      selectedId = closest.dataset.id;
      const previewColors = AVATAR_COLORS[selectedId] || AVATAR_COLORS.rosso;
      const app = document.getElementById('app');
      app.style.setProperty('--skin', previewColors.color);
      app.style.setProperty('--skin-dark', previewColors.dark);
      app.style.setProperty('--skin-header-bg', `linear-gradient(160deg, ${previewColors.color} 0%, ${previewColors.dark} 100%)`);
      app.style.setProperty('--accent', previewColors.color);
      app.style.setProperty('--accent-deep', previewColors.dark);
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.content = previewColors.color;
    }
  }

  carousel.addEventListener('scroll', updateCentered, { passive: true });
  carousel.addEventListener('scrollend', updateCentered, { passive: true });
  cards.forEach(c => {
    c.addEventListener('click', () => c.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }));
  });
  setTimeout(updateCentered, 100);

  sheet.querySelector('.pdx-avatar-sheet-backdrop').addEventListener('click', () => sheet.remove());
  sheet.querySelector('#sheet-confirm').addEventListener('click', () => {
    trainer.avatar = selectedId;
    storage.setTrainer(trainer);
    sheet.remove();
    // Re-render to apply new avatar colors
    renderPokedexView(containerEl, onNavCatch);
  });
}

async function loadEntries() {
  if (currentRegion === 'special') {
    displayedEntries = SPECIAL_FORMS.map(f => ({ id: f.slug, num: f.baseId, name: f.name, isForm: true }));
  } else {
    const region = REGIONS.find(r => r.id === currentRegion);
    const [start, end] = region.range;
    displayedEntries = Array.from({ length: end - start + 1 }, (_, i) => ({
      id: start + i, num: i + 1, name: `pokemon-${start + i}`,
    }));
    displayedEntries.sort((a, b) => a.id - b.id);
  }
  renderGrid();
}

function renderGrid() {
  rendered = 0;
  const grid = document.getElementById('pdx-grid');
  grid.innerHTML = '';
  grid.className = 'pdx-grid grid scroll';

  const collection = storage.getCollection();
  const total = displayedEntries.length;
  document.getElementById('pdx-progress-text').innerHTML = currentRegion === 'special'
    ? `${total}<span> forme</span>`
    : `${total}<span>/1025</span>`;
  document.getElementById('pdx-fill').style.width = currentRegion === 'special' ? '100%' : `${(total / 1025) * 100}%`;

  renderNextBatch();

  if (observer) observer.disconnect();
  const sentinel = document.getElementById('pdx-sentinel');
  let regionalRendered = false;
  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && rendered < displayedEntries.length) renderNextBatch();
    else if (entries[0].isIntersecting && rendered >= displayedEntries.length && !regionalRendered) {
      regionalRendered = true;
      renderRegionalForms(grid);
    }
  }, { rootMargin: '200px' });
  observer.observe(sentinel);
}

function renderNextBatch() {
  const grid = document.getElementById('pdx-grid');
  const collection = storage.getCollection();
  const end = Math.min(rendered + renderBatch, displayedEntries.length);
  for (let i = rendered; i < end; i++) {
    const entry = displayedEntries[i];
    grid.appendChild(createGridCard(entry, collection[entry.id] || collection[String(entry.id)]));
  }
  rendered = end;
}

function renderRegionalForms(grid) {
  if (currentRegion === 'special' || currentRegion === 'all') return;
  if (grid.querySelector('.pdx-regional-divider')) return; // already rendered
  const forms = REGIONAL_BY_REGION[currentRegion];
  if (!forms || forms.length === 0) return;

  // divider
  const divider = document.createElement('div');
  divider.className = 'pdx-regional-divider';
  divider.style.cssText = 'grid-column:1/-1;display:flex;align-items:center;gap:10px;padding:16px 4px 8px;';
  divider.innerHTML = '<div style="flex:1;height:1px;background:rgba(0,0,0,.1)"></div><span style="font-size:11px;font-weight:800;color:var(--text-muted);white-space:nowrap;letter-spacing:.5px">FORME REGIONALI</span><div style="flex:1;height:1px;background:rgba(0,0,0,.1)"></div>';
  grid.appendChild(divider);

  forms.forEach(form => {
    const card = document.createElement('button');
    card.className = 'pdx-card';
    const fallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${form.baseId}.png`;
    card.innerHTML = `
      <img src="${fallback}" alt="${form.name}" loading="lazy" class="pdx-card-img">
      <span class="pdx-card-name fredoka" style="font-size:9px;text-align:center;line-height:1.2;padding:0 2px">${form.name}</span>`;
    // fetch correct form sprite
    api.getFormSprite(form.slug).then(url => {
      if (url) { const img = card.querySelector('img'); if (img) img.src = url; }
    });
    card.addEventListener('click', () => showDetail(container, form.slug));
    grid.appendChild(card);
  });
}

function createGridCard(entry, caught) {
  const card = document.createElement('button');
  card.className = 'pdx-card';
  card.dataset.id = entry.id;

  // special form card
  if (entry.isForm) {
    const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.num}.png`;
    card.innerHTML = `
      <span class="pdx-card-num">#${String(entry.num).padStart(3,'0')}</span>
      <img src="${fallbackUrl}" alt="${entry.name}" loading="lazy" class="pdx-card-img" id="form-img-${entry.id.replace(/[^a-z0-9]/g,'-')}">
      <span class="pdx-card-name fredoka">${entry.name}</span>
    `;
    // fetch correct sprite async
    api.getFormSprite(entry.id).then(url => {
      if (url) {
        const img = card.querySelector('.pdx-card-img');
        if (img) img.src = url;
      }
    });
    card.addEventListener('click', () => showDetail(container, entry.id));
    return card;
  }

  const cachedData = storage.getCachedPokemon(entry.id);
  const name = cachedData ? cachedData.name : null;
  const num = `#${String(entry.id).padStart(3, '0')}`;
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`;

  let imgHtml;
  if (caught) {
    const sprite = (caught.shiny && cachedData?.spriteShiny) ? cachedData.spriteShiny : (cachedData?.sprite || spriteUrl);
    imgHtml = `<img src="${sprite}" alt="${name || entry.id}" loading="lazy" class="pdx-card-img">`;
  } else {
    imgHtml = `<div class="pdx-card-silhouette"><img src="${spriteUrl}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=placeholder>???</span>'"></div>`;
  }

  const nameId = `name-${entry.id}`;
  card.innerHTML = `
    <span class="pdx-card-num">${num}</span>
    ${caught?.shiny ? '<span class="pdx-card-shiny">✨</span>' : ''}
    ${imgHtml}
    <span class="pdx-card-name fredoka" id="${nameId}">${name || '...'}</span>
    ${caught && caught.count > 1 ? `<span class="pdx-card-count">×${caught.count}</span>` : ''}
  `;

  // fetch name async if not cached
  if (!name) {
    api.getSpecies(entry.id).then(s => {
      if (s && s.name) {
        const el = document.getElementById(nameId);
        if (el) el.textContent = s.name;
      }
    }).catch(() => {
      const el = document.getElementById(nameId);
      if (el) el.textContent = `Pokémon ${entry.id}`;
    });
  }

  card.addEventListener('click', async () => {
    const col = storage.getCollection();
    await showDetail(container, entry.id, col[entry.id] || col[String(entry.id)]);
  });
  return card;
}

const TYPE_COLOURS_MAP = {
  normal: '#a8a878', fire: '#f08030', water: '#6890f0', grass: '#78c850',
  electric: '#f8d030', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
  ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
  rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
  steel: '#b8b8d0', fairy: '#ee99ac',
};

function onRegionChange(region) {
  currentRegion = region;
  storage.setCurrentRegion(region);
  if (region !== 'special') storage.populateRegion(region);
  container.querySelectorAll('.pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.region === region);
  });
  const pdxImg = document.getElementById('pdx-header-pdx-img');
  if (pdxImg && region !== 'special') {
    pdxImg.src = REGION_PDX_IMG[region] || REGION_PDX_IMG['kanto'];
  }
  loadEntries();
}
