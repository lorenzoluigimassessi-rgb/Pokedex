# Experience Research v1

## UX Lead Analysis

### Target User Mental Model
- A kid (8–12) on a phone/tablet
- Reference apps: Pokémon GO, Pokémon HOME, gacha games (Roblox crates, FIFA packs)
- Mental model for "catching" = surprise + challenge + reward
- Expects: fast feedback, big visual payoff on success, visible progress (numbers going up, grid filling in)
- Already understands: Pokédex as a checklist, Poké Balls as tools, rarity = harder + cooler

### Key Insight — The Gacha Brain
Kids this age are wired for gacha loops. The "Catch 'Em All" button IS a gacha pull — random encounter, variable rarity, visual reveal. The mini-game adds *agency* — not pure luck, you earn it. Fairer and more satisfying than pure RNG.

### Mini-Game Design

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Type | Timing-based throw — shrinking circle (Pokémon GO style) | Familiar, touch-friendly, scales difficulty |
| Difficulty scaling | Rarer Pokémon → faster shrinking circle | Feels earned, mirrors the games |
| Fail state | Fail = flee → encounter new random one immediately | No frustration — failing still leads to surprise |
| Shiny rate | 1/64 | Rare enough to feel special, common enough to hit within a week |

### Engagement Patterns
- Collection progress bar — visible at all times ("147/1008 caught")
- "New!" badge — recent catches glow in the Pokédex for one session
- Streak counter — catches in a row without missing (cosmetic only)

### Risks
- Mini-game too hard → rage-quit. Keep fail rate ~20–30% for common Pokémon.
- Mini-game too easy → mindless tap. Difficulty curve is critical.

---

## Pokémon Expert Input

### Ball Types by Rarity

| Pokémon tier | Ball given | Catch difficulty |
|--------------|-----------|-----------------|
| Common (capture_rate >200) | Poké Ball | Easy (large circle, slow shrink) |
| Uncommon (100–200) | Great Ball | Medium |
| Rare (45–100) | Ultra Ball | Hard (small circle, fast shrink) |
| Legendary (<45) | Master Ball | Very hard (but guaranteed if timed perfectly) |
| Shiny (any) | Premier Ball | Same difficulty as base tier + sparkle visual |

### Stone Economy
- 5 catches of any Pokémon = 1 stone (player chooses type)
- Stone types match the games: Fire, Water, Thunder, Leaf, Moon, Sun, Dusk, Dawn, Ice, Shiny
- Only stone-evolution Pokémon require stones
- Level-up evolutions auto-trigger at low thresholds
- Trade evolutions auto-trigger at slightly higher threshold

### PokéAPI Confirmation
- `capture_rate` field (0–255) maps cleanly to ball tiers
- Evolution chain data exists under `evolution-chain` endpoint with `evolution_details.item`
- Regional dex splits available via `pokedex/{id}`
- Shiny sprites available at `sprites.front_shiny`

---

## Creative Director — Emotional Tone

**Adventurous, personal, collectible.** It should feel like opening a treasure chest every time you hit "Catch." The Pokédex should feel like YOUR book of discoveries — intimate, not encyclopaedic.

### Key Emotional Beats
1. Catch button press → anticipation
2. Pokémon reveal → excitement
3. Mini-game → focus + tension
4. Success → celebration
5. Pokédex entry fills in → satisfaction
6. Shiny encounter → shock + delight
