# Screen Directions v1

## Screen 1: First Time Experience (FTE)

### Layout (mobile-first, full-screen paginated flow)

| Step | Content | Interaction |
|------|---------|-------------|
| 1 — Splash | Poké Ball spins, cracks open, title fades in | Auto-advances 2s or tap to skip |
| 2 — Name | "What's your name, Trainer?" + text input + Next | Min 2 chars to proceed |
| 3 — Avatar | "Choose your look" + 2×4 grid of character portraits | Tap to select (gold ring), then Next |
| 4 — Pokédex | "Choose your Pokédex" + 3 card previews (Red, Blue, Pixel) | Tap to select, then "Open it!" |
| 5 — Opening | Selected Pokédex animates open → transitions to Catch screen | Non-interactive, 2–3s |

### Visual
- Deep navy background throughout
- Fredoka One for prompts — big, bold, centred
- Avatars: circular, 64px, white border. Selected = gold ring + scale
- Pokédex previews: 120px cards showing frame style + name. Selected = glow + lift

### Desktop
- Same flow, centred in 400px column. Decorative Poké Balls floating in background at low opacity.

---

## Screen 2: Catch View (Home / Core Game)

### Layout

```
┌─────────────────────────────────┐
│ [Avatar] Trainer Name    [Pokédex]│  ← Thin header
├─────────────────────────────────┤
│                                 │
│        ┌───────────┐            │
│        │  POKÉMON  │            │  ← Centre: encounter area
│        │  (large)  │            │
│        └───────────┘            │
│                                 │
│     ◯ Shrinking circle ◯       │  ← Mini-game (when active)
│                                 │
│   [Ball type indicator]         │
│                                 │
│      ┌──────────────┐          │
│      │    CATCH!    │          │  ← Big FAB
│      └──────────────┘          │
│                                 │
│  Catches: 147  |  Stones: 3    │  ← Status footer
└─────────────────────────────────┘
```

### States

| State | Shown | Interaction |
|-------|-------|-------------|
| Idle | Tall grass sway, "Tap to encounter!" | Tap CATCH button |
| Reveal | Silhouette → flash → colour. Ball type appears. BG shifts to type colour. | Auto, 1s |
| Mini-game | Shrinking circle overlays Pokémon | Tap anywhere when ring aligns |
| Success | Ball arcs, wobble ×3, click, stars. "Gotcha! [Name]!" Counter increments. | Tap to continue |
| Fail | Ball breaks, Pokémon fades. "Oh no! It fled!" | Auto-advances 1s |
| Shiny | Shimmer, sparkle particles, Premier Ball, ✨ icon | Same flow |
| Evolution toast | "Your [X] evolved into [Y]!" slides down | Auto-dismiss 3s or tap |
| Stone earned | Modal: "Choose a stone:" + 10 stone grid | Tap to collect |

### Visual
- Background: #1a1a2e + gradient shift to type colour on reveal
- Pokémon: centred, ~200px, subtle float bob
- Circle: white ring, 3px stroke, 200px → 40px. Sweet spot = 40–60px (green zone)
- CATCH button: coral pill, 56px height, Fredoka One, pulse when idle
- Status footer: small, muted, Nunito

### Desktop
- Centred, max-width 500px. Pokémon larger (~300px). BG fills viewport.

---

## Screen 3: Pokédex View

### Layout

```
┌─────────────────────────────────┐
│ [Avatar] Trainer Name     [Catch]│
├─────────────────────────────────┤
│  ██████████░░░░░░  147/1008     │  ← Progress bar
├─────────────────────────────────┤
│ [All] [Kanto] [Johto] [Hoenn].. │  ← Region pills (h-scroll)
├─────────────────────────────────┤
│ Sort: [#▼]     View: [⊞] [≡]   │  ← Sort + view toggle
├─────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │ 🌑 │ │ 🔥 │ │ 🌑 │ │ 🌑 │   │  ← 4-col grid
│  │#001│ │#002│ │#003│ │#004│   │
│  │ ???│ │Ivy.│ │ ???│ │ ???│   │
│  └────┘ └────┘ └────┘ └────┘   │
│         ... scroll ...          │
│      ┌──────────────┐          │
│      │    CATCH!    │          │  ← Floating action button
│      └──────────────┘          │
└─────────────────────────────────┘
```

### Card Content

| Element | Caught | Uncaught |
|---------|--------|----------|
| Image | Colour sprite 96×96 | Silhouette (CSS filter) |
| Number | #001 | #001 |
| Name | "Bulbasaur" | "???" |
| Shiny badge | ✨ (if caught) | — |
| Count | "×3" (if >1) | — |

