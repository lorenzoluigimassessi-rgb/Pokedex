# UX Strategy v1

## Design Inspiration
Google hidden mini-games (dino runner, PAC-MAN doodle): zero onboarding, one core interaction, instant gratification, endlessly replayable.

## Evolution Milestones (Simplified)

| Evolution type | Trigger |
|----------------|---------|
| Level-up (stage 2) | Catch the base form + 3 total catches after |
| Level-up (stage 3) | Catch stage 2 + 5 total catches after |
| Trade evolutions | Catch the base form + 10 total catches after |
| Stone evolutions | Manual — use the correct stone |

Thresholds are trivially low — evolutions just *happen* as the kid plays. Stones are the only intentional "puzzle."

## Navigation Architecture

Two-screen app + overlays:

| View | Purpose |
|------|---------|
| **Catch** (default/home) | The game. Tap to encounter → mini-game → result |
| **Pokédex** | The collection. Grid/list, filters, progress |
| **Detail** (overlay) | Tapped from Pokédex. Stats, evolution chain, catch count |

Plus a one-time **FTE flow** (welcome → name → avatar → Pokédex skin → opening animation).

## Core User Flows

### Flow 1: First Time Experience
1. App opens → animated splash (Poké Ball spin)
2. "What's your name, Trainer?" → text input
3. "Choose your look" → avatar grid (Red, Blue, Silver, May, Dawn, etc.)
4. "Choose your Pokédex" → 3 skin options (Classic Red, Modern Blue, Retro Pixel)
5. Opening animation of chosen Pokédex → lands on Catch screen
6. First catch is guided (coach marks on circle mechanic)

### Flow 2: Catch (Core Loop)
1. Tap the big "Catch" button
2. Tall grass / mystery state → "A wild Pokémon appeared!"
3. Silhouette reveals with type-coloured flash
4. Ball type appears (Poké/Great/Ultra/Master) — signals difficulty
5. Mini-game: shrinking circle, tap when ring hits sweet spot
6. Success → celebration (sparkles, ball shake ×3, "Gotcha!"), counter updates
7. Fail → "Oh no! It fled!" → immediately shows next encounter
8. Shiny encounter → sparkle on reveal, Premier Ball, screen shimmer

### Flow 3: Pokédex Browse
1. Tap "Pokédex" tab
2. Grid of all Pokémon (silhouettes for uncaught, colour images for caught)
3. Top bar: progress counter ("147/1008"), region filter pills, sort toggle
4. Filter by region: All (default), Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea
5. Sort: # (default), A→Z, Z→A
6. View toggle: Grid / List
7. Tap a caught Pokémon → Detail overlay slides up

### Flow 4: Detail View
1. Full artwork (large)
2. Name, number, type badges
3. Catch count ("×7") + shiny indicator
4. Evolution chain (caught = colour, uncaught = silhouette)
5. Basic stats (HP, Attack, etc. as simple bars)
6. Flavour text
7. Uncaught Pokémon → "Go catch it!" CTA → switches to Catch view

### Flow 5: Evolution
- Passive: after catch, if milestone met → toast: "Your [X] evolved into [Y]!"
- Active (stones): in Detail view → "Use [Stone Name]?" button → tap → evolution animation → new entry

## Signature Interaction
The **catch moment** — shrinking circle tap. One input, variable difficulty, instant outcome, always available, endlessly replayable.

## Information Hierarchy

| Priority | Catch view | Pokédex view | Detail view |
|----------|-----------|--------------|-------------|
| 1st | The Pokémon (big, centre) | Progress counter | Artwork (large) |
| 2nd | Ball type indicator | Grid of silhouettes/images | Name + type |
| 3rd | The circle mechanic | Region filters | Evolution chain |
| 4th | Result feedback | Sort/view controls | Stats + flavour text |

## Deliberately Excluded

| Excluded | Why |
|----------|-----|
| Battle system | Scope explosion |
| Trading | Requires multiplayer infra |
| Abilities/moves list | Too encyclopaedic |
| Sound/music | Nice-to-have, not core |
| Animated sprites | Performance concern |
| Achievements/badges | Scope creep — post-MVP |
