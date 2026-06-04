import { api } from './api.js';
import { storage } from './storage.js';
import { getStoneEvoInfo, useStoneEvolve, showEvoToast } from './evolution.js';

const TYPE_COLOURS = {
  normal: '#a8a878', fire: '#f08030', water: '#6890f0', grass: '#78c850',
  electric: '#f8d030', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
  ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
  rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
  steel: '#b8b8d0', fairy: '#ee99ac',
};

export async function showDetail(container, pokemonId, caught, onNavCatch) {
  const overlay = document.createElement('div');
  overlay.className = 'pdx-detail-overlay';
  overlay.innerHTML = `<div class="pdx-detail-backdrop"></div><div class="pdx-detail-card"><div class="pdx-detail-loading">Loading...</div></div>`;
  container.appendChild(overlay);

  overlay.querySelector('.pdx-detail-backdrop').addEventListener('click', () => closeDetail(overlay));

  try {
    const data = await api.getFullPokemon(pokemonId);
    renderDetail(overlay, data, caught, onNavCatch);
  } catch {
    overlay.querySelector('.pdx-detail-card').innerHTML = `<div class="pdx-detail-content"><p style="text-align:center;padding:40px;color:var(--text-muted)">Failed to load data.</p></div>`;
  }
}

function renderDetail(overlay, data, caught, onNavCatch) {
  const collection = storage.getCollection();
  const catchData = collection[data.id];
  const isCaught = !!catchData;
  const isShiny = catchData?.shiny;

  const sprite = isCaught
    ? (isShiny && data.spriteShiny ? data.spriteShiny : data.artwork || data.sprite)
    : data.artwork || data.sprite;

  const num = `#${String(data.id).padStart(3, '0')}`;
  const mainType = data.types[0] || 'normal';
  const tc = TYPE_COLOURS[mainType] || '#a8a878';

  const typeBadges = isCaught ? data.types.map(t =>
    `<span class="type-badge" style="background:${TYPE_COLOURS[t] || '#888'}">${t}</span>`
  ).join('') : '';

  const card = overlay.querySelector('.pdx-detail-card');
  card.className = `pdx-detail-card${isShiny ? ' shiny' : ''}`;

  if (isCaught) {
    const movesHtml = (data.moves && data.moves.length > 0)
      ? data.moves.map(m => `<span class="pdx-move-badge">${m.name}</span>`).join('')
      : '<span style="color:var(--text-muted);font-size:13px">—</span>';

    const statsHtml = data.stats.map(s => {
      const pct = Math.min((s.value / 180) * 100, 100);
      return `<div class="pdx-stat-row">
        <span class="pdx-stat-name">${formatStatName(s.name)}</span>
        <div class="pdx-stat-track"><div class="pdx-stat-fill" style="width:${pct}%;background:${tc}"></div></div>
        <span class="pdx-stat-val">${s.value}</span>
      </div>`;
    }).join('');

    card.innerHTML = `
      <div class="pdx-detail-hero">
        <div class="pdx-detail-hero-bg" style="background:${tc}"></div>
        <div class="pdx-detail-handle" id="detail-close"></div>
        <div class="pdx-detail-artwork">
          <div class="pdx-detail-artwork-glow" style="background:${tc}"></div>
          <img src="${sprite}" alt="${data.name}">
        </div>
        <div class="pdx-detail-identity">
          <div class="pdx-detail-num">${num}</div>
          <h2 class="pdx-detail-name fredoka">${data.name}</h2>
          <div class="pdx-detail-badges">
            ${typeBadges}
            ${catchData.count > 1 ? `<span class="pdx-detail-count-badge">×${catchData.count} catturato</span>` : ''}
            ${isShiny ? '<span class="pdx-detail-shiny-badge">✨ Shiny</span>' : ''}
          </div>
        </div>
      </div>
      <div class="pdx-detail-content scroll">
        ${data.flavorText ? `<div class="pdx-section"><p class="pdx-flavor">${data.flavorText}</p></div>` : ''}
        <div class="pdx-section">
          <div class="pdx-section-title">Statistiche Base</div>
          <div class="pdx-stats">${statsHtml}</div>
        </div>
        <div class="pdx-section">
          <div class="pdx-section-title">Mosse</div>
          <div class="pdx-moves">${movesHtml}</div>
        </div>
        <div class="pdx-section" id="detail-evo-section">
          <div class="pdx-section-title">Evoluzione</div>
          <div class="pdx-evo-chain" id="detail-evo-chain">Caricamento...</div>
        </div>
      </div>
    `;
  } else {
    card.innerHTML = `
      <div class="pdx-detail-hero">
        <div class="pdx-detail-hero-bg" style="background:${tc}"></div>
        <div class="pdx-detail-handle" id="detail-close"></div>
        <div class="pdx-detail-artwork silhouette">
          <img src="${sprite}" alt="unknown">
        </div>
        <div class="pdx-detail-identity">
          <div class="pdx-detail-num">${num}</div>
          <h2 class="pdx-detail-name fredoka">???</h2>
        </div>
      </div>
      <div class="pdx-detail-content scroll">
        <div style="text-align:center;padding:32px 0 16px">
          <p style="color:var(--text-muted);font-weight:700;font-size:15px;margin-bottom:24px">Non hai ancora catturato questo Pokémon.</p>
          <button class="btn-primary pdx-catch-cta" id="detail-catch-cta">Vai a catturarlo!</button>
        </div>
      </div>
    `;
  }

  document.getElementById('detail-close').addEventListener('click', () => closeDetail(overlay));

  const catchCta = document.getElementById('detail-catch-cta');
  if (catchCta) {
    catchCta.addEventListener('click', () => { closeDetail(overlay); onNavCatch(); });
  }

  if (isCaught) loadEvoChain(data, overlay, onNavCatch);
}

