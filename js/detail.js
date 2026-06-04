import { api } from './api.js';
import { storage } from './storage.js';
import { FORMS_BY_BASE, MECHANIC_LABEL, REGIONAL_BY_BASE } from './forms.js';

const TYPE_COLOURS = {
  normal: '#a8a878', fire: '#f08030', water: '#6890f0', grass: '#78c850',
  electric: '#f8d030', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
  ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
  rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
  steel: '#b8b8d0', fairy: '#ee99ac',
};

const TYPE_IT = {
  normal: 'Normale', fire: 'Fuoco', water: 'Acqua', grass: 'Erba',
  electric: 'Elettro', ice: 'Ghiaccio', fighting: 'Lotta', poison: 'Veleno',
  ground: 'Terra', flying: 'Volante', psychic: 'Psico', bug: 'Coleottero',
  rock: 'Roccia', ghost: 'Spettro', dragon: 'Drago', dark: 'Buio',
  steel: 'Acciaio', fairy: 'Folletto',
};

export async function showDetail(container, pokemonId, caught) {
  const overlay = document.createElement('div');
  overlay.className = 'pdx-detail-overlay';
  overlay.innerHTML = `<div class="pdx-detail-backdrop"></div><div class="pdx-detail-card"><div class="pdx-detail-loading">Caricamento...</div></div>`;
  container.appendChild(overlay);

  overlay.querySelector('.pdx-detail-backdrop').addEventListener('click', () => closeDetail(overlay));

  try {
    const data = await api.getFullPokemon(pokemonId);
    data._slug = typeof pokemonId === 'string' && isNaN(pokemonId) ? pokemonId : null;
    renderDetail(overlay, data, caught);
  } catch(e) {
    console.error('showDetail error:', pokemonId, e);
    const card = overlay.querySelector('.pdx-detail-card');
    card.innerHTML = `<div class="pdx-detail-content"><p style="text-align:center;padding:40px;color:var(--text-muted)">Impossibile caricare i dati.</p><button style="display:block;margin:0 auto;padding:10px 24px;border-radius:99px;background:var(--accent);color:#fff;border:none;font-weight:800;cursor:pointer" onclick="this.closest('.pdx-detail-overlay').remove()">Chiudi</button></div>`;
  }
}

