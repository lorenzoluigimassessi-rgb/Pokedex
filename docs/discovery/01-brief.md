# Brief v1 — Final

## Product
**Pokémon Catch & Collect** — a browser-based Pokémon game where the player progressively fills their Pokédex by catching Pokémon one at a time through a randomized catch mechanic.

## Audience
- Primary: One specific kid (nephew)
- Age: assumed ~8–12
- Device: likely phone/tablet
- Pokémon familiarity: assumed moderate (knows Pokémon, excited by them)

## Core Value Proposition
A personal Pokémon collection game that rewards repeat visits — every session adds new catches to *your* Pokédex. The fun is in the surprise of what appears and the satisfaction of a growing collection.

## Two Core Functions

| Function | Description |
|----------|-------------|
| **Pokédex** | A full grid (all slots visible as silhouettes). Caught Pokémon are revealed. Browsable, filterable, sortable. |
| **Catch 'Em All** | Tap to encounter a random Pokémon. Rarity/strength determines which Poké Ball you get to throw. Mini-game mechanic makes catching feel earned. |

## Key Flows

1. **FTE (First Time Experience):** Welcome → Enter name → Choose avatar (Red, Blue, Silver, etc.) → Choose Pokédex skin → Opening animation → Catch screen
2. **Catch:** Press "Catch" → Random Pokémon appears → Rarity determines ball type → Mini-game (shrinking circle) → Success/Fail → Dex fills
3. **Browse Pokédex:** Grid/List view → Filter by region → Sort by number / A→Z / Z→A → Tap to view detail
4. **Detail (caught):** Full image, stats/description, evolution line (uncaught evolutions shown as silhouettes)
5. **Detail (uncaught):** Silhouette only → CTA to go catch

## Game Economy

| Mechanic | Rule |
|----------|------|
| Duplicates | Allowed — increments catch counter per Pokémon |
| Shinies | 1/64 encounter chance. Separate tracking. |
| Stones | Every 5 catches = 1 stone (player chooses type) |
| Stone types | Fire, Water, Thunder, Leaf, Moon, Sun, Dusk, Dawn, Ice, Shiny |
| Stone evolutions | Manual — player uses correct stone on eligible Pokémon |
| Level-up evolutions | Auto — base form + 3 catches after (stage 2), +5 after (stage 3) |
| Trade evolutions | Auto — base form + 10 catches after |
| Cooldown | None — catch as often as you want |
| Fail state | Pokémon flees → next encounter immediately |

## Pokédex Skins (FTE choice, cosmetic)

| Skin | Style |
|------|-------|
| Classic Red | Gen 1 flip-open |
| Modern Blue | Clean, glow |
| Retro Pixel | Game Boy style |

## Constraints
- No backend — static site + PokéAPI + localStorage
- No accounts/auth
- Must work on mobile (primary device)
- PokéAPI rate limits → aggressive caching in localStorage
- Vanilla HTML/CSS/JS only

## Success Criteria
- Nephew opens it repeatedly (retention via collection + shinies)
- Can use it without instructions
- Feels like *his* — personalised via name + avatar + skin + unique collection
- Pokédex filling up provides visible progress

## What This Is NOT
- Not a battle system
- Not a clone of Pokémon GO (no location/AR)
- Not a reference wiki (detail is light, not encyclopaedic)
- Not multiplayer
