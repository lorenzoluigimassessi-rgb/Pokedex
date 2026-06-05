import { storage } from './storage.js';

const AVATARS = [
  { id: 'rosso', name: 'Rosso', file: 'Rosso.png', cap: '#e23b3b', game: 'Rosso / Blu' },
  { id: 'blu', name: 'Blu', file: 'Blu.png', cap: '#3b6fe2', game: 'Rosso / Blu' },
  { id: 'verde', name: 'Verde', file: 'Verde.webp', cap: '#4aab3b', game: 'Verde Foglia' },
  { id: 'giallo', name: 'Giallo', file: 'Giallo.webp', cap: '#f5d23b', game: 'Giallo' },
  { id: 'oro', name: 'Oro', file: 'Oro.webp', cap: '#d4a017', game: 'Oro / Argento' },
  { id: 'argento', name: 'Argento', file: 'Argento.webp', cap: '#8a8fa8', game: 'Oro / Argento' },
  { id: 'cristallo', name: 'Cristallo', file: 'Cristallo.webp', cap: '#4a8fe2', game: 'Cristallo' },
];

const POKEDEX_MODELS = [
  { id: 'classic', name: 'Kanto', accent: '#cc0000', desc: 'Gen I', img: 'assets/pokedex/Kanto Pokedex.png' },
  { id: 'johto', name: 'Johto', accent: '#d4a017', desc: 'Gen II', img: 'assets/pokedex/Johto Pokedex.webp' },
  { id: 'hoenn', name: 'Hoenn', accent: '#f97316', desc: 'Gen III', img: 'assets/pokedex/Hoenn Pokedex.webp' },
  { id: 'sinnoh', name: 'Sinnoh', accent: '#e63946', desc: 'Gen IV', img: 'assets/pokedex/Sinnoh Pokedex.jpeg' },
  { id: 'unova', name: 'Unova', accent: '#555b6e', desc: 'Gen V', img: 'assets/pokedex/Unova pokedex.png' },
  { id: 'kalos', name: 'Kalos', accent: '#e63946', desc: 'Gen VI', img: 'assets/pokedex/Kalos Pokedex.png' },
  { id: 'alola', name: 'Alola', accent: '#f4a261', desc: 'Gen VII', img: 'assets/pokedex/Alola pokedex.png' },
  { id: 'rotom', name: 'Rotom', accent: '#e76f51', desc: 'Alola Phone', img: 'assets/pokedex/Rotom_Phone.webp' },
];

let step = 0;
let trainerData = { name: '', avatar: '', skin: '', totalCatches: 0 };
let container = null;
let onComplete = null;

export function startFTE(el, callback) {
  container = el;
  onComplete = callback;
  step = 0;
  trainerData = { name: '', avatar: '', skin: '', totalCatches: 0 };
  showStep();
}

export { AVATARS, POKEDEX_MODELS };

function showStep() {
  switch (step) {
    case 0: showSplash(); break;
    case 1: showName(); break;
    case 2: showAvatar(); break;
    case 3: showOpening(); break;
  }
}

function renderStars() {
  return Array.from({ length: 26 }, (_, i) =>
    `<span class="fte-star" style="left:${(i * 37) % 100}%;top:${(i * 53) % 92}%;opacity:${.18 + ((i % 4) * .12)};animation:sparkle ${2 + (i % 3)}s ease ${i * .2}s infinite"></span>`
  ).join('');
}

function renderDots(current) {
  return `<div class="fte-dots">${[0, 1, 2].map(i =>
    `<span class="fte-dot${i <= current ? ' active' : ''}${i === Math.min(current, 2) ? ' current' : ''}" style="width:${i === Math.min(current, 2) ? '22px' : '7px'}"></span>`
  ).join('')}</div>`;
}

function showSplash() {
  container.innerHTML = `
    <div class="fte-screen">
      <div class="fte-stars">${renderStars()}</div>
      <div class="fte-splash">
        <div class="pokeball-wrap">
          <div class="pokeball-spin"></div>
        </div>
        <h1 class="fte-title fredoka">Pokédex</h1>
        <p class="fte-subtitle">Catturali tutti.</p>
        <button class="btn-primary" id="fte-start">Inizia</button>
      </div>
    </div>
  `;
  document.getElementById('fte-start').addEventListener('click', next);
}

function showName() {
  container.innerHTML = `
    <div class="fte-screen">
      <div class="fte-stars">${renderStars()}</div>
      <div class="fte-name-step">
        <button class="fte-back" id="fte-back">←</button>
        <h2 class="fredoka">Come ti chiami,<br>Allenatore?</h2>
        <p>Registreremo il tuo nome nel Pokédex.</p>
        <input type="text" id="fte-name-input" class="fte-input" placeholder="Il tuo nome" maxlength="14" autocomplete="off">
        <div style="flex:1"></div>
        <button class="btn-primary" id="fte-name-btn" disabled>Continua</button>
      </div>
    </div>
  `;
  document.getElementById('fte-back').addEventListener('click', () => { step--; showStep(); });
  const input = document.getElementById('fte-name-input');
  const btn = document.getElementById('fte-name-btn');
  input.addEventListener('input', () => { btn.disabled = input.value.trim().length < 2; });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) { trainerData.name = input.value.trim(); next(); } });
  btn.addEventListener('click', () => { trainerData.name = input.value.trim(); next(); });
  input.focus();
}