function renderDetail(overlay, data, caught) {
  const collection = storage.getCollection();
  const catchData = collection[data.id] || collection[String(data.id)] || { count: 1, shiny: false };
  let isShiny = catchData?.shiny;

  const num = `#${String(data.id).padStart(3, '0')}`;
  const mainType = data.types[0] || 'normal';
  const tc = TYPE_COLOURS[mainType] || '#a8a878';

  const typeBadges = data.types.map(t =>
    `<span class="type-badge" style="background:${TYPE_COLOURS[t] || '#888'}">${TYPE_IT[t] || t}</span>`
  ).join('');

  const card = overlay.querySelector('.pdx-detail-card');

  function getSprite() {
    return isShiny && data.spriteShiny ? data.spriteShiny : data.artwork || data.sprite;
  }

  function render() {
    const isTablet = window.innerWidth >= 768;
    card.className = `pdx-detail-card${isShiny ? ' shiny' : ''}`;

    const movesHtml = (data.moves && data.moves.length > 0)
      ? data.moves.map(m => `<span class="pdx-move-badge pdx-move-loading" data-slug="${m.slug}">${m.name.replace(/-/g, ' ')}</span>`).join('')
      : '<span style="color:var(--text-muted);font-size:13px">—</span>';

    const statsHtml = data.stats.map(s => {
      const pct = Math.min((s.value / 180) * 100, 100);
      return `<div class="pdx-stat-row">
        <span class="pdx-stat-name">${formatStatName(s.name)}</span>
        <div class="pdx-stat-track"><div class="pdx-stat-fill" style="width:${pct}%;background:${tc}"></div></div>
        <span class="pdx-stat-val">${s.value}</span>
      </div>`;
    }).join('');

    const contentHtml = `
      <div class="pdx-detail-content scroll">
        ${data.flavorText ? `<div class="pdx-section"><p class="pdx-flavor">${data.flavorText}</p></div>` : ''}
        <div class="pdx-section">
          <div class="pdx-section-title">Statistiche Base</div>
          <div class="pdx-stats">${statsHtml}</div>
        </div>
        <div class="pdx-section">
          <div class="pdx-section-title">Mosse Principali</div>
          <div class="pdx-moves" id="detail-moves">${movesHtml}</div>
        </div>
        <div class="pdx-section" id="detail-evo-section">
          <div class="pdx-section-title">Evoluzione</div>
          <div id="detail-evo-chain">Caricamento...</div>
        </div>
        <div class="pdx-section pdx-section--special" id="detail-special-section" style="display:none">
          <div class="pdx-section-title pdx-section-title--special">Evoluzioni Speciali</div>
          <div class="pdx-special-pills" id="detail-special-pills"></div>
        </div>
        <div class="pdx-section pdx-section--regional" id="detail-regional-section" style="display:none">
          <div class="pdx-section-title pdx-section-title--regional">Forme Regionali</div>
          <div class="pdx-evo-line" id="detail-regional-chain"></div>
        </div>
      </div>`;

    const heroHtml = `
      <div class="pdx-detail-hero">
        <div class="pdx-detail-hero-bg" style="background:${tc}"></div>
        ${isTablet ? '' : ''}
        <div class="pdx-detail-artwork">
          <div class="pdx-detail-artwork-glow" style="background:${tc}"></div>
          <img src="${getSprite()}" alt="${data.name}">
        </div>
        <div class="pdx-detail-identity">
          <div class="pdx-detail-num">${num}</div>
          <h2 class="pdx-detail-name fredoka">${data.name}</h2>
          <div class="pdx-detail-badges">
            ${typeBadges}
            ${catchData.count > 1 ? `<span class="pdx-detail-count-badge">×${catchData.count} catturato</span>` : ''}
            ${isShiny ? '<span class="pdx-detail-shiny-badge">✨ Cromatico</span>' : ''}
          </div>
        </div>
      </div>`;

    if (isTablet) {
      card.innerHTML = `
        <div class="pdx-detail-topbar">
          <button id="detail-close" class="pdx-detail-back">← Pokédex</button>
          <span class="pdx-detail-topbar-name fredoka">${data.name}</span>
          <span class="pdx-detail-topbar-num">${num}</span>
        </div>
        <div class="pdx-detail-body-tablet">
          ${heroHtml}
          ${contentHtml}
        </div>`;
    } else {
      card.innerHTML = `
        <div class="pdx-detail-handle" id="detail-close"></div>
        ${heroHtml}
        ${contentHtml}`;
    }

    document.getElementById('detail-close').addEventListener('click', () => closeDetail(overlay));
    if (!isTablet) addSwipeToDismiss(card, overlay);

    // expand button — inject directly into card (not inside hero flex)
    const expandBtn = document.createElement('button');
    const isTabletBtn = window.innerWidth >= 768;
    expandBtn.className = 'pdx-expand-btn';
    expandBtn.title = 'Visualizza';
    expandBtn.innerHTML = isTabletBtn ? '⤢ Espandi' : '⤢';
    expandBtn.addEventListener('click', e => {
      e.stopPropagation();
      const viewerContainer = overlay.closest('#app') || overlay.parentElement;
      openViewer(data, viewerContainer);
    });
    // append to hero so it's positioned within the colored area
    const heroEl = card.querySelector('.pdx-detail-hero');
    if (heroEl) heroEl.appendChild(expandBtn);
    else card.appendChild(expandBtn);

    // fetch Italian move names asynchronously
    if (data.moves && data.moves.length > 0) {
      data.moves.forEach(async m => {
        const itName = await api.getMoveName(m.slug);
        const badge = card.querySelector(`[data-slug="${m.slug}"]`);
        if (badge) { badge.textContent = itName; badge.classList.remove('pdx-move-loading'); }
      });
    }
  }

  render();
  if (data.isForm) {
    let baseId = Object.keys(FORMS_BY_BASE).find(bid =>
      (FORMS_BY_BASE[bid] || []).some(f => f.slug === data._slug)
    );
    if (!baseId) baseId = Object.keys(REGIONAL_BY_BASE).find(bid =>
      (REGIONAL_BY_BASE[bid] || []).some(f => f.slug === data._slug)
    );
    if (baseId) {
      api.getSpecies(parseInt(baseId)).then(species => {
        if (species && species.evolutionChainUrl) {
          loadEvoChain({ ...data, id: parseInt(baseId), evolutionChainUrl: species.evolutionChainUrl }, overlay);
        }
      });
      loadSiblingForms(data, overlay, tc);
    }
  } else {
    loadEvoChain(data, overlay);
    loadSpecialForms(data, overlay, tc);
    loadRegionalForms(data, overlay);
  }
}

