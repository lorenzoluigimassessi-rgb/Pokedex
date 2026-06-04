import { catchQueue } from './catch.js';
import { storage } from './storage.js';
import { checkPostCatch, showStoneModal, showEvoToast } from './evolution.js';
import { AVATARS } from './fte.js';

const TYPE_COLOURS = {
  normal: '#a8a878', fire: '#f08030', water: '#6890f0', grass: '#78c850',
  electric: '#f8d030', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
  ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
  rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
  steel: '#b8b8d0', fairy: '#ee99ac',
};

const BALL_NAMES = {
  poke: 'Poké Ball', great: 'Mega Ball', ultra: 'Ultra Ball', master: 'Master Ball', premier: 'Premier Ball'
};

const MAX_ATTEMPTS = 3;

let currentPokemon = null;
let gameState = 'idle'; // idle | ready | throwing | wobble | success | fail
let attempts = 0;
let dragState = null; // { startX, startY, startTime }

export function renderCatchView(container, trainer, onNavPokedex) {
  const avatar = AVATARS.find(a => a.id === trainer.avatar);
  const totalStones = getTotalStones();
  const collection = storage.getCollection();
  const caughtCount = Object.keys(collection).length;

  container.innerHTML = `
    <div class="view-catch" id="catch-view">
      <div class="catch-vignette"></div>
      <div class="catch-header">
        <div class="catch-trainer">
          <div class="catch-trainer-avatar">
            ${avatar && avatar.file
              ? `<img src="assets/avatars/${avatar.file}" alt="${trainer.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                 <span class="avatar-fallback" style="display:none;background:${avatar.cap}">${trainer.name[0]}</span>`
              : `<span class="avatar-fallback" style="background:#a0aec0">${trainer.name[0]}</span>`}
          </div>
          <div class="catch-trainer-info">
            <span class="catch-trainer-label">Allenatore</span>
            <span class="catch-trainer-name fredoka">${trainer.name}</span>
          </div>
        </div>
        <button class="catch-nav-btn btn-ghost" style="height:40px;padding:0 16px;font-size:13px" id="nav-pokedex">
          Pokédex <span style="font-size:16px">›</span>
        </button>
      </div>
      <div class="catch-encounter-label hidden" id="catch-label"></div>
      <div class="catch-stage" id="catch-stage">
        <div class="catch-platform" id="catch-platform"></div>
        <div class="catch-pokemon" id="catch-pokemon"></div>
        <div class="catch-target-ring" id="catch-target" style="display:none"></div>
      </div>
      <div class="catch-ball-indicator" id="catch-ball-indicator" style="display:none"></div>
      <div class="catch-attempts" id="catch-attempts" style="display:none"></div>
      <div class="catch-throw-zone" id="catch-throw-zone" style="display:none">
        <div class="catch-drag-ball" id="catch-drag-ball"></div>
        <p class="catch-throw-hint">Trascina la sfera verso il Pokémon!</p>
      </div>
      <div class="catch-footer">
        <span style="display:flex;align-items:center;gap:6px">
          <span class="ball-icon ball-poke" style="width:16px;height:16px"></span>
          Catture: <span class="stat-value">${caughtCount}</span>
        </span>
        <span class="stat-divider">|</span>
        <span style="display:flex;align-items:center;gap:6px">
          <span style="color:var(--gold)">◆</span>
          Pietre: <span class="stat-value">${totalStones}</span>
        </span>
      </div>
    </div>
  `;

  document.getElementById('nav-pokedex').addEventListener('click', onNavPokedex);
  gameState = 'idle';

  // Auto-start encounter
  setTimeout(() => startEncounter(), 300);
}

function startEncounter() {
  const pokemon = catchQueue.next();
  if (!pokemon) { showSearching(); return; }
  currentPokemon = pokemon;
  attempts = 0;
  gameState = 'reveal';
  revealPokemon();
}

function showSearching() {
  const stage = document.getElementById('catch-stage');
  stage.insertAdjacentHTML('beforeend', `<p class="fredoka catch-searching" style="opacity:0.6;position:relative;z-index:2">Cercando nell'erba alta...</p>`);
  setTimeout(() => {
    const el = stage.querySelector('.catch-searching');
    if (el) el.remove();
    startEncounter();
  }, 2000);
}

