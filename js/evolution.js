import { api } from './api.js';
import { storage } from './storage.js';

const STONE_TYPES = ['fire', 'water', 'thunder', 'leaf', 'moon', 'sun', 'dusk', 'dawn', 'ice', 'shiny'];
const CATCHES_PER_STONE = 5;
const STAGE_2_THRESHOLD = 3;
const STAGE_3_THRESHOLD = 5;
const TRADE_EVO_THRESHOLD = 10;

export async function checkPostCatch(pokemonId) {
  const trainer = storage.getTrainer();
  const totalCatches = trainer?.totalCatches || 0;
  const results = { evolved: [], stoneEarned: false };

  if (totalCatches > 0 && totalCatches % CATCHES_PER_STONE === 0) {
    results.stoneEarned = true;
  }

  const evolved = await checkAutoEvolutions(totalCatches);
  results.evolved = evolved;
  return results;
}

async function checkAutoEvolutions(totalCatches) {
  const collection = storage.getCollection();
  const evolutions = storage.getEvolutions();
  const evolved = [];

  for (const [idStr, data] of Object.entries(collection)) {
    const id = parseInt(idStr);
    if (evolutions[id]) continue;

    try {
      const species = await api.getSpecies(id);
      if (!species.evolutionChainUrl) continue;

      const chainId = parseInt(species.evolutionChainUrl.split('/').filter(Boolean).pop());
      const chain = await api.getEvolutionChain(chainId);
      const evoResult = findAutoEvolution(chain, id, data, totalCatches, collection);
      if (evoResult) {
        if (!collection[evoResult.id]) {
          collection[evoResult.id] = { count: 1, shiny: false, caughtAt: Date.now() };
        }
        evolutions[id] = evoResult.id;
        evolved.push(evoResult);
      }
    } catch { /* skip */ }
  }

  if (evolved.length) {
    storage.setCollection(collection);
    storage.setEvolutions(evolutions);
  }
  return evolved;
}

function findAutoEvolution(node, baseId, baseData, totalCatches, collection) {
  const path = findInChain(node, baseId);
  if (!path || path.evolvesTo.length === 0) return null;

  for (const evo of path.evolvesTo) {
    if (collection[evo.id]) continue;
    if (evo.item) continue;

    if (evo.trigger === 'trade') {
      const catchesSinceBase = totalCatches - getCatchesSince(baseData, totalCatches);
      if (catchesSinceBase >= TRADE_EVO_THRESHOLD) {
        return { id: evo.id, name: evo.name, from: node.name, fromId: baseId };
      }
      continue;
    }

    const isStage3 = findInChain(node, evo.id) !== node;
    const threshold = isStage3 ? STAGE_3_THRESHOLD : STAGE_2_THRESHOLD;
    const catchesSinceBase = totalCatches - getCatchesSince(baseData, totalCatches);

    if (catchesSinceBase >= threshold) {
      return { id: evo.id, name: evo.name, from: path.name, fromId: baseId };
    }
  }
  return null;
}

function findInChain(node, targetId) {
  if (node.id === targetId) return node;
  for (const child of node.evolvesTo) {
    const found = findInChain(child, targetId);
    if (found) return found;
  }
  return null;
}

function getCatchesSince(data, totalCatches) {
  return Math.max(0, totalCatches - data.count - STAGE_2_THRESHOLD);
}

export async function getStoneEvoInfo(pokemonId) {
  try {
    const species = await api.getSpecies(pokemonId);
    if (!species.evolutionChainUrl) return null;

    const chainId = parseInt(species.evolutionChainUrl.split('/').filter(Boolean).pop());
    const chain = await api.getEvolutionChain(chainId);
    const node = findInChain(chain, pokemonId);

    if (!node || !node.evolvesTo.length) return null;

    const stoneEvos = node.evolvesTo.filter(e => e.item);
    if (!stoneEvos.length) return null;

    const stones = storage.getStones();
    return stoneEvos.map(e => {
      const stoneType = e.item.replace('-stone', '').replace('stone', '');
      const normalized = normalizeStoneType(stoneType);
      return {
        targetId: e.id,
        targetName: e.name,
        stoneType: normalized,
        hasStone: (stones[normalized] || 0) > 0,
      };
    });
  } catch { return null; }
}

function normalizeStoneType(raw) {
  const map = {
    'fire': 'fire', 'water': 'water', 'thunder': 'thunder', 'thunderstone': 'thunder',
    'leaf': 'leaf', 'moon': 'moon', 'sun': 'sun', 'dusk': 'dusk',
    'dawn': 'dawn', 'ice': 'ice', 'shiny': 'shiny',
  };
  return map[raw] || raw;
}

export function useStoneEvolve(fromId, targetId, stoneType) {
  const success = storage.useStone(stoneType);
  if (!success) return false;

  const collection = storage.getCollection();
  if (!collection[targetId]) {
    collection[targetId] = { count: 1, shiny: false, caughtAt: Date.now() };
  }
  storage.setCollection(collection);

  const evolutions = storage.getEvolutions();
  evolutions[fromId] = targetId;
  storage.setEvolutions(evolutions);
  return true;
}

export function showStoneModal(container, onSelect) {
  const stones = storage.getStones();
  let picked = null;

  const modal = document.createElement('div');
  modal.className = 'stone-modal-overlay';
  modal.innerHTML = `
    <div class="stone-modal">
      <div class="stone-modal-reward">★ RICOMPENSA ★</div>
      <h2 class="stone-modal-title fredoka">Hai ottenuto una pietra!</h2>
      <p class="stone-modal-subtitle">Scegline una da tenere.</p>
      <div class="stone-modal-grid">
        ${STONE_TYPES.map(type => `
          <button class="stone-modal-btn" data-type="${type}">
            <span class="stone-modal-icon stone-${type}"></span>
            <span class="stone-modal-label">${type}</span>
          </button>
        `).join('')}
      </div>
      <button class="btn-primary" id="stone-confirm" disabled style="margin-top:20px">Prendi la Pietra</button>
    </div>
  `;

  container.appendChild(modal);

  const confirmBtn = modal.querySelector('#stone-confirm');

  modal.querySelectorAll('.stone-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.stone-modal-btn').forEach(b => {
        b.classList.remove('selected');
        b.style.borderColor = 'transparent';
      });
      btn.classList.add('selected');
      picked = btn.dataset.type;
      btn.style.borderColor = getStoneColor(picked);
      confirmBtn.disabled = false;
      confirmBtn.textContent = `Prendi la Pietra ${picked.charAt(0).toUpperCase() + picked.slice(1)}`;
    });
  });

  confirmBtn.addEventListener('click', () => {
    if (!picked) return;
    storage.addStone(picked);
    modal.classList.add('closing');
    setTimeout(() => {
      modal.remove();
      if (onSelect) onSelect(picked);
    }, 300);
  });
}

function getStoneColor(type) {
  const map = {
    fire: '#f0683c', water: '#5b8af0', thunder: '#f4cf2e', leaf: '#5fbf4f',
    moon: '#8e7bd6', sun: '#ffb547', dusk: '#4a4f7a', dawn: '#e88bb4',
    ice: '#7fd0d8', shiny: '#ffd93d',
  };
  return map[type] || '#888';
}

export function showEvoToast(container, fromName, toName) {
  const toast = document.createElement('div');
  toast.className = 'evo-toast';
  toast.innerHTML = `
    <div>
      <div class="evo-label">EVOLUTO!</div>
      <div class="evo-names fredoka">${fromName} → ${toName}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('dismissing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export { STONE_TYPES };
