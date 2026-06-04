import { api } from './api.js';

const QUEUE_SIZE = 3;
const SHINY_CHANCE = 1 / 64;

let queue = [];
let isFetching = false;

// Ball tier based on capture_rate
function getBallTier(captureRate, isLegendary, isMythical) {
  if (isLegendary || isMythical || captureRate < 45) return 'master';
  if (captureRate < 100) return 'ultra';
  if (captureRate < 200) return 'great';
  return 'poke';
}

// Difficulty (circle shrink speed) mapped to ball tier
const DIFFICULTY = {
  poke: { duration: 3500, sweetSpot: 0.35 },
  great: { duration: 2800, sweetSpot: 0.28 },
  ultra: { duration: 2200, sweetSpot: 0.22 },
  master: { duration: 1600, sweetSpot: 0.18 },
};

async function fetchOne() {
  const id = api.randomId();
  try {
    const data = await api.getFullPokemon(id);
    const isShiny = Math.random() < SHINY_CHANCE;
    const ball = getBallTier(data.captureRate, data.isLegendary, data.isMythical);
    const displayBall = isShiny ? 'premier' : ball;
    return {
      ...data,
      isShiny,
      ball: displayBall,
      difficulty: DIFFICULTY[ball], // difficulty stays based on rarity, not shiny
    };
  } catch (e) {
    console.warn('Failed to fetch pokemon:', id, e);
    return null;
  }
}

async function fillQueue() {
  if (isFetching) return;
  isFetching = true;

  const needed = QUEUE_SIZE - queue.length;
  const fetches = Array.from({ length: needed }, () => fetchOne());
  const results = await Promise.allSettled(fetches);

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      queue.push(result.value);
    }
  }

  isFetching = false;
}

export const catchQueue = {
  async init() {
    await fillQueue();
  },

  // Get next encounter from queue
  next() {
    const pokemon = queue.shift() || null;
    // Refill in background
    fillQueue();
    return pokemon;
  },

  // Check if queue has encounters ready
  get ready() {
    return queue.length > 0;
  },

  get size() {
    return queue.length;
  },

  DIFFICULTY,
};