async function loadEvoChain(data, overlay) {
  const chainEl = document.getElementById('detail-evo-chain');
  if (!chainEl || !data.evolutionChainUrl) {
    if (chainEl) chainEl.textContent = 'Nessuna';
    return;
  }
  try {
    const chainId = parseInt(data.evolutionChainUrl.split('/').filter(Boolean).pop());
    const chain = await api.getEvolutionChain(chainId);
    const collection = storage.getCollection();
    chainEl.innerHTML = renderEvoChain(chain, collection, data.id);
    chainEl.querySelectorAll('.pdx-evo-node[data-id]').forEach(node => {
      const id = parseInt(node.dataset.id);
      if (id === data.id) return;
      node.style.cursor = 'pointer';
      node.addEventListener('click', () => {
        closeDetail(overlay);
        const container = overlay.parentElement;
        setTimeout(() => showDetail(container, id, collection[id] || collection[String(id)]), 320);
      });
    });
  } catch {
    chainEl.textContent = 'Impossibile caricare';
  }
  // return chainEl so callers can .then() after chain is rendered
}

function renderEvoChain(node, collection, currentId) {
  const lines = buildEvoLines(node);
  if (lines.length === 0) return '';
  if (lines.length === 1) return `<div class="pdx-evo-line">${renderEvoLine(lines[0], collection, currentId)}</div>`;

  const base = lines[0][0];
  const branches = lines.map(line => line.slice(1)); // each branch path after base

  // Eevee-style: many single-step branches → 4x2 grid
  const allSingleStep = branches.every(b => b.length === 1);
  if (allSingleStep && branches.length >= 5) {
    const baseHtml = renderEvoNode(base, collection, currentId);
    const gridItems = branches.map(b => renderEvoNode(b[0], collection, currentId)).join('');
    return `<div class="pdx-evo-eevee">
      <div class="pdx-evo-line pdx-evo-line--base">${baseHtml}</div>
      <span class="pdx-evo-down-arrow">↓</span>
      <div class="pdx-evo-grid">${gridItems}</div>
    </div>`;
  }

  // Standard fork: base left, diagonal arrows, branches stacked right
  const baseHtml = renderEvoNode(base, collection, currentId);
  const branchRows = branches.map(branch => {
    const nodes = branch.map((entry, i) => {
      const arrow = i > 0 ? '<span class="pdx-evo-arrow">→</span>' : '';
      return arrow + renderEvoNode(entry, collection, currentId);
    }).join('');
    return `<div class="pdx-evo-branch-row">${nodes}</div>`;
  }).join('');

  return `<div class="pdx-evo-fork">
    <div class="pdx-evo-line pdx-evo-line--base">${baseHtml}</div>
    <div class="pdx-evo-fork-arrows"><span>→</span><span>→</span></div>
    <div class="pdx-evo-fork-branches">${branchRows}</div>
  </div>`;
}

function buildEvoLines(node) {
  const lines = [];
  function walk(n, current) {
    const entry = { id: n.id, name: n.name };
    const path = [...current, entry];
    if (!n.evolvesTo || n.evolvesTo.length === 0) {
      lines.push(path);
    } else {
      n.evolvesTo.forEach(child => walk(child, path));
    }
  }
  walk(node, []);
  return lines;
}

function renderEvoLine(line, collection, currentId) {
  return line.map((entry, i) => {
    const arrow = i > 0 ? '<span class="pdx-evo-arrow">→</span>' : '';
    return arrow + renderEvoNode(entry, collection, currentId);
  }).join('');
}