function revealPokemon() {
  const typeColour = TYPE_COLOURS[currentPokemon.types[0]] || '#a8a878';
  const catchView = document.getElementById('catch-view');
  catchView.style.background = `radial-gradient(120% 70% at 50% 38%, ${typeColour}33 0%, var(--bg-catch) 52%, #0f1428 100%)`;

  if (currentPokemon.isShiny) {
    catchView.insertAdjacentHTML('afterbegin', '<div class="catch-shiny-overlay"></div>');
  }

  document.getElementById('catch-platform').style.background = `radial-gradient(${typeColour}55, transparent 70%)`;

  // Label
  const label = document.getElementById('catch-label');
  label.classList.remove('hidden');
  label.innerHTML = `
    <div class="catch-encounter-subtitle">
      ${currentPokemon.isShiny ? '<span style="color:var(--gold);font-size:15px">✨</span>' : ''}
      <span>${currentPokemon.isShiny ? 'È apparso uno SHINY!' : 'È apparso un Pokémon selvatico!'}</span>
    </div>
    <h2 class="catch-encounter-name fredoka ${currentPokemon.isShiny ? 'shiny' : ''}">${currentPokemon.name}</h2>
    <div class="catch-types">
      ${currentPokemon.types.map(t => `<span class="type-badge" style="background:${TYPE_COLOURS[t] || '#888'}">${t}</span>`).join('')}
    </div>
  `;

  // Sprite
  const sprite = currentPokemon.isShiny ? currentPokemon.spriteShiny : (currentPokemon.artwork || currentPokemon.sprite);
  const pokemonEl = document.getElementById('catch-pokemon');
  pokemonEl.innerHTML = `
    <div class="catch-pokemon-inner floating">
      <img src="${sprite}" alt="${currentPokemon.name}">
      ${currentPokemon.isShiny ? renderSparkles() : ''}
    </div>
  `;

  // Target ring
  const target = document.getElementById('catch-target');
  target.style.display = 'block';
  target.style.borderColor = typeColour;

  // Ball indicator
  const ballIndicator = document.getElementById('catch-ball-indicator');
  ballIndicator.style.display = 'flex';
  ballIndicator.innerHTML = `
    <span class="ball-icon ball-${currentPokemon.ball}"></span>
    <span class="ball-name">${BALL_NAMES[currentPokemon.ball] || 'Poké Ball'}</span>
  `;

  // Attempts
  updateAttempts();

  // After short reveal, enable throw zone
  setTimeout(() => {
    gameState = 'ready';
    showThrowZone();
  }, 800);
}

function renderSparkles() {
  const positions = [{ x: -90, y: -60 }, { x: 96, y: -30 }, { x: -70, y: 70 }, { x: 80, y: 78 }, { x: 0, y: -92 }];
  return positions.map((p, i) =>
    `<span class="catch-sparkle" style="left:calc(50% + ${p.x}px);top:calc(50% + ${p.y}px);animation:sparkle 1.6s ease ${i * .25}s infinite">✨</span>`
  ).join('');
}

function updateAttempts() {
  const el = document.getElementById('catch-attempts');
  el.style.display = 'flex';
  const remaining = MAX_ATTEMPTS - attempts;
  el.innerHTML = Array.from({ length: MAX_ATTEMPTS }, (_, i) =>
    `<span class="attempt-dot ${i < remaining ? 'active' : 'used'}"></span>`
  ).join('');
}

function showThrowZone() {
  const zone = document.getElementById('catch-throw-zone');
  zone.style.display = 'flex';

  const ball = document.getElementById('catch-drag-ball');
  ball.className = `catch-drag-ball ball-${currentPokemon.ball}`;
  ball.style.transform = '';

  // Touch/mouse events for drag
  ball.addEventListener('touchstart', onDragStart, { passive: false });
  ball.addEventListener('mousedown', onDragStart);
}

function hideThrowZone() {
  const zone = document.getElementById('catch-throw-zone');
  zone.style.display = 'none';
  const ball = document.getElementById('catch-drag-ball');
  ball.removeEventListener('touchstart', onDragStart);
  ball.removeEventListener('mousedown', onDragStart);
}

