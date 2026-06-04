import { storage } from './storage.js';
import { startFTE } from './fte.js';
import { renderPokedexView } from './pokedex.js';

const app = document.getElementById('app');

async function init() {
  const trainer = storage.getTrainer();
  if (trainer && trainer.skin) {
    app.setAttribute('data-pokedex', trainer.skin);
  }

  if (!storage.isOnboarded()) {
    showFTE();
  } else {
    // ensure current region is populated
    const region = storage.getCurrentRegion();
    storage.populateRegion(region);
    showPokedex();
  }
}

function showFTE() {
  app.innerHTML = '';
  startFTE(app, () => {
    storage.populateRegion('kanto');
    showPokedex();
  });
}

function showPokedex() {
  app.innerHTML = '';
  const trainer = storage.getTrainer();
  if (trainer && trainer.skin) {
    app.setAttribute('data-pokedex', trainer.skin);
  }
  renderPokedexView(app);
}

init();
