# Visual Strategy v1

## Mood
Cozy adventure — like opening a treasure chest in your bedroom at night.

## Visual Concept
Two visual modes, one app:

| Mode | Feeling | Palette |
|------|---------|---------|
| **Catch** | Dark, immersive, dramatic | Deep navy + bright type-coloured bursts |
| **Pokédex** | Warm, collectible, organised | Cream (light) or soft charcoal (dark) |

The catch screen = **stepping into tall grass at dusk.**
The Pokédex = **your personal field journal.**

## Palette

```
Core:
--bg-catch:       #1a1a2e    (deep navy)
--bg-pokedex:     #f5f2eb    (warm cream)
--bg-pokedex-dark:#1e1e2a    (soft charcoal)
--accent-primary: #ff6b6b    (coral red — Poké Ball energy)
--accent-gold:    #ffd93d    (gold — shiny, reward)
--text-primary:   #2d2d2d    (near-black on light)
--text-light:     #f0f0f0    (white-ish on dark)
--silhouette:     #3a3a5c    (muted purple-grey)

Type colours:
--type-fire:      #f08030
--type-water:     #6890f0
--type-grass:     #78c850
--type-electric:  #f8d030
--type-psychic:   #f85888
--type-dragon:    #7038f8
--type-dark:      #705848
--type-fairy:     #ee99ac
--type-ghost:     #705898
(standard Pokémon type colours for all 18 types)
```

## Light/Dark Mode
- Catch view: ALWAYS dark (immersive)
- Pokédex view: defaults light, respects `prefers-color-scheme: dark`
- Contrast between views = "entering the field" vs. "coming home to journal"

## Typography

| Use | Font |
|-----|------|
| Headings / Pokémon names | **Fredoka One** (rounded, playful, bold) |
| Body / stats / UI | **Nunito** (clean, rounded sans-serif) |

Two fonts only. Both rounded — cohesive, friendly, not cartoonish.

## Spacing & Layout
- Generous touch targets: minimum 48px
- Base unit: 16px, multiples of 8
- Card-based Pokédex: 12px radius, subtle shadow
- Full-bleed catch screen: no chrome during mini-game
- Floating action button for "Catch" when in Pokédex view

## Motion & Animation

| Moment | Animation | Duration |
|--------|-----------|----------|
| Pokédex open (FTE) | Skin-specific | 2–3s |
| Pokémon reveal | Silhouette → colour flash | 0.5s |
| Shrinking circle | Smooth ease-in contraction | 2–4s (varies) |
| Ball throw | Arc to Pokémon | 0.4s |
| Ball shake (success) | Wobble ×3 → click → stars | 1.5s |
| Catch fail | Ball breaks → fade out | 0.6s |
| Shiny sparkle | Particle burst + shimmer | 1s |
| Evolution | Glow → morph → reveal | 2s |
| Pokédex card flip | 3D backface → front | 0.4s |
| Stone earn | Icon drops with bounce | 0.5s |

**Rules:** All CSS/Canvas. `prefers-reduced-motion` respected. Never block interaction.

## Pokédex Skins

| Skin | Border/Frame | Accent |
|------|-------------|--------|
| Classic Red | Thick red border, rounded | #cc0000 |
| Modern Blue | Thin border, sharp corners | #3b82f6 |
| Retro Pixel | Chunky 4px border, pixel corners | #4ade80 |

Skin affects: Pokédex frame, Detail overlay header, header accent. Nothing else.

## Silhouette Treatment
- Uncaught: solid `#3a3a5c` via `filter: brightness(0) saturate(0) opacity(0.6)`
- Hover/tap (uncaught): slight glow pulse
- Caught: full colour, subtle drop shadow
- Shiny caught: tiny sparkle icon in corner

## Type-Colour Encounters
When a Pokémon appears, the catch screen background shifts to the Pokémon's primary type colour (dark tinted). Every encounter feels visually distinct.

## Ball Visual Hierarchy
- Poké Ball: red/white (common)
- Great Ball: blue + red (uncommon)
- Ultra Ball: black + gold (rare)
- Master Ball: purple + pink (legendary)
- Premier Ball: white + red + sparkle (shiny)

## References
- Pokémon GO catch circle
- Animal Crossing: Pocket Camp museum UI
- Duolingo reward moments
- Notion card views
- Nintendo Switch UI