function onDragStart(e) {
  if (gameState !== 'ready') return;
  e.preventDefault();

  const touch = e.touches ? e.touches[0] : e;
  dragState = { startX: touch.clientX, startY: touch.clientY, startTime: Date.now() };

  const ball = document.getElementById('catch-drag-ball');
  ball.style.transition = 'none';

  const onMove = (ev) => {
    const t = ev.touches ? ev.touches[0] : ev;
    const dx = t.clientX - dragState.startX;
    const dy = t.clientY - dragState.startY;
    ball.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const onEnd = (ev) => {
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('touchend', onEnd);
    document.removeEventListener('mouseup', onEnd);

    const t = ev.changedTouches ? ev.changedTouches[0] : ev;
    const dx = t.clientX - dragState.startX;
    const dy = t.clientY - dragState.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const duration = Date.now() - dragState.startTime;

    ball.style.transition = 'transform 0.2s ease';
    ball.style.transform = '';

    // Must swipe upward with enough distance
    if (dy < -60 && dist > 80 && duration < 1000) {
      executeThrow(dx, dy, dist);
    }

    dragState = null;
  };

  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchend', onEnd);
  document.addEventListener('mouseup', onEnd);
}

function executeThrow(dx, dy, dist) {
  gameState = 'throwing';
  hideThrowZone();

  // Calculate accuracy: how centered is the throw (less horizontal = more accurate)
  const accuracy = 1 - Math.min(Math.abs(dx) / 150, 1);
  const isHit = accuracy > 0.3; // generous: if within ~45% horizontal deviation, it's a hit

  // Feedback message
  let msg = '';
  if (accuracy > 0.85) msg = 'Eccellente!';
  else if (accuracy > 0.6) msg = 'Ottimo!';
  else if (accuracy > 0.3) msg = 'Bello!';
  else msg = 'Mancato!';

  const stage = document.getElementById('catch-stage');
  stage.insertAdjacentHTML('beforeend', `<div class="catch-timing-msg" id="catch-timing">${msg}</div>`);
  setTimeout(() => { const el = document.getElementById('catch-timing'); if (el) el.remove(); }, 800);

  if (!isHit) {
    // Miss — ball flies past
    showMiss();
    return;
  }

  // Shrink pokemon + show ball
  const pokemonInner = document.querySelector('.catch-pokemon-inner');
  if (pokemonInner) { pokemonInner.classList.remove('floating'); pokemonInner.classList.add('shrinking'); }

  document.getElementById('catch-target').style.display = 'none';

  setTimeout(() => {
    document.getElementById('catch-pokemon').innerHTML = '';
    stage.insertAdjacentHTML('beforeend', `
      <div class="catch-thrown-ball dropping" id="catch-ball-anim">
        <span class="ball-icon ball-${currentPokemon.ball}" style="width:48px;height:48px"></span>
      </div>
    `);

    gameState = 'wobble';
    const ballEl = document.getElementById('catch-ball-anim');
    setTimeout(() => {
      ballEl.classList.remove('dropping');
      ballEl.innerHTML += `<div class="catch-wobble-dots">···</div>`;
      ballEl.querySelector('.ball-icon').style.animation = 'wobble .45s ease';
    }, 480);

    // Catch probability: base 80%, boosted by accuracy
    const catchChance = 0.6 + (accuracy * 0.3);
    const caught = Math.random() < catchChance;

    setTimeout(() => {
      if (ballEl) ballEl.remove();
      if (caught) {
        showSuccess();
      } else {
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
          showFinalFail();
        } else {
          showMissedCatch();
        }
      }
    }, 1980);
  }, 350);
}

function showMiss() {
  // Ball missed entirely
  attempts++;
  updateAttempts();

  if (attempts >= MAX_ATTEMPTS) {
    setTimeout(() => showFinalFail(), 600);
  } else {
    // Reset to ready state
    setTimeout(() => {
      gameState = 'ready';
      showThrowZone();
    }, 600);
  }
}

function showMissedCatch() {
  // Ball hit but didn't catch — pokemon breaks free
  gameState = 'ready';
  updateAttempts();

  const stage = document.getElementById('catch-stage');
  stage.insertAdjacentHTML('beforeend', `<div class="catch-timing-msg" id="catch-break" style="color:var(--accent)">Si è liberato!</div>`);
  setTimeout(() => { const el = document.getElementById('catch-break'); if (el) el.remove(); }, 1000);

  // Restore pokemon
  const sprite = currentPokemon.isShiny ? currentPokemon.spriteShiny : (currentPokemon.artwork || currentPokemon.sprite);
  const pokemonEl = document.getElementById('catch-pokemon');
  pokemonEl.innerHTML = `
    <div class="catch-pokemon-inner floating">
      <img src="${sprite}" alt="${currentPokemon.name}">
      ${currentPokemon.isShiny ? renderSparkles() : ''}
    </div>
  `;

  document.getElementById('catch-target').style.display = 'block';

  setTimeout(() => showThrowZone(), 800);
}