function renderEvoNode(entry, collection, currentId) {
  const isCaught = !!(collection[entry.id] || collection[String(entry.id)]);
  const isCurrent = entry.id === currentId;
  const cls = isCurrent ? 'current' : (!isCaught ? 'uncaught' : '');
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`;
  return `<div class="pdx-evo-node ${cls}" data-id="${entry.id}">
    <div class="pdx-evo-circle"><img src="${spriteUrl}" alt="${entry.name}"></div>
    <span class="pdx-evo-label">${isCaught || isCurrent ? entry.name : '?'}</span>
  </div>`;
}

function getStoneStyle(type) {
  const map = {
    fire: { color: '#f0683c' }, water: { color: '#5b8af0' }, thunder: { color: '#f4cf2e' },
    leaf: { color: '#5fbf4f' }, moon: { color: '#8e7bd6' }, sun: { color: '#ffb547' },
    dusk: { color: '#4a4f7a' }, dawn: { color: '#e88bb4' }, ice: { color: '#7fd0d8' },
    shiny: { color: '#ffd93d' },
  };
  return map[type] || { color: '#888' };
}

function formatStatName(name) {
  const map = {
    'hp': 'PS', 'attack': 'Attacco', 'defense': 'Difesa',
    'special-attack': 'Att. Sp.', 'special-defense': 'Dif. Sp.', 'speed': 'Velocità'
  };
  return map[name] || name;
}

async function loadSiblingForms(data, overlay, tc) {
  let baseId = null;
  const currentSlug = data._slug || data.id;
  for (const [bid, forms] of Object.entries(FORMS_BY_BASE)) {
    if (forms.some(f => f.slug === currentSlug)) { baseId = parseInt(bid); break; }
  }
  if (!baseId) {
    for (const [bid, forms] of Object.entries(REGIONAL_BY_BASE)) {
      if (forms.some(f => f.slug === currentSlug)) { baseId = parseInt(bid); break; }
    }
  }
  if (!baseId) return;

  const specialForms = (FORMS_BY_BASE[baseId] || []);
  const regionalForms = (REGIONAL_BY_BASE[baseId] || []);

  if (specialForms.length > 0) renderSpecialPills(specialForms, currentSlug, tc, overlay);
  if (regionalForms.length > 0) renderRegionalNodes(regionalForms, currentSlug, overlay);
}

async function loadSpecialForms(data, overlay, tc) {
  const idsToCheck = new Set([Number(data.id)]);
  try {
    const sp = await api.getSpecies(data.id);
    if (sp && sp.evolutionChainUrl) {
      const chainId = parseInt(sp.evolutionChainUrl.split('/').filter(Boolean).pop());
      const chain = await api.getEvolutionChain(chainId);
      function collectIds(n) { idsToCheck.add(parseInt(n.id)); (n.evolvesTo||[]).forEach(collectIds); }
      collectIds(chain);
    }
  } catch(e) {}

  let forms = null;
  for (const id of idsToCheck) {
    if (FORMS_BY_BASE[id] && FORMS_BY_BASE[id].length > 0) { forms = FORMS_BY_BASE[id]; break; }
  }
  if (!forms || forms.length === 0) return;
  renderSpecialPills(forms, null, tc, overlay);
}

function renderSpecialPills(forms, currentSlug, tc, overlay) {
  const section = document.getElementById('detail-special-section');
  const container = document.getElementById('detail-special-pills');
  if (!section || !container) return;
  section.style.display = 'block';
  // set accent colour as CSS var on section
  if (tc) section.style.setProperty('--special-tc', tc);

  forms.forEach(form => {
    const isCurrent = form.slug === currentSlug;
    const pill = document.createElement('div');
    pill.className = `pdx-special-pill${isCurrent ? ' active' : ''}`;
    const fallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${form.baseId}.png`;
    pill.innerHTML = `<img src="${fallback}" alt="${form.name}"><span class="pdx-special-pill-label">${form.name}</span>`;
    api.getFormSprite(form.slug).then(url => {
      if (url) { const img = pill.querySelector('img'); if (img) img.src = url; }
    });
    if (!isCurrent) {
      pill.style.cursor = 'pointer';
      pill.addEventListener('click', () => {
        closeDetail(overlay);
        const container = overlay.parentElement;
        setTimeout(() => showDetail(container, form.slug), 320);
      });
    }
    container.appendChild(pill);
  });
}

