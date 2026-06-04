# Build Plan v1 — MVP Plan

## Scope

### IN (MVP)

| # | Feature | Milestone |
|---|---------|-----------|
| 1 | FTE flow (name, avatar, Pokédex skin, opening animation) | M1b |
| 2 | Catch view — random encounter + reveal | M1b |
| 3 | Catch mini-game — shrinking circle, ball types, success/fail | M1b |
| 4 | Shiny encounters (1/64) | M2 |
| 5 | Pokédex grid — silhouettes/caught, progress bar | M2 |
| 6 | Pokédex filters (region), sort (#, A→Z, Z→A), grid/list toggle | M2 |
| 7 | Detail overlay (artwork, type, stats, flavour text, evolution chain) | M2 |
| 8 | Stone economy (earn every 5 catches, choose type, use on eligible) | M3 |
| 9 | Auto-evolution (level-up + trade at milestones) | M3 |
| 10 | Manual stone evolution (in detail view) | M3 |
| 11 | Pre-fetch queue (3 Pokémon buffered) | M1a |
| 12 | localStorage persistence (collection, trainer, cache) | M1a |

### POST-MVP

| Feature | When |
|---------|------|
| Quick-catch toggle (skip animations after 50 catches) | Post M3 |
| 2 additional skins (Gold, Holographic) | Post M3 |
| Sound effects | Post M3 |
| Export/import save | Post M3 |
| Service worker (offline) | Post M3 |
| Achievements / badges | Future |

### NEVER

| Feature | Why |
|---------|-----|
| Battles | Scope explosion |
| Trading / multiplayer | Requires backend |
| Accounts / login | Overkill for gift app |

---

## Milestones

### M1a — Foundation

> Scaffold + API + storage + pre-fetch queue. Not user-facing.

| Task | Description | Effort |
|------|-------------|--------|
| 1.1 | Project scaffold (HTML shell, CSS files, JS modules, manifest) | S |
| 1.2 | localStorage abstraction (`storage.js`) | S |
| 1.3 | API layer (`api.js`) — fetch + cache with TTL | S |
| 1.4 | Pre-fetch queue — random IDs, batch-fetch 3 | M |

**Done when:** App loads, fetches 3 random Pokémon into memory, caches them.

---

### M1b — Core Loop (First Playable)

> The kid can open the app, set up their trainer, and catch Pokémon.

| Task | Description | Effort |
|------|-------------|--------|
| 1.5 | FTE flow — name, avatar (3+), skin (3), opening animation | M |
| 1.6 | Catch view — idle state, reveal (silhouette → colour), type BG shift, ball indicator | M |
| 1.7 | Mini-game — shrinking circle (Canvas), tap detection, difficulty by capture_rate | L |
| 1.8 | Success/fail — ball shake, "Gotcha!" / "It fled!", collection update, next encounter | M |
| 1.9 | Header bar + Catch ↔ Pokédex switcher (Pokédex is stub) | S |

**Done when:** Full catch loop works. Collection persists. Deploy + phone test.

**🚨 Gate:** Test mini-game on actual phone. If it doesn't feel right, fix before M2.

---

### M2 — Pokédex (Browsable)

> Collection is visible, browsable, filterable. Details viewable.

| Task | Description | Effort |
|------|-------------|--------|
| 2.1 | Pokédex grid — all Pokémon as silhouettes, caught in colour, lazy-load | M |
| 2.2 | Progress bar (X/total) | S |
| 2.3 | Region filter pills — fetch regional lists, cache, filter | M |
| 2.4 | Sort dropdown (# / A→Z / Z→A) | S |
| 2.5 | Grid ↔ List toggle | S |
| 2.6 | Detail overlay — slide-up, artwork, name, type, stats, flavour text | M |
| 2.7 | Evolution chain in detail — visual row, handles branching | M |
| 2.8 | Uncaught detail — silhouette, "Go catch it!" CTA | S |
| 2.9 | Shiny encounters — 1/64 RNG, shiny sprite, Premier Ball, sparkle | M |
| 2.10 | Shiny badge in grid + detail | S |

**Done when:** Pokédex fully functional. Shinies working. Deploy.

---

### M3 — Evolution & Stones (Depth)

> Pokémon evolve. Stones add strategic choice.

| Task | Description | Effort |
|------|-------------|--------|
| 3.1 | Auto-evolution logic — check milestones post-catch, trigger if met | M |
| 3.2 | Evolution toast animation | S |
| 3.3 | Stone earn modal — every 5th catch, choose from 10 types | M |
| 3.4 | Stone inventory display | S |
| 3.5 | Manual stone evolution — "Use [Stone]?" in detail, confirm, animate | M |
| 3.6 | Evolution chain updates after evolving | S |
| 3.7 | Trade-evolution auto-trigger (10 catches threshold) | S |

**Done when:** Full evolution system works. Deploy. **Game is complete.**

---

## MoSCoW

| Priority | Features |
|----------|----------|
| **Must** | FTE, Catch mechanic, Pokédex grid, Detail overlay, localStorage, Pre-fetch queue, Region filters, Sort, Ball types |
| **Should** | Shiny encounters, Evolution (auto + stones), Stone economy |
| **Could** | Grid/list toggle, Evolution animation, Type-colour BG shift, Pokédex opening animation |
| **Won't** | Sound, Offline mode, Export/import, Achievements, Quick-catch |

---

## Biggest Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mini-game feel | 🔴 If circle mechanic isn't fun on touch, core loop fails | Build task 1.7 as standalone prototype FIRST. Test on phone. Pivot mechanic if needed before investing further. |

---

## Out of Scope
- Any backend/server
- User accounts
- Multiplayer / social
- Full encyclopaedia (moves, abilities, locations)
- Animated sprites
- Music/sound
- PWA install

---

## Deployment
- GitHub Pages (static)
- Deploy after each milestone
- Test on phone after M1b (mandatory gate)
