# Pokémon Catch & Collect — Design Prompt

## What is this?
A browser-based Pokémon catching game built as a gift for a kid (~8–12). The player fills an empty Pokédex by catching random Pokémon via a mini-game. No backend — static site, PokéAPI, localStorage.

---

## Screens to Design (5 total)

### 1. First Time Experience (full-screen paginated flow)
- Step 1: Splash — Poké Ball spin, title "PokéCatch"
- Step 2: "What's your name, Trainer?" — text input
- Step 3: "Choose your look" — 2×4 avatar grid (Red, Blue, Silver, May, Dawn, etc.)
- Step 4: "Choose your Pokédex" — 3 card options (Classic Red, Modern Blue, Retro Pixel)
- Step 5: Chosen Pokédex opens with animation → transitions to Catch screen

### 2. Catch View (home / core game)
- Dark immersive screen (#1a1a2e) — "tall grass at dusk" vibe
- Centre: large Pokémon artwork (~200px) with type-coloured background shift
- Below: ball type indicator (Poké/Great/Ultra/Master/Premier)
- Mini-game: white shrinking circle ring overlaying the Pokémon — tap when aligned
- Big coral "CATCH!" pill button (56px height) when idle
- Success: ball wobble ×3 → stars → "Gotcha!"
- Fail: ball breaks → "It fled!" → next encounter auto-loads
- Shiny: sparkle particles, screen shimmer, Premier Ball
- Footer: "Catches: 147 | Stones: 3"
- Header: avatar + name (left), Pokédex link (right)

### 3. Pokédex View
- Light/warm background (#f5f2eb light, #1e1e2a dark mode)
- Progress bar at top: coral fill, "147/1008"
- Region filter pills (horizontal scroll): All, Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea
- Sort: # (default), A→Z, Z→A
- View toggle: grid / list
- Grid: 4 columns mobile, 6–8 desktop. Cards = 80×100px, 12px radius
  - Caught: colour sprite + #number + name + "×3" count + ✨ if shiny
  - Uncaught: dark purple-grey silhouette + #number + "???"
- Floating "CATCH!" button bottom-centre (always visible)

### 4. Detail Overlay (slides up from bottom, 90% height)
- Drag handle at top
- Large artwork (200–250px)
- Name, #number, type badges (coloured pills), catch count "×4", ✨ shiny badge
- Stat bars: HP, Attack, Defense, Sp.Atk, Sp.Def, Speed — horizontal, type-coloured fill
- Evolution chain: circular thumbnails (48px) connected by arrows. Caught = colour, uncaught = silhouette
- "Use Fire Stone?" button (if eligible + player has stone)
- Flavour text: italic, muted
- Uncaught state: silhouette, stats hidden, big "Go catch it!" CTA

### 5. Stone Selection Modal
- Appears after every 5th catch
- "You earned a stone! Choose one:"
- 2×5 grid of stone icons (64px each): Fire, Water, Thunder, Leaf, Moon, Sun, Dusk, Dawn, Ice, Shiny
- Each stone has its colour glow
- Dark backdrop, no dismiss without choosing

---

## Visual Identity

### Palette
| Token | Value | Use |
|-------|-------|-----|
| bg-catch | #1a1a2e | Catch screen background |
| bg-pokedex | #f5f2eb | Pokédex light mode |
| bg-pokedex-dark | #1e1e2a | Pokédex dark mode |
| accent-primary | #ff6b6b | Buttons, progress bar, energy |
| accent-gold | #ffd93d | Shiny, rewards, sparkle |
| text-primary | #2d2d2d | Body text on light |
| text-light | #f0f0f0 | Body text on dark |
| silhouette | #3a3a5c | Uncaught Pokémon |

Type colours follow standard Pokémon palette (Fire #f08030, Water #6890f0, Grass #78c850, Electric #f8d030, etc.)

### Typography
- **Headings / Pokémon names:** Fredoka One (rounded, playful, bold)
- **Body / UI:** Nunito (clean, rounded sans-serif)

### Spacing
- Base unit: 16px (multiples of 8)
- Touch targets: minimum 48px
- Card radius: 12px
- Generous whitespace — breathable, not cramped

### Mood
Cozy adventure. Treasure chest at night. Personal, collectible, not clinical.

---

## Ball Types (visual hierarchy)
| Ball | Colour | Rarity |
|------|--------|--------|
| Poké Ball | Red/white | Common |
| Great Ball | Blue/red | Uncommon |
| Ultra Ball | Black/gold | Rare |
| Master Ball | Purple/pink | Legendary |
| Premier Ball | White/red + sparkle | Shiny encounters |

---

## Pokédex Skins (chosen in FTE)
| Skin | Frame Style | Accent |
|------|-------------|--------|
| Classic Red | Thick red border, rounded | #cc0000 |
| Modern Blue | Thin border, sharp corners, glow | #3b82f6 |
| Retro Pixel | Chunky 4px pixelated border | #4ade80 |

Skin applies to: Pokédex view frame, Detail overlay header, header bar accent.

---

## Key Design Principles
1. **Mobile-first** — phone is primary device. 4-col grid, big tap targets, bottom-sheet overlays
2. **Two moods** — Catch = dark & dramatic. Pokédex = warm & collectible. 200ms crossfade between.
3. **Game-first** — feels like a Google hidden mini-game, not a database. One tap to play.
4. **Progress is visible** — progress bar, counter, silhouettes filling with colour
5. **No punishment** — fail = new surprise immediately. Never frustrating.
6. **Personal** — name, avatar, skin choice. This is YOUR Pokédex.

---

## Design Deliverables Needed
- [ ] FTE flow (5 steps)
- [ ] Catch view (idle, reveal, mini-game active, success, fail, shiny states)
- [ ] Pokédex grid view (with caught/uncaught states)
- [ ] Pokédex list view
- [ ] Detail overlay (caught, uncaught, shiny, stone-eligible states)
- [ ] Stone selection modal
- [ ] Evolution toast notification
- [ ] Component sheet (header, FAB, pills, cards, badges, bars, toast)

Design for iPhone viewport (390×844) first, then show desktop (1440×900) adaptation for Pokédex grid.