function addSwipeToDismiss(card, overlay) {
  let startY = null;
  let currentY = 0;

  const hero = card.querySelector('.pdx-detail-hero');
  const trigger = hero || card;

  trigger.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    currentY = 0;
    card.style.transition = 'none';
  }, { passive: true });

  function onMove(e) {
    if (startY === null) return;
    const dy = e.touches[0].clientY - startY;
    if (dy < 0) return;
    currentY = dy;
    card.style.transform = `translateY(${dy}px)`;
    // fade backdrop as card moves down
    const backdrop = overlay.querySelector('.pdx-detail-backdrop');
    if (backdrop) backdrop.style.opacity = String(1 - Math.min(dy / 300, 0.8));
  }

  function onEnd() {
    if (startY === null) return;
    startY = null;
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);

    if (currentY > 100) {
      // slide card fully off screen, then remove
      card.style.transition = 'transform 0.3s cubic-bezier(0.32,0,0.67,0)';
      card.style.transform = `translateY(110%)`;
      const backdrop = overlay.querySelector('.pdx-detail-backdrop');
      if (backdrop) { backdrop.style.transition = 'opacity 0.3s ease'; backdrop.style.opacity = '0'; }
      setTimeout(() => overlay.remove(), 300);
    } else {
      // snap back
      card.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
      card.style.transform = 'translateY(0)';
      const backdrop = overlay.querySelector('.pdx-detail-backdrop');
      if (backdrop) { backdrop.style.transition = 'opacity 0.35s ease'; backdrop.style.opacity = '1'; }
    }
    currentY = 0;
  }

  trigger.addEventListener('touchstart', () => {
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd);
  }, { passive: true });
}


function renderTypeBadges(types) {
  const TC = {normal:'#a8a878',fire:'#f08030',water:'#6890f0',grass:'#78c850',electric:'#f8d030',ice:'#98d8d8',fighting:'#c03028',poison:'#a040a0',ground:'#e0c068',flying:'#a890f0',psychic:'#f85888',bug:'#a8b820',rock:'#b8a038',ghost:'#705898',dragon:'#7038f8',dark:'#705848',steel:'#b8b8d0',fairy:'#ee99ac'};
  const TI = {normal:'Normale',fire:'Fuoco',water:'Acqua',grass:'Erba',electric:'Elettro',ice:'Ghiaccio',fighting:'Lotta',poison:'Veleno',ground:'Terra',flying:'Volante',psychic:'Psico',bug:'Coleottero',rock:'Roccia',ghost:'Spettro',dragon:'Drago',dark:'Buio',steel:'Acciaio',fairy:'Folletto'};
  return types.map(t => '<span style="padding:5px 12px;border-radius:999px;font-size:12px;font-weight:800;color:#fff;background:' + (TC[t]||'#888') + '">' + (TI[t]||t) + '</span>').join('');
}


