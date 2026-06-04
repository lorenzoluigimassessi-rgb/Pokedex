const STORAGE_PREFIX = 'pokecatch_';

function getItem(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setItem(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

function removeItem(key) {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

// --- Cache with TTL ---

function getCached(key, ttlMs) {
  const entry = getItem('cache_' + key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) {
    removeItem('cache_' + key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  setItem('cache_' + key, { data, ts: Date.now() });
}

// --- Domain helpers ---

const TTL_7_DAYS = 7 * 24 * 60 * 60 * 1000;
const TTL_30_DAYS = 30 * 24 * 60 * 60 * 1000;

export const storage = {
  // Trainer
  getTrainer() { return getItem('trainer'); },
  setTrainer(data) { setItem('trainer', data); },

  // Collection: { [pokemonId]: { count, shiny, caughtAt } }
  getCollection() { return getItem('collection') || {}; },
  setCollection(data) { setItem('collection', data); },

  addCatch(id, isShiny) {
    const col = this.getCollection();
    if (!col[id]) col[id] = { count: 0, shiny: false, caughtAt: Date.now() };
    col[id].count++;
    if (isShiny) col[id].shiny = true;
    this.setCollection(col);

    const trainer = this.getTrainer();
    if (trainer) {
      trainer.totalCatches = (trainer.totalCatches || 0) + 1;
      this.setTrainer(trainer);
    }
    return col[id];
  },

  // Stones: { fire: 0, water: 0, ... }
  getStones() { return getItem('stones') || {}; },
  setStones(data) { setItem('stones', data); },

  addStone(type) {
    const stones = this.getStones();
    stones[type] = (stones[type] || 0) + 1;
    this.setStones(stones);
  },

  useStone(type) {
    const stones = this.getStones();
    if (!stones[type] || stones[type] <= 0) return false;
    stones[type]--;
    this.setStones(stones);
    return true;
  },

  // Evolutions: { [pokemonId]: currentStage }
  getEvolutions() { return getItem('evolutions') || {}; },
  setEvolutions(data) { setItem('evolutions', data); },

  // API cache
  getCachedPokemon(id) { return getCached(`pokemon_v2_${id}`, TTL_7_DAYS); },
  setCachedPokemon(id, data) { setCache(`pokemon_v2_${id}`, data); },

  getCachedSpecies(id) { return getCached(`species_it_${id}`, TTL_7_DAYS); },
  setCachedSpecies(id, data) { setCache(`species_it_${id}`, data); },

  getCachedPokedex(id) { return getCached(`pokedex_${id}`, TTL_30_DAYS); },
  setCachedPokedex(id, data) { setCache(`pokedex_${id}`, data); },

  getCachedEvoChain(id) { return getCached(`evochain_${id}`, TTL_30_DAYS); },
  setCachedEvoChain(id, data) { setCache(`evochain_${id}`, data); },

  // Check if FTE completed
  isOnboarded() { return !!this.getTrainer(); },

  // Region
  getCurrentRegion() { return getItem('region') || 'kanto'; },
  setCurrentRegion(r) { setItem('region', r); },

  // Pre-populate all Pokémon in a region as caught
  populateRegion(regionKey) {
    const REGIONS = {
      kanto:[1,151], johto:[152,251], hoenn:[252,386], sinnoh:[387,493],
      unova:[494,649], kalos:[650,721], alola:[722,809], galar:[810,905], paldea:[906,1025]
    };
    const range = REGIONS[regionKey];
    if (!range) return;
    const col = this.getCollection();
    let changed = false;
    for (let i = range[0]; i <= range[1]; i++) {
      if (!col[i] && !col[String(i)]) { col[String(i)] = { count: 1, shiny: false, caughtAt: Date.now() }; changed = true; }
    }
    if (changed) this.setCollection(col);
  },
};