let carouselIndex = 0;

function showAvatar() {
  carouselIndex = 0;

  container.innerHTML = `
    <div class="fte-screen">
      <div class="fte-stars">${renderStars()}</div>
      <div class="fte-avatar-step">
        <button class="fte-back" id="fte-back">←</button>
        <h2 class="fredoka">Scegli il tuo Allenatore</h2>
        <p>Scorri per vedere tutti.</p>
        <div class="fte-carousel" id="fte-carousel">
          ${AVATARS.map((a, i) => `
            <div class="fte-carousel-card" data-index="${i}">
              <div class="fte-carousel-card-inner" style="--cap:${a.cap}">
                <img src="assets/avatars/${a.file}" alt="${a.name}" onerror="this.style.opacity='.3'">
              </div>
              <div class="fte-carousel-label">
                <span class="fte-carousel-name fredoka">${a.name}</span>
                <span class="fte-carousel-game">${a.game}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="fte-carousel-dots" id="fte-carousel-dots">
          ${AVATARS.map((_, i) => `<span class="fte-cdot${i === 0 ? ' active' : ''}"></span>`).join('')}
        </div>
        <button class="btn-primary" id="fte-avatar-next">Scegli</button>
      </div>
    </div>
  `;

  document.getElementById('fte-back').addEventListener('click', () => { step--; showStep(); });

  const carousel = document.getElementById('fte-carousel');
  const dotsEl = document.getElementById('fte-carousel-dots');
  const cards = carousel.querySelectorAll('.fte-carousel-card');

  function updateActive(index) {
    carouselIndex = index;
    cards.forEach((c, i) => c.classList.toggle('center', i === index));
    dotsEl.querySelectorAll('.fte-cdot').forEach((d, i) => d.classList.toggle('active', i === index));
    trainerData.avatar = AVATARS[index].id;
    // live update button + accent color from avatar cap color
    const cap = AVATARS[index].cap || '#e23b3b';
    const app = document.getElementById('app');
    if (app) {
      app.style.setProperty('--accent', cap);
      app.style.setProperty('--accent-deep', cap);
    }
  }

  function updateFTECentered() {
    const midX = carousel.scrollLeft + carousel.offsetWidth / 2;
    let closest = null, closestDist = Infinity, closestIdx = 0;
    cards.forEach((c, i) => {
      const dist = Math.abs((c.offsetLeft + c.offsetWidth / 2) - midX);
      if (dist < closestDist) { closestDist = dist; closest = c; closestIdx = i; }
    });
    if (closest) updateActive(closestIdx);
  }

  carousel.addEventListener('scroll', updateFTECentered, { passive: true });
  carousel.addEventListener('scrollend', updateFTECentered, { passive: true });
  cards.forEach(card => {
    card.addEventListener('click', () =>
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    );
  });
  setTimeout(updateFTECentered, 100);

  updateActive(0);
  document.getElementById('fte-avatar-next').addEventListener('click', () => {
    // assign skin based on avatar choice
    const skinMap = {
      rosso:'classic', blu:'classic', verde:'classic', giallo:'classic',
      oro:'johto', argento:'johto', cristallo:'johto'
    };
    trainerData.skin = skinMap[trainerData.avatar] || 'classic';
    next();
  });
}

function showSkin() {
  container.innerHTML = `
    <div class="fte-screen">
      <div class="fte-stars">${renderStars()}</div>
      <div class="fte-skin-step">
        <button class="fte-back" id="fte-back">←</button>
        <h2 class="fredoka">Scegli il tuo Pokédex</h2>
        <p>Puoi cambiarlo dopo.</p>
        <div class="fte-pokedex-grid">
          ${POKEDEX_MODELS.map(m => `
            <button class="fte-pokedex-btn" data-id="${m.id}" style="--model-accent:${m.accent}">
              <div class="fte-pokedex-preview">
                <img src="${m.img}" alt="${m.name}" class="fte-pdx-img" onerror="this.style.display='none'">
              </div>
              <span class="fte-pokedex-name">${m.name}</span>
              <span class="fte-pokedex-desc">${m.desc}</span>
            </button>
          `).join('')}
        </div>
        <div style="flex:1"></div>
        <button class="btn-primary" id="fte-skin-next" disabled>Apri il mio Pokédex</button>
      </div>
    </div>
  `;

  document.getElementById('fte-back').addEventListener('click', () => { step--; showStep(); });
  const btns = container.querySelectorAll('.fte-pokedex-btn');
  const nextBtn = document.getElementById('fte-skin-next');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      trainerData.skin = btn.dataset.id;
      nextBtn.disabled = false;
    });
  });
  nextBtn.addEventListener('click', next);
}

function showOpening() {
  container.innerHTML = `
    <div class="fte-screen">
      <div class="fte-opening">
        <div style="text-align:center">
          <div class="pokeball-wrap" style="margin:0 auto 24px">
            <div class="pokeball-spin"></div>
          </div>
          <p class="fte-opening-welcome fredoka">Benvenuto, ${trainerData.name || 'Allenatore'}!</p>
        </div>
      </div>
    </div>
  `;
  storage.setTrainer(trainerData);
  document.getElementById('app').setAttribute('data-pokedex', trainerData.skin);
  setTimeout(() => { if (onComplete) onComplete(); }, 2000);
}

function next() {
  step++;
  showStep();
}