function openViewer(data, container) {
  const tc = (data.types && data.types[0]) ? ({
    normal:'#a8a878',fire:'#f08030',water:'#6890f0',grass:'#78c850',
    electric:'#f8d030',ice:'#98d8d8',fighting:'#c03028',poison:'#a040a0',
    ground:'#e0c068',flying:'#a890f0',psychic:'#f85888',bug:'#a8b820',
    rock:'#b8a038',ghost:'#705898',dragon:'#7038f8',dark:'#705848',
    steel:'#b8b8d0',fairy:'#ee99ac'
  })[data.types[0]] || '#888' : '#888';

  let shiny = false;
  let mode = 'home'; // home | anim
  let currentAudio = null;

  // Build sprite URLs — fallback chain for missing data
  const pid = data.id;
  const SPRITES = {
    home: data.home || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pid}.png`,
    homeShiny: data.homeShiny || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${pid}.png`,
    anim: data.anim || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${pid}.gif`,
    animShiny: data.animShiny || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/${pid}.gif`,
    cry: data.cryLatest || `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pid}.ogg`,
  };

  function getViewerSprite() {
    if (mode === 'anim') return shiny ? SPRITES.animShiny : SPRITES.anim;
    return shiny ? SPRITES.homeShiny : SPRITES.home;
  }

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;background:#0f1428;animation:fade-in .22s ease';

  function render() {
    const glowColor = shiny ? '#ffd93d' : tc;
    const isAnim = mode === 'anim';
    const src = getViewerSprite();

    overlay.innerHTML = `
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 40%,${glowColor}44 0%,transparent 70%);pointer-events:none;transition:background .5s ease"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:52px 22px 12px;position:relative;z-index:2">
        <button id="vw-close" style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.1);border:none;color:#fff;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
        <span style="font-family:var(--font-display);font-size:20px;color:#fff;text-transform:capitalize;text-shadow:0 2px 8px rgba(0,0,0,.4)">${data.name}</span>
        <button id="vw-anim-toggle" style="display:flex;align-items:center;gap:6px;background:${mode==='anim'?'rgba(255,255,255,.18)':'rgba(255,255,255,.08)'};border:1.5px solid ${mode==='anim'?'rgba(255,255,255,.5)':'rgba(255,255,255,.18)'};border-radius:999px;padding:7px 14px;font-size:12px;font-weight:800;color:${mode==='anim'?'#fff':'rgba(255,255,255,.55)'};cursor:pointer;transition:all .2s;letter-spacing:.3px;gap:8px">🎬&#8202; Animazione</button>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;padding-top:10px">
        <div id="vw-sparkles" style="position:absolute;inset:0;pointer-events:none;display:${shiny?'block':'none'}">
          <span style="position:absolute;left:25%;top:18%;font-size:17px;animation:sparkle 1.8s ease .1s infinite">&#10024;</span>
          <span style="position:absolute;left:68%;top:26%;font-size:13px;animation:sparkle 1.8s ease .5s infinite">&#10024;</span>
          <span style="position:absolute;left:16%;top:60%;font-size:15px;animation:sparkle 1.8s ease .3s infinite">&#10024;</span>
          <span style="position:absolute;left:74%;top:66%;font-size:12px;animation:sparkle 1.8s ease .8s infinite">&#10024;</span>
          <span style="position:absolute;left:50%;top:10%;font-size:11px;animation:sparkle 1.8s ease .6s infinite">&#10024;</span>
        </div>
        <img id="vw-img" src="${src}" alt="${data.name}"
          style="max-width:${isAnim?'210px':'260px'};max-height:${isAnim?'210px':'260px'};object-fit:contain;filter:drop-shadow(0 16px 40px rgba(0,0,0,.5));${isAnim?'image-rendering:pixelated':''};transition:opacity .25s ease">
      </div>
      <button id="vw-sound" style="display:flex;align-items:center;justify-content:center;gap:8px;margin:0 auto 16px;background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.15);border-radius:999px;padding:8px 14px;font-size:13px;font-weight:800;color:rgba(255,255,255,.6);cursor:pointer;position:relative;z-index:2">
        &#128266;&#8202; Ascolta il verso
      </button>
      <div style="padding:0 28px 6px;display:flex;gap:10px;position:relative;z-index:2">
        <button id="vw-normale" style="flex:1;height:46px;border-radius:999px;border:2px solid ${!shiny?'rgba(255,255,255,.5)':'rgba(255,255,255,.15)'};background:${!shiny?'rgba(255,255,255,.18)':'rgba(255,255,255,.06)'};color:${!shiny?'#fff':'rgba(255,255,255,.5)'};font-family:var(--font-body);font-size:14px;font-weight:800;cursor:pointer">
          Normale
        </button>
        <button id="vw-shiny" style="flex:1;height:46px;border-radius:999px;border:2px solid ${shiny?'rgba(255,217,61,.6)':'rgba(255,255,255,.15)'};background:${shiny?'rgba(255,217,61,.2)':'rgba(255,255,255,.06)'};color:${shiny?'#ffd93d':'rgba(255,255,255,.5)'};font-family:var(--font-body);font-size:14px;font-weight:800;cursor:pointer">
          &#10024; Shiny
        </button>
      </div>
      <div style="padding:8px 22px 36px;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2">
        <div>
          <div style="font-family:var(--font-display);font-size:28px;color:#fff;text-transform:capitalize;line-height:1">${data.name}</div>
          <div style="font-size:11px;font-weight:800;color:rgba(255,255,255,.4);margin-top:3px">#${String(data.id).padStart(3,'0')}</div>
        </div>
        <div style="display:flex;gap:6px">
          ${renderTypeBadges(data.types||[])}
        </div>
      </div>
    `;

    document.getElementById('vw-close').onclick = () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity .2s ease';
      setTimeout(() => overlay.remove(), 200);
      if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    };

    document.getElementById('vw-anim-toggle').onclick = () => { mode = mode==='anim' ? 'home' : 'anim'; render(); };

    document.getElementById('vw-normale').onclick = () => { shiny = false; render(); };
    document.getElementById('vw-shiny').onclick = () => { shiny = true; render(); };

    document.getElementById('vw-sound').onclick = () => {
      if (currentAudio) { currentAudio.pause(); currentAudio = null; }
      const url = SPRITES.cry;
      const audio = new Audio(url);
      currentAudio = audio;
      const btn = document.getElementById('vw-sound');
      btn.style.color = '#fff';
      audio.play().catch(() => {});
      audio.onended = () => { btn.style.color = 'rgba(255,255,255,.6)'; currentAudio = null; };
    };

    // swipe down to close on mobile
    let startY = null;
    overlay.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    overlay.addEventListener('touchend', e => {
      if (startY !== null && e.changedTouches[0].clientY - startY > 100) {
        overlay.style.transition = 'transform .3s ease,opacity .3s ease';
        overlay.style.transform = 'translateY(100%)';
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
        if (currentAudio) { currentAudio.pause(); currentAudio = null; }
      }
      startY = null;
    }, { passive: true });
  }

  document.body.appendChild(overlay);
  render();
}

