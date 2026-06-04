import { api } from './api.js';
import { storage } from './storage.js';
import { showDetail } from './detail.js';
import { POKEDEX_MODELS } from './fte.js';

const REGIONS = [
  { id: 'all', name: 'All', range: null },
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

let currentRegion = 'kanto';
let currentSort = 'num';
let currentViewMode = 'grid';
let displayedEntries = [];
let renderBatch = 50;
let rendered = 0;
let observer = null;
let container = null;
let onNavCatch = null;

export async function renderPokedexView(el, navCatchCallback) {
  container = el;
  onNavCatch = navCatchCallback;

  const trainer = storage.getTrainer();
  const collection = storage.getCollection();
  const totalCaught = Object.keys(collection).length;
  const skin = trainer.skin || 'classic';

  // Apply model
  document.getElementById('app').setAttribute('data-pokedex', skin);

  container.innerHTML = `
    <div class="view-pokedex">
      <div class="pdx-skin-frame"></div>
      <header class="pdx-header">
        <div class="pdx-header-row">
          <div class="pdx-header-dot"></div>
          <h1 class="fredoka">Pokédex</h1>
          <div class="pdx-skin-switcher">
            ${POKEDEX_MODELS.map(m => `
              <button class="pdx-skin-dot${skin === m.id ? ' active' : ''}" data-skin="${m.id}" title="${m.name}" style="background:${m.accent}"></button>
            `).join('')}
          </div>
        </div>
        <div class="pdx-progress">
          <div class="pdx-progress-bar"><div class="pdx-progress-fill" id="pdx-fill"></div></div>
          <span class="pdx-progress-text fredoka" id="pdx-progress-text">${totalCaught}<span>/...</span></span>
        </div>
      </header>
      <div class="pdx-filters scroll" id="pdx-filters">
        ${REGIONS.map(r => `<button class="pill${r.id === currentRegion ? ' active' : ''}" data-region="${r.id}">${r.name}</button>`).join('')}
      </div>
      <div class="pdx-controls">
        <div class="pdx-sort-group">
          ${[['num', '#'], ['az', 'A→Z'], ['za', 'Z→A']].map(([k, l]) =>
            `<button class="pdx-sort-btn${currentSort === k ? ' active' : ''}" data-sort="${k}">${l}</button>`
          ).join('')}
        </div>
        <div class="pdx-view-toggle">
          ${[['grid', '▦'], ['list', '≡']].map(([k, l]) =>
            `<button class="pdx-view-btn${currentViewMode === k ? ' active' : ''}" data-view="${k}">${l}</button>`
          ).join('')}
        </div>
      </div>
      <div class="pdx-grid ${currentViewMode} scroll" id="pdx-grid"></div>
      <div id="pdx-sentinel" class="pdx-sentinel"></div>
      <button class="pdx-fab" id="pdx-catch-fab">
        <span class="ball-icon ball-poke"></span> CATTURA!
      </button>
    </div>
  `;

  // Events
  document.getElementById('pdx-catch-fab').addEventListener('click', onNavCatch);

  container.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => onRegionChange(btn.dataset.region));
  });
  container.querySelectorAll('.pdx-sort-btn').forEach(btn => {
    btn.addEventListener('click', () => onSortChange(btn.dataset.sort));
  });
  container.querySelectorAll('.pdx-view-btn').forEach(btn => {
    btn.addEventListener('click', () => onViewChange(btn.dataset.view));
  });
  container.querySelectorAll('.pdx-skin-dot').forEach(btn => {
    btn.addEventListener('click', () => onSkinChange(btn.dataset.skin));
  });

  await loadEntries();
}

function onSkinChange(skinId) {
  const trainer = storage.getTrainer();
  trainer.skin = skinId;
  storage.setTrainer(trainer);
  document.getElementById('app').setAttribute('data-pokedex', skinId);

  container.querySelectorAll('.pdx-skin-dot').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.skin === skinId);
  });
}

async function loadEntries() {
  const region = REGIONS.find(r => r.id === currentRegion);
  if (!region.range) {
    displayedEntries = Array.from({ length: api.MAX_POKEMON_ID }, (_, i) => ({
      id: i + 1, num: i + 1, name: `pokemon-${i + 1}`,
    }));
  } else {
    const [start, end] = region.range;
    displayedEntries = Array.from({ length: end - start + 1 }, (_, i) => ({
      id: start + i, num: i + 1, name: `pokemon-${start + i}`,
    }));
  }

  applySort();
  renderGrid();
}

function applySort() {
  const col = storage.getCollection();
  switch (currentSort) {
    case 'az':
      displayedEntries.sort((a, b) => getDisplayName(a, col).localeCompare(getDisplayName(b, col)));
      break;
    case 'za':
      displayedEntries.sort((a, b) => getDisplayName(b, col).localeCompare(getDisplayName(a, col)));
      break;
    default:
      displayedEntries.sort((a, b) => a.id - b.id);
  }
}

