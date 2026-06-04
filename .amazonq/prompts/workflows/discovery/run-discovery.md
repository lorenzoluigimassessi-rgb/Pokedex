# Workflow: Discovery & Planning

Run this workflow step-by-step. Each step produces a **named artifact**. Do not skip steps. Be hyper-critical — challenge weak thinking, flag vague language, and reject hand-wavy outputs.

---

## How to Run

Execute steps sequentially. After each step, pause and present the artifact for human approval before continuing. If a step includes a **Review Gate**, the reviewer challenges the output *before* it's presented — include both the output and the review in your response.

---

## Step 1: Rewrite the Brief

**Lead:** @po-moderator  
**Input:** The raw project idea (from the human or project rules)  
**Task:**
- Rewrite the brief into a structured, actionable format
- Define: audience, core value proposition, constraints, success criteria, what this is NOT
- Surface ambiguities and state assumptions explicitly
- Keep it to one page — if it can't fit, the scope is too big

**Output artifact:** `Brief v1`

---

## Step 2: Experience Research (UX + Pokémon Lore)

**Lead:** @ux-lead + @pokemon-expert (collaborative)  
**Supporting:** @creative-director (light input on emotional tone only)  
**Input:** `Brief v1`  
**Task:**
- @ux-lead: Analyze the target user (kid, 8-12, phone/tablet). What are their mental models? What apps do they already love and why? What does "browsing Pokémon" actually mean as a task?
- @pokemon-expert: What makes Pokémon *exciting* for this age group right now? What content is most engaging? What patterns from the games/anime/cards translate to a browse experience?
- @creative-director: What emotional tone should this hit? (2-3 sentences max at this stage)
- Together: Identify 3-5 **experience principles** that will guide all downstream decisions

**Output artifact:** `Experience Research v1`

---

## Step 3: UX Strategy

**Lead:** @ux-lead  
**Supporting:** @pokemon-expert (validate content assumptions)  
**Review Gate:** @qa-advocate  
**Input:** `Brief v1` + `Experience Research v1`  
**Task:**
- Define the core user flows (what does the kid DO in this app?)
- Propose navigation architecture (how many screens? how connected?)
- Define information hierarchy: what's shown first, what's progressive disclosure?
- Identify the "signature interaction" — the one thing that makes this feel special
- State what you're deliberately EXCLUDING and why

**Review Gate task (@qa-advocate):**
- Challenge: Is this achievable as a static site with PokéAPI?
- Challenge: Would a 10-year-old actually navigate this without help?
- Challenge: Are we over-designing for an MVP?

**Output artifact:** `UX Strategy v1`

---

## Step 4: Technical Feasibility

**Lead:** @frontend-expert  
**Supporting:** @ux-lead (clarify what needs building)  
**Review Gate:** @qa-advocate  
**Input:** `UX Strategy v1`  
**Task:**
- Assess each proposed flow/feature: feasible / feasible with caveats / risky / no
- Map features to PokéAPI endpoints — flag gaps (what data doesn't exist or requires multiple calls?)
- Identify performance risks (image sizes, API call volume, initial load)
- Propose caching strategy
- Recommend file/module structure at high level
- Flag anything that changes the UX strategy (hard constraints)

**Review Gate task (@qa-advocate):**
- Challenge: What happens offline? On slow connections? When API is down?
- Challenge: Are effort estimates realistic for a vanilla JS project?
- Challenge: Any browser/device compatibility concerns for a kid's device?

**Output artifact:** `Technical Feasibility v1`

---

## Step 5: Visual & Brand Strategy

**Lead:** @creative-director  
**Supporting:** @pokemon-expert (lore-driven visual opportunities)  
**Review Gate:** @qa-advocate  
**Input:** `Brief v1` + `Experience Research v1` + `UX Strategy v1` + `Technical Feasibility v1`  
**Task:**
- Define the visual identity: mood, palette, typography direction, spacing philosophy
- Propose the core visual concept/metaphor (what does this *look and feel* like?)
- Define how Pokémon type theming works (colour system)
- Specify motion/animation intent (what moves, why, how fast)
- Address dark/light mode approach
- Reference visual inspirations (non-Pokémon sources welcome)
- Ensure all proposals are CSS-achievable (no heavy JS animation libraries)

**Review Gate task (@qa-advocate):**
- Challenge: Is the palette accessible (WCAG contrast)?
- Challenge: Can this be implemented with CSS custom properties + vanilla CSS?
- Challenge: Will animations perform on low-end devices?
- Challenge: Is this distinctive enough from official Pokémon apps to feel like a gift, not a knockoff?

**Output artifact:** `Visual Strategy v1`

---

## Step 6: Screen Directions

**Lead:** @ux-lead + @creative-director (collaborative)  
**Supporting:** @frontend-expert (feasibility gut-check only)  
**Input:** `UX Strategy v1` + `Visual Strategy v1` + `Technical Feasibility v1`  
**Task:**
- Describe each key screen in enough detail to sketch or build from:
  - Layout (grid structure, what goes where)
  - Content (what data is shown, in what hierarchy)
  - Interactions (what's tappable, what happens on tap)
  - Visual treatment (how the brand strategy manifests here)
- Cover at minimum: Home/Browse, Pokémon Detail, Search/Filter
- Specify mobile-first layout, then note desktop adaptations
- Use structured text descriptions — not wireframe tools (this is text-based)

**No formal review gate here** — this is a creative proposal, not a locked decision. It gets validated implicitly through the MVP plan.

**Output artifact:** `Screen Directions v1`

---

## Step 7: Build Plan

**Lead:** @po-moderator  
**Supporting:** @frontend-expert (effort sizing)  
**Review Gate:** @qa-advocate (final gate — be ruthless)  
**Input:** All prior artifacts  

**Task:**

First, determine the **scale** of what's being planned based on prior artifacts:

### If it's a full product or major new capability → MVP Plan
- Define MVP scope: what's IN, what's POST-MVP, what's NEVER
- Break into buildable milestones (max 3-4, each deployable)
- For each milestone: features included, effort estimate (S/M/L), dependencies
- Define "done" criteria (what does the user need to be able to do?)
- Produce a prioritised feature list with MoSCoW (Must/Should/Could/Won't)

### If it's a feature or improvement → Feature Build Plan
- Define scope: what this changes, what it doesn't touch
- Break into sequential tasks (max 5-8 steps)
- For each task: what to build, effort (S/M/L), acceptance criteria
- Define "done" for the feature as a whole

### If it's a single task or fix → Task Plan
- Define the task clearly (what changes, where, why)
- List sub-steps if non-trivial
- Effort estimate and any blockers
- Define "done"

**Regardless of scale:**
- Identify the single biggest risk and the mitigation plan
- State what's explicitly out of scope

**Review Gate task (@qa-advocate):**
- Challenge: Is the first deliverable small enough to finish in one session? If not, break it down further
- Challenge: Is anything labelled essential actually optional in disguise?
- Challenge: Are we setting up for scope creep in later phases?
- Challenge: Deployment considerations? (GitHub Pages, static hosting — any gotchas?)

**Output artifact:** `Build Plan v1` (subtitled as MVP Plan / Feature Plan / Task Plan)

---

## Workflow Complete

After Step 7, all artifacts are produced:
1. `Brief v1`
2. `Experience Research v1`
3. `UX Strategy v1`
4. `Technical Feasibility v1`
5. `Visual Strategy v1`
6. `Screen Directions v1`
7. `Build Plan v1`

**Next action:** Human reviews the Build Plan and greenlights implementation, or requests revisions to specific artifacts.