function loadRegionalForms(data, overlay) {
  const idsToCheck = new Set([Number(data.id)]);
  try {
    if (data.evolutionChainUrl) {
      // will be populated async — for now just check direct ID
    }
  } catch(e) {}

  let forms = null;
  for (const id of idsToCheck) {
    if (REGIONAL_BY_BASE[id] && REGIONAL_BY_BASE[id].length > 0) { forms = REGIONAL_BY_BASE[id]; break; }
  }
  if (!forms || forms.length === 0) return;
  renderRegionalNodes(forms, null, overlay);
}

function renderRegionalNodes(forms, currentSlug, overlay) {
  const section = document.getElementById('detail-regional-section');
  const container = document.getElementById('detail-regional-chain');
  if (!section || !container) return;
  section.style.display = 'block';

  forms.forEach((form, i) => {
    if (i > 0) {
      const dot = document.createElement('span');
      dot.className = 'pdx-evo-arrow';
      dot.textContent = '·';
      container.appendChild(dot);
    }
    const node = document.createElement('div');
    node.className = `pdx-evo-node pdx-regional-node${form.slug === currentSlug ? ' current' : ''}`;
    node.style.cursor = 'pointer';
    const fallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${form.baseId}.png`;
    node.innerHTML = `<div class="pdx-evo-circle"><img src="${fallback}" alt="${form.name}"></div>
      <span class="pdx-evo-label">${form.name}</span>`;
    api.getFormSprite(form.slug).then(url => {
      if (url) { const img = node.querySelector('img'); if (img) img.src = url; }
    });
    if (form.slug !== currentSlug) {
      node.addEventListener('click', () => {
        closeDetail(overlay);
        const cont = overlay.parentElement;
        setTimeout(() => showDetail(cont, form.slug), 320);
      });
    }
    container.appendChild(node);
  });
}

function closeDetail(overlay) {
  const card = overlay.querySelector('.pdx-detail-card');
  const backdrop = overlay.querySelector('.pdx-detail-backdrop');
  if (card) {
    card.style.transition = 'transform 0.3s cubic-bezier(0.32,0,0.67,0)';
    card.style.transform = 'translateY(110%)';
  }
  if (backdrop) {
    backdrop.style.transition = 'opacity 0.3s ease';
    backdrop.style.opacity = '0';
  }
  setTimeout(() => overlay.remove(), 300);
}