async function loadEvoChain(data, overlay, onNavCatch) {
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

    const stoneEvos = await getStoneEvoInfo(data.id);
    if (stoneEvos && stoneEvos.length > 0) {
      const section = document.getElementById('detail-evo-section');
      for (const evo of stoneEvos) {
        const btn = document.createElement('button');
        btn.className = 'pdx-stone-btn';
        btn.disabled = !evo.hasStone;
        const st = getStoneStyle(evo.stoneType);
        btn.style.border = `2px solid ${st.color}`;
        btn.style.background = `${st.color}1a`;
        btn.innerHTML = `<span class="stone-modal-icon stone-${evo.stoneType}"></span> Usa pietra ${evo.stoneType} → ${evo.targetName}`;

        if (evo.hasStone) {
          btn.addEventListener('click', () => {
            const success = useStoneEvolve(data.id, evo.targetId, evo.stoneType);
            if (success) {
              showEvoToast(document.body, data.name, evo.targetName);
              closeDetail(overlay);
            }
          });
        }
        section.appendChild(btn);
      }
    }
  } catch {
    chainEl.textContent = 'Impossibile caricare';
  }
}

function renderEvoChain(node, collection, currentId) {
  const flatChain = flattenChain(node);
  return flatChain.map((entry, i) => {
    const isCaught = !!collection[entry.id];
    const isCurrent = entry.id === currentId;
    const cls = isCurrent ? 'current' : (!isCaught ? 'uncaught' : '');
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`;
    const arrow = i > 0 ? '<span class="pdx-evo-arrow">→</span>' : '';
    return `${arrow}<div class="pdx-evo-node ${cls}">
      <div class="pdx-evo-circle"><img src="${spriteUrl}" alt="${entry.name}"></div>
      <span class="pdx-evo-label">${isCaught || isCurrent ? entry.name : '?'}</span>
    </div>`;
  }).join('');
}

function flattenChain(node) {
  const result = [{ id: node.id, name: node.name }];
  if (node.evolvesTo.length) {
    for (const child of node.evolvesTo) {
      result.push(...flattenChain(child));
    }
  }
  return result;
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

function closeDetail(overlay) {
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.3s';
  setTimeout(() => overlay.remove(), 300);
}
