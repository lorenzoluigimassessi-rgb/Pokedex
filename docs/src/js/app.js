import { storage } from './storage.js';
import { catchQueue } from './catch.js';
import { startFTE } from './fte.js';
import { renderCatchView } from './catch-game.js';
import { renderPokedexView } from './pokedex.js';

const app = document.getElementById('app');

async function init() {
  catchQueue.init();

  // Apply skin if trainer exists
  const trainer = storage.getTrainer();
  if (trainer && trainer.skin) {
    app.setAttribute('data-pokedex', trainer.skin);
  }

  if (!storage.isOnboarded()) {
    showFTE();
  } else {
    showPokedex();
  }
}

function showFTE() {
  app.innerHTML = '';
  startFTE(app, showPokedex);
}

function showCatch() {
  // Remove any lingering overlays
  document.querySelectorAll('.pdx-detail-overlay').forEach(el => el.remove());
  app.innerHTML = '';
  const trainer = storage.getTrainer();
  if (trainer && trainer.skin) {
    app.setAttribute('data-pokedex', trainer.skin);
  }
  renderCatchView(app, trainer, showPokedex);
}

function showPokedex() {
  app.innerHTML = '';
  renderPokedexView(app, showCatch);
}

init();
