# Pokédex Project Rules

## Project Context
- **Product:** A browser-based Pokédex app for a young user (nephew)
- **Audience:** Kid-friendly, visually engaging, easy to navigate
- **Tech:** Vanilla HTML/CSS/JS (no framework), PokéAPI for data, GitHub Pages for hosting
- **Stage:** Discovery & planning phase — no code yet

## Design Principles
- Fun and approachable — not clinical or dry
- Art and visuals first — Pokémon are visual creatures
- Simple navigation — a kid should be able to use it without instructions
- Fast and responsive — works on tablet/phone (likely primary device)

## Constraints
- No back-end (static site + public API only)
- No accounts or auth for MVP
- PokéAPI rate limits: cache responses in localStorage
- Must work offline-ish (cached data still browsable)

## Output Standards
- Use structured markdown with clear sections
- Be concise — no filler
- Flag assumptions and open questions explicitly
- When multiple agents collaborate, each agent's contribution must be clearly labelled

## Workflow Rules
- Always state which agent role you are operating as
- PO/Moderator synthesizes at the end of multi-agent steps
- Never skip the reviewer role — challenge outputs before finalizing
- Each step produces a named artifact (e.g., "Brief v1", "UX Strategy v1")
