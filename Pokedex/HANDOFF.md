# PokéCatch — UI Rebuild Reference

A reference package for rebuilding the **exact** PokéCatch visual interface. This
document plus the source files in `pc/` and the images in `screenshots/` contain
everything needed to reproduce the design pixel-for-pixel.

PokéCatch is a **mobile-first prototype** (single device frame, 390 × 844) for
catching Pokémon and browsing a Pokédex. It is a hi-fi clickable mock, not a
production app — all state is local.

---

## 1. How to run / view

Open `PokéCatch.html` in a browser. It loads React 18 + Babel from a CDN and
transpiles the `.jsx` files in the browser. No build step.

- `PokéCatch.html` — the entry point (links CSS + scripts, mounts `#root`).
- `PokéCatch (standalone).html` — a single self-contained file (all CSS/JS
  inlined) that works offline. Use this if you want one file to read top-to-bottom.

A device shell (`#stage`, 390 × 844, rounded `42px`, full-bleed — **no phone
bezel**) is the canvas. Everything renders absolutely-positioned inside it.

---

## 2. File map

| File | Lines | Role |
| --- | --- | --- |
| `pc/styles.css` | 147 | All design tokens (CSS vars), base styles, buttons, pills, badges, **every `@keyframes`**. Start here. |
| `pc/data.js` | 156 | Data layer on `window.PC`: type colors, regions, Kanto names, base stats, ball/stone defs, sprite + avatar URLs, PokéAPI fetch. |
| `pc/components.jsx` | 159 | Shared primitives: `BallIcon` (SVG), `TypeBadge`, `StatBar`, `ProgressBar`, `Sprite`, `SilhouetteImg`, `Avatar`, `StoneIcon`. |
| `pc/fte.jsx` | 159 | First-time experience (onboarding): name + avatar + skin pick. `FTE`, `SkinSwatch`. |
| `pc/catch.jsx` | 206 | The Catch screen — throw a ball at an encounter. `CatchView`. |
| `pc/pokedex.jsx` | 147 | The Pokédex — grid/list of caught species, region + sort filters. `PokedexView`, `GridCard`, `ListRow`. |
| `pc/overlays.jsx` | 206 | Modals/toasts: `DetailOverlay` (species detail + evolve), `StoneModal` (reward), `EvoToast`, `SectionTitle`, `EvoThumb`. |
| `pc/app.jsx` | 120 | Root `App`: state, localStorage persistence, encounter generation, screen routing, skin switching. |

Load order matters (see the bottom of `PokéCatch.html`): `data.js` → `components`
→ `fte` → `catch` → `pokedex` → `overlays` → `app`.

> **JSX scope note:** each `<script type="text/babel">` is transpiled in its own
> scope, so components are shared via the global scope (they're declared as
> top-level `function`s, which become globals). If you port this to a real build,
> convert these to ES module imports/exports.

---

## 3. Design tokens (from `pc/styles.css`)

These are the source of truth — reuse the variable names, don't hardcode.

### Palette
```
--bg-catch:        #1a1a2e   /* catch screen — cool near-black */
--bg-catch-2:      #16213e
--bg-pokedex:      #f5f2eb   /* pokedex — warm parchment */
--bg-pokedex-dark: #1e1e2a
--accent:          #ff6b6b   /* coral — primary action */
--accent-deep:     #e8514f
--gold:            #ffd93d
--text-primary:    #2d2d2d
--text-light:      #f0f0f0
--text-muted:      #8a8a99
--silhouette:      #3a3a5c   /* uncaught species */
--card-light:      #ffffff
--card-shadow:     0 6px 20px rgba(40,30,20,.10)
```
Page backdrop behind the device is `#0e0e12`.

### Type colors
18 standard Pokémon type colors are defined twice — as CSS vars (`--t-fire`,
`--t-water`, …) and in JS (`PC.TYPE_COLORS`). Examples: `fire #F08030`,
`water #6890F0`, `electric #F8D030`, `grass #78C850`, `psychic #F85888`,
`dragon #7038F8`. Use the full map in `data.js`.

### Spacing / radius / sizing
```
--s1:8  --s2:16  --s3:24  --s4:32      (8px base scale)
--radius:12  --radius-lg:20  --radius-pill:999
--tap:48                                (min touch target)
```

### Type
```
--font-display: 'Fredoka One'   /* headings, buttons, numbers */
--font-body:    'Nunito'        /* everything else; weights 400–900 */
```
Loaded from Google Fonts in the `<head>`.

---

## 4. Skins (theming)

The frame re-skins via a `data-skin` attribute on `#stage`, set from the
trainer's choice. Three skins override `--skin`, `--frame-border`,
`--frame-radius`, `--frame-glow`:

| Skin | Accent | Frame |
| --- | --- | --- |
| `classic` | `#cc0000` red | 6px solid, radius 22, no glow |
| `modern` | `#3b82f6` blue | 1.5px solid, radius 6, blue glow |
| `retro` | `#22c55e` green | 4px solid green, radius 0, hard `0 4px 0` shadow |

---

## 5. Animation

Soft, fast, `ease` only. All keyframes live in `styles.css`. Notable ones:
`pop-in`, `float-y`, `wobble` (ball), `shimmer` (skeleton), `sheet-up`
(bottom sheets), `toast-in`, `star-burst`, `sparkle`, plus the catch sequence:
`throw-up`, `ball-drop`, `mon-shrink`, `mon-pop`, `burst-break`, `ring-burst`,
`gotcha-in`. Reuse these names/values verbatim.

---

## 6. Screens & flow

1. **FTE** (`fte.jsx`) — shown when there's no saved trainer. Pick name, avatar,
   skin → creates the trainer and routes to Catch.
2. **Catch** (`catch.jsx`) — a wild encounter appears; throw a ball (animated
   sequence). On catch, the species is added to the dex; every 5th catch opens a
   **StoneModal** reward. Then a new encounter is generated.
3. **Pokédex** (`pokedex.jsx`) — grid/list of species filtered by region and
   sorted; uncaught entries render as dark silhouettes. Tapping one opens the
   **DetailOverlay**.
4. **DetailOverlay** (`overlays.jsx`) — species art, types, stats, and an
   **evolve** action that consumes an evolution stone from inventory.

State (trainer, caught map, stone inventory, catch count) persists to
`localStorage` under key `pokecatch_v1`. `window.__resetPokeCatch()` clears it.

---

## 7. External data & images

- **Sprites:** `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`
  (shiny variant under `/shiny/`).
- **Species details:** fetched lazily from `https://pokeapi.co/api/v2/pokemon/{id}` (cached in memory).
- **Trainer avatars:** `https://pokemon.fandom.com/wiki/Special:FilePath/{file}?width=240`.

All three require network access. If rebuilding offline, stub these or vendor the
assets locally.

> **Legal:** Pokémon and all related imagery are © Nintendo / Game Freak /
> The Pokémon Company. This is an unofficial fan prototype for design reference only.

---

## 8. Screenshots

`screenshots/` holds rendered captures of every screen and state (splash, catch
sequence, pokedex grid/list, detail, avatars, the three skins, eevee/evolution).
Use these as the visual target when validating a rebuild.
