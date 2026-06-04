# Technical Feasibility v1

## Feature Feasibility

| Feature | Feasibility | Effort |
|---------|-------------|--------|
| FTE (name + avatar + skin + animation) | ✅ Yes | Small |
| Pokédex opening animation | ✅ Yes | Small |
| Catch — random encounter | ✅ Yes with caveats | Small |
| Catch — shrinking circle mini-game | ✅ Yes | Medium |
| Catch — ball type by rarity | ✅ Yes | Small |
| Catch — shiny (1/64) | ✅ Yes | Small |
| Pokédex grid (1008+ entries) | ⚠️ Yes with caveats | Medium |
| Pokédex filters (region) | ✅ Yes | Small |
| Pokédex sort (# / A→Z / Z→A) | ✅ Yes | Small |
| Grid/list toggle | ✅ Yes | Small |
| Detail overlay | ✅ Yes | Small |
| Evolution chain display | ✅ Yes with caveats | Medium |
| Evolution milestones (auto) | ✅ Yes | Small |
| Stone economy (earn + use) | ✅ Yes | Small |
| Pre-fetch queue | ✅ Yes | Medium |

## PokéAPI Mapping

| Data needed | Endpoint |
|-------------|----------|
| Basic data (name, sprites, types, stats) | `GET /pokemon/{id}` |
| Species data (capture_rate, flavor_text, evo chain URL) | `GET /pokemon-species/{id}` |
| Evolution chain | `GET /evolution-chain/{id}` |
| Regional dex lists | `GET /pokedex/{id}` |
| Shiny sprite | `pokemon.sprites.front_shiny` |

API calls per catch: ~1 (served from pre-fetch cache + localStorage)

## Caching Strategy

```
localStorage schema:
├── trainer: { name, avatar, skin, totalCatches }
├── collection: { [pokemonId]: { count, shiny, caughtAt } }
├── stones: { fire: 2, water: 1, thunder: 0, ... }
├── evolutions: { [pokemonId]: currentStage }
├── cache/pokemon/{id}: { ...trimmedData } (TTL: 7 days)
├── cache/species/{id}: { ...trimmedData } (TTL: 7 days)
├── cache/pokedex/{id}: [ ...speciesList ] (TTL: 30 days)
└── cache/evo-chain/{id}: { ...chainData } (TTL: 30 days)
```

**Size estimate:** ~2.5MB worst case (well within 5–10MB browser limit)

**Key optimisation:** Store only essential fields per Pokémon: id, name, types, sprites (front_default + front_shiny), stats, capture_rate, flavor_text, evolution_chain_url.

## Grid Performance Strategy

Region-based pagination (not virtual scroll):
- Default view = selected region (Kanto = 151 entries). Manageable DOM.
- "All" filter uses Intersection Observer — render 50 at a time, load more on scroll.
- Silhouettes = same sprite with CSS `filter: brightness(0)` — no extra image load.
- Caught images use `loading="lazy"`.

## Pre-fetch Queue

```
Queue (in-memory): [pokemon1, pokemon2, pokemon3]

On catch/fail: shift() → show to player
After shift: fetch new random → push (background)
On app load: fill queue with 3 pre-fetched Pokémon
```

Player never waits for API between encounters.

## File Structure

```
project/
├── index.html
├── css/
│   ├── base.css
│   ├── skins.css
│   ├── catch.css
│   ├── pokedex.css
│   └── animations.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── catch.js
│   ├── pokedex.js
│   ├── detail.js
│   ├── evolution.js
│   ├── fte.js
│   └── storage.js
├── assets/
│   ├── avatars/
│   ├── balls/
│   ├── stones/
│   └── ui/
└── manifest.json
```

## Offline / Error Handling

| Scenario | Behaviour |
|----------|-----------|
| API down, queue empty | "Searching tall grass..." retry every 5s. Pokédex browsable from cache. |
| API down, queue has entries | Player catches from queue (max 3 until reconnect) |
| Slow connection | Pre-fetch hides latency. Lazy images + placeholders. |
| Browser data cleared | Collection lost. "Your Pokédex was reset!" message. |

## Performance Risks

| Risk | Mitigation |
|------|------------|
| Large images (official artwork 400×400) | Use `front_default` (96×96) for grid. Large art only in detail. |
| Mini-game jank | Canvas + requestAnimationFrame. No DOM during animation. |
| 1000+ entries sort/filter | Pre-sort arrays on load. Swap between copies. Never sort on interaction. |
| localStorage quota | Check capacity, evict oldest cache first. |

## Key Decisions
- Region-based pagination (not virtual scroll) — simpler, good enough
- Pre-fetch queue of 3 — eliminates wait between catches
- Canvas for mini-game — best performance
- First load requires internet (no service worker for MVP)
- Consistent `front_shiny` sprites for all shiny display