function getDisplayName(entry, collection) {
  if (collection[entry.id]) {
    const cached = storage.getCachedPokemon(entry.id);
    return cached?.name || entry.name;
  }
  return 'zzz';
}

function renderGrid() {
  rendered = 0;
  const grid = document.getElementById('pdx-grid');
  grid.innerHTML = '';
  grid.className = `pdx-grid ${currentViewMode} scroll`;

  const collection = storage.getCollection();
  const totalCaught = Object.keys(collection).length;
  const total = displayedEntries.length;
  document.getElementById('pdx-progress-text').innerHTML = `${totalCaught}<span>/${total}</span>`;
  document.getElementById('pdx-fill').style.width = `${(totalCaught / total) * 100}%`;

  renderNextBatch();

  if (observer) observer.disconnect();
  const sentinel = document.getElementById('pdx-sentinel');
  observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && rendered < displayedEntries.length) renderNextBatch();
  }, { rootMargin: '200px' });
  observer.observe(sentinel);
}

function renderNextBatch() {
  const grid = document.getElementById('pdx-grid');
  const collection = storage.getCollection();
  const end = Math.min(rendered + renderBatch, displayedEntries.length);

  for (let i = rendered; i < end; i++) {
    const entry = displayedEntries[i];
    const caught = collection[entry.id];
    grid.appendChild(currentViewMode === 'grid' ? createGridCard(entry, caught) : createListRow(entry, caught));
  }
  rendered = end;
}

function createGridCard(entry, caught) {
  const card = document.createElement('button');
  card.className = 'pdx-card';
  card.dataset.id = entry.id;

  const cachedData = storage.getCachedPokemon(entry.id);
  const name = caught && cachedData ? cachedData.name : null;
  const num = `#${String(entry.id).padStart(3, '0')}`;

  let imgHtml;
  if (caught && cachedData) {
    const sprite = caught.shiny && cachedData.spriteShiny ? cachedData.spriteShiny : cachedData.sprite;
    imgHtml = `<img src="${sprite}" alt="${name}" loading="lazy" class="pdx-card-img">`;
  } else {
    // Silhouette using sprite URL with CSS filter
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`;
    imgHtml = `<div class="pdx-card-silhouette"><img src="${spriteUrl}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=placeholder>???</span>'"></div>`;
  }

  card.innerHTML = `
    <span class="pdx-card-num">${num}</span>
    ${caught?.shiny ? '<span class="pdx-card-shiny">✨</span>' : ''}
    ${imgHtml}
    <span class="pdx-card-name fredoka ${!name ? 'uncaught' : ''}">${name || '???'}</span>
    ${caught && caught.count > 1 ? `<span class="pdx-card-count">×${caught.count}</span>` : ''}
  `;

  card.addEventListener('click', () => showDetail(container, entry.id, caught, onNavCatch));
  return card;
}

function createListRow(entry, caught) {
  const card = document.createElement('button');
  card.className = 'pdx-card';
  card.dataset.id = entry.id;

  const cachedData = storage.getCachedPokemon(entry.id);
  const name = caught && cachedData ? cachedData.name : null;
  const num = `#${String(entry.id).padStart(3, '0')}`;

  let imgHtml;
  if (caught && cachedData) {
    const sprite = caught.shiny && cachedData.spriteShiny ? cachedData.spriteShiny : cachedData.sprite;
    imgHtml = `<img src="${sprite}" alt="${name}" loading="lazy" class="pdx-card-img">`;
  } else {
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`;
    imgHtml = `<div class="pdx-card-silhouette"><img src="${spriteUrl}" loading="lazy" onerror="this.parentElement.innerHTML='<span class=placeholder>?</span>'"></div>`;
  }

  const typeBadges = caught && cachedData ? cachedData.types.map(t =>
    `<span class="type-badge" style="background:${TYPE_COLOURS_MAP[t] || '#888'}">${t}</span>`
  ).join('') : '';

  card.innerHTML = `
    ${imgHtml}
    <div class="pdx-card-info">
      <div class="pdx-card-info-row">
        <span class="pdx-card-num">${num}</span>
        <span class="pdx-card-name fredoka ${!name ? 'uncaught' : ''}">${name || '???'}</span>
        ${caught?.shiny ? '<span style="font-size:13px">✨</span>' : ''}
      </div>
      ${typeBadges ? `<div class="pdx-card-types">${typeBadges}</div>` : ''}
    </div>
    ${caught && caught.count > 1 ? `<span class="pdx-card-count">×${caught.count}</span>` : ''}
    <span class="pdx-card-chevron">›</span>
  `;

  card.addEventListener('click', () => showDetail(container, entry.id, caught, onNavCatch));
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
  container.querySelectorAll('.pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.region === region);
  });
  loadEntries();
}

function onSortChange(sort) {
  currentSort = sort;
  container.querySelectorAll('.pdx-sort-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sort === sort);
  });
  applySort();
  renderGrid();
}

function onViewChange(mode) {
  currentViewMode = mode;
  container.querySelectorAll('.pdx-view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === mode);
  });
  renderGrid();
}
