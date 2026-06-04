import { storage } from './storage.js';

const BASE = 'https://pokeapi.co/api/v2';
const MAX_POKEMON_ID = 1025;

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`);
  return res.json();
}

// Extract only essential fields from /pokemon/{id}
function trimPokemon(raw) {
  const moves = (raw.moves || [])
    .filter(m => m.version_group_details.some(v => v.move_learn_method.name === 'level-up' && v.level_learned_at > 0))
    .sort((a, b) => {
      const lvOf = m => Math.min(...m.version_group_details
        .filter(v => v.move_learn_method.name === 'level-up' && v.level_learned_at > 0)
        .map(v => v.level_learned_at));
      return lvOf(a) - lvOf(b);
    })
    .slice(0, 4)
    .map(m => ({ name: m.move.name, slug: m.move.name }));
  return {
    id: raw.id,
    name: raw.name,
    types: raw.types.map(t => t.type.name),
    stats: raw.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
    sprite: raw.sprites.front_default,
    spriteShiny: raw.sprites.front_shiny,
    artwork: raw.sprites.other?.['official-artwork']?.front_default || raw.sprites.front_default,
    moves,
  };
}

// Extract essential fields from /pokemon-species/{id}
function trimSpecies(raw) {
  const flavorEntry = raw.flavor_text_entries.find(e => e.language.name === 'it') ||
    raw.flavor_text_entries.find(e => e.language.name === 'en');
  return {
    id: raw.id,
    name: raw.name,
    captureRate: raw.capture_rate,
    flavorText: flavorEntry?.flavor_text?.replace(/[\n\f]/g, ' ') || '',
    evolutionChainUrl: raw.evolution_chain?.url || null,
    isLegendary: raw.is_legendary,
    isMythical: raw.is_mythical,
  };
}

export const api = {
  MAX_POKEMON_ID,

  async getPokemon(id) {
    const cached = storage.getCachedPokemon(id);
    if (cached) return cached;

    const raw = await fetchJSON(`${BASE}/pokemon/${id}`);
    const trimmed = trimPokemon(raw);
    storage.setCachedPokemon(id, trimmed);
    return trimmed;
  },

  async getSpecies(id) {
    const cacheKey = `species_it_${id}`;
    const cached = storage.getCachedSpecies(cacheKey);
    if (cached) return cached;

    const raw = await fetchJSON(`${BASE}/pokemon-species/${id}`);
    const trimmed = trimSpecies(raw);
    storage.setCachedSpecies(cacheKey, trimmed);
    return trimmed;
  },

  async getPokedex(regionId) {
    const cached = storage.getCachedPokedex(regionId);
    if (cached) return cached;

    const raw = await fetchJSON(`${BASE}/pokedex/${regionId}`);
    const entries = raw.pokemon_entries.map(e => ({
      num: e.entry_number,
      name: e.pokemon_species.name,
      id: parseInt(e.pokemon_species.url.split('/').filter(Boolean).pop()),
    }));
    storage.setCachedPokedex(regionId, entries);
    return entries;
  },

  async getEvolutionChain(id) {
    const cached = storage.getCachedEvoChain(id);
    if (cached) return cached;

    const raw = await fetchJSON(`${BASE}/evolution-chain/${id}`);
    const chain = parseChain(raw.chain);
    storage.setCachedEvoChain(id, chain);
    return chain;
  },

  // Get Italian move name
  async getMoveName(slug) {
    const cacheKey = `move_it_${slug}`;
    const cached = storage.getCachedPokemon(cacheKey);
    if (cached) return cached;
    try {
      const raw = await fetchJSON(`${BASE}/move/${slug}`);
      const entry = raw.names.find(n => n.language.name === 'it') ||
                    raw.names.find(n => n.language.name === 'en');
      const name = entry?.name || slug.replace(/-/g, ' ');
      storage.setCachedPokemon(cacheKey, name);
      return name;
    } catch {
      return slug.replace(/-/g, ' ');
    }
  },

  // Get both pokemon + species data in one call
  async getFullPokemon(id) {
    const [pokemon, species] = await Promise.all([
      this.getPokemon(id),
      this.getSpecies(id),
    ]);
    return { ...pokemon, ...species };
  },

  // Generate a random ID not yet caught (or any if all caught)
  randomId() {
    return Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
  },
};

// Recursively parse evolution chain tree
function parseChain(node) {
  const id = parseInt(node.species.url.split('/').filter(Boolean).pop());
  const entry = {
    id,
    name: node.species.name,
    evolvesTo: [],
    trigger: null,
    item: null,
  };

  if (node.evolution_details?.length) {
    const detail = node.evolution_details[0];
    entry.trigger = detail.trigger?.name || null;
    entry.item = detail.item?.name || null;
  }

  if (node.evolves_to?.length) {
    entry.evolvesTo = node.evolves_to.map(child => parseChain(child));
  }

  return entry;
}