### List View
Row: [sprite] #001 Bulbasaur ×3 ✨

### Interactions
- Tap caught → Detail overlay
- Tap uncaught → shake + "Not yet caught!" + CATCH button glows
- Region pills: h-scroll, tap to filter. Active = solid fill, inactive = outline
- Sort dropdown: #, A→Z, Z→A
- View toggle: grid/list via CSS class swap

### Visual
- Background: cream (light) / charcoal (dark)
- Cards: white/dark rounded rects, 12px radius, subtle shadow
- Progress bar: coral gradient fill, rounded pill
- Region pills: 32px height, rounded-full
- CATCH FAB: coral pill, bottom-centre, 56px, fixed

### Desktop
- 6–8 columns. Sidebar for region filters. Cards larger.

---

## Screen 4: Detail Overlay

### Layout (slides up, covers 90% of screen)

```
┌─────────────────────────────────┐
│  ──── (drag handle)             │
├─────────────────────────────────┤
│        ┌─────────────┐          │
│        │   ARTWORK   │          │  ← 200–250px
│        └─────────────┘          │
│   #006  CHARIZARD        ✨×4   │
│   [🔥 Fire] [✈️ Flying]         │  ← Type badges
├─────────── STATS ───────────────┤
│  HP       ████████████░░  78    │
│  Attack   ████████████░░  84    │  ← Horizontal bars
│  Defense  ██████████░░░░  78    │
│  Speed    ████████████░░  100   │
├─────────── EVOLUTION ───────────┤
│  [Charmander]→[Charmeleon]→[YOU]│
│  [🔥 Use Fire Stone?]           │  ← If eligible + has stone
├─────────── ABOUT ───────────────┤
│  "Spits fire that is hot enough │
│   to melt boulders."           │
└─────────────────────────────────┘
```

### States

| State | Difference |
|-------|-----------|
| Caught (normal) | Full colour, all data |
| Caught (shiny) | Shiny art, ✨ badge, gold accent |
| Uncaught | Silhouette, "???", stats hidden, "Go catch it!" CTA |
| Stone-eligible | "Use [Stone]?" button in evolution section |

### Interactions
- Pull down / tap outside → close
- Tap evolution chain member → navigate to that detail
- "Go catch it!" → switch to Catch view
- "Use [Stone]?" → confirm → evolution animation → update

### Visual
- White/charcoal background
- Pokédex skin frame at top edge
- Type badges: coloured pills, white text
- Stat bars: type-coloured fill, grey track
- Evolution chain: 48px circular thumbnails connected by arrows
- Flavour text: italic, muted

### Desktop
- Centred modal (600px max-width). Artwork 300px. Stats + evolution side-by-side.

---

## Screen 5: Stone Selection Modal

### Layout

```
┌─────────────────────────────────┐
│    "You earned a stone!"        │
│    "Choose one:"                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │Fire│ │Water│ │Thun│ │Leaf │  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │Moon│ │Sun │ │Dusk│ │Dawn │  │
│  ┌────┐ ┌────┐                  │
│  │Ice │ │Shiny│                  │
└─────────────────────────────────┘
```

### Interaction
- Tap stone → bounce → flies into inventory → modal closes → toast confirmation
- No dismiss without choosing (reward must be claimed)

### Visual
- Dark backdrop. Stone icons 64px with colour glow. Fredoka One header.

---

## Component Inventory

| Component | Spec |
|-----------|------|
| Header bar | 48px, flex, avatar 32px + name left, nav right |
| CATCH FAB | Coral pill, 56×160px, fixed bottom-centre, 16px margin, shadow |
| Region pill | 32px, rounded-full, border inactive, fill active |
| Grid card | 80×100px, 12px radius, image + number + name |
| List row | Full width, 56px, image 40px + number + name + count |
| Type badge | Pill, 24px, type-colour fill, white 12px text |
| Stat bar | 100% width, 8px, rounded, grey track, coloured fill |
| Toast | Bottom-centre, slides up, auto-dismiss 3s, dark bg |
| Progress bar | Full width, 8px, rounded-full, coral fill |

---

## Screen Flow

```
[FTE] → [CATCH VIEW] ←→ [POKÉDEX VIEW]
              │                 │
              ▼                 ▼
       [STONE MODAL]    [DETAIL OVERLAY]
              │                 │
              ▼                 ▼
       [EVO TOAST]      [EVOLUTION in-place]
```

Total: 5 screens/overlays. Feels like 2 (Catch + Pokédex).