function showSuccess() {
  gameState = 'success';
  const stage = document.getElementById('catch-stage');
  document.getElementById('catch-target').style.display = 'none';
  hideThrowZone();
  document.getElementById('catch-attempts').style.display = 'none';

  const stars = [0,1,2,3,4,5].map(i =>
    `<span class="catch-success-star" style="transform:rotate(${i*60}deg) translateY(-58px);animation:star-burst .9s ease ${i*.04}s">⭐</span>`
  ).join('');

  stage.insertAdjacentHTML('beforeend', `
    <div class="catch-success">
      <div class="catch-success-stars">
        <span class="ball-icon ball-${currentPokemon.ball}" style="width:70px;height:70px"></span>
        ${stars}
      </div>
      <h2 class="catch-gotcha fredoka">Preso!</h2>
      <p class="catch-success-name">${currentPokemon.isShiny ? '✨ ' : ''}${currentPokemon.name} è stato catturato!</p>
    </div>
  `);

  storage.addCatch(currentPokemon.id, currentPokemon.isShiny);
  updateFooter();

  setTimeout(async () => {
    const postCatch = await checkPostCatch(currentPokemon.id);
    for (const evo of postCatch.evolved) showEvoToast(document.body, evo.from, evo.name);
    if (postCatch.stoneEarned) {
      setTimeout(() => showStoneModal(document.body, () => updateFooter()), 500);
      setTimeout(resetAndNext, 3500);
    } else {
      setTimeout(resetAndNext, 1700);
    }
  }, 200);
}

function showFinalFail() {
  gameState = 'fail';
  hideThrowZone();
  document.getElementById('catch-target').style.display = 'none';
  document.getElementById('catch-attempts').style.display = 'none';

  const pokemonInner = document.querySelector('.catch-pokemon-inner');
  if (pokemonInner) { pokemonInner.classList.remove('floating'); pokemonInner.classList.add('shrinking'); }

  const stage = document.getElementById('catch-stage');
  setTimeout(() => {
    document.getElementById('catch-pokemon').innerHTML = '';
    stage.insertAdjacentHTML('beforeend', `
      <div class="catch-fled">
        <h2 class="fredoka">È scappato!</h2>
        <p>Ne arriva un altro…</p>
      </div>
    `);
  }, 400);

  const shiny = document.querySelector('.catch-shiny-overlay');
  if (shiny) shiny.remove();

  setTimeout(resetAndNext, 2000);
}

function resetAndNext() {
  currentPokemon = null;

  const catchView = document.getElementById('catch-view');
  catchView.style.background = '';
  document.getElementById('catch-platform').style.background = '';

  const stage = document.getElementById('catch-stage');
  stage.querySelectorAll('.catch-success, .catch-fled, .catch-thrown-ball, .catch-timing-msg').forEach(el => el.remove());
  const shiny = document.querySelector('.catch-shiny-overlay');
  if (shiny) shiny.remove();

  document.getElementById('catch-pokemon').innerHTML = '';
  document.getElementById('catch-label').classList.add('hidden');
  document.getElementById('catch-label').innerHTML = '';
  document.getElementById('catch-ball-indicator').style.display = 'none';
  document.getElementById('catch-target').style.display = 'none';
  document.getElementById('catch-attempts').style.display = 'none';

  gameState = 'idle';

  // Auto-start next encounter
  setTimeout(() => startEncounter(), 500);
}

function updateFooter() {
  const collection = storage.getCollection();
  const caughtCount = Object.keys(collection).length;
  const totalStones = getTotalStones();
  const footer = document.querySelector('.catch-footer');
  if (footer) {
    footer.innerHTML = `
      <span style="display:flex;align-items:center;gap:6px">
        <span class="ball-icon ball-poke" style="width:16px;height:16px"></span>
        Catture: <span class="stat-value">${caughtCount}</span>
      </span>
      <span class="stat-divider">|</span>
      <span style="display:flex;align-items:center;gap:6px">
        <span style="color:var(--gold)">◆</span>
        Pietre: <span class="stat-value">${totalStones}</span>
      </span>
    `;
  }
}

function getTotalStones() {
  const stones = storage.getStones();
  return Object.values(stones).reduce((sum, n) => sum + n, 0);
}
