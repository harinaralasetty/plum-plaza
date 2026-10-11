# Plum Plaza progress

## Goal and constraints
Six gated commits; React 18, strict TypeScript, Vite, Zustand, local HashRouter; bundled original art/audio; no runtime network. Every game rule in pure logic with injected RNG.

## Milestones
- [x] 1 Scaffold
- [x] 2 Shop
- [x] 3 Pairs
- [x] 4 Cakes
- [x] 5 Polish
- [ ] 6 Hardening

## Decisions
- Local HashRouter avoids adding a fourth runtime dependency. Hash query parameters are canonical; outer URL query parameters also accepted.
- Seed defaults to current timestamp when omitted; explicit seed is an integer.
- Existing supplied plan redacted for publication; original backed up outside repository.
- Use standard native buttons, select controls and modal dialogs for keyboard access.

## Open items
Hardening: full Safari gameplay/accessibility audit, final brief checklist and fresh-clone proof.

## Gate 1
Node 22.23.3; build, core test and lint pass. Dev returned app HTML on 5173. Initial dev tool pins reported vulnerabilities; upgraded to patched tools, npm reports 0 vulnerabilities. Shop/Pairs/Cakes logic prepared independently and excluded from scaffold commit. Safari WebDriver needs Allow remote automation enabled; owner notified.

Scaffold fresh clone confirmed npm ci/build/core test on Node22. Safari automation owner enabled; connection being checked.

## Gate 2
Shop logic tested before screen: all7 feedback vectors;1000seeds per level; beginner solver<=3guesses; limits and locking.14 tests pass; shared dialogs/navigation and original Plum SVG UI; build/lint pass.

## Gate 3
Pairs logic tested before screen.13 tests: 200seeds per level/solver all boards; all5 specials; input locks, Peek cost, timer clamp, deterministic replay. UI/store integrated; build/lint pass.
Decisions: explicit Next board; tokens reset per board; automatically removed specials do not cascade; rank minimum deducts possible Chef/Joker free pairs (12/34/120). Sprout/Bloom/Plum Master ratios in constants. Modal leave confirmation does not pause timers.

Gate3 correction: added minimum-rank test initially used unimported test helper; corrected to imported it. Shell did not stop after chain failure; corrected execution to set -e and amended gate only after verified checks.

Existing rank expectation also needed update after theoretical-minimum correction; fixed to explicit12/34/120 table. Safari27.0 session creation times out even with remote automation, reproduced after driver restart; issue18109 matches. Apple Events alternative requested.

## Gate4
Cakes logic tested before UI.7tests:3000seed orders, every field grading, step/alignment/limits, free trash, target, multiple-cake fake-timer belt. Build/lint pass.
Decisions: explicit Add cake (first blank provided); all batter then ordered fillings; glaze at topping only after topping chosen and real icing; six-slot looping belt; no oven. Successful scores compare mistakes; time per shipped cake is displayed.

## Polish/review milestone
Original SVG town/buildings; SVG game motifs and Plums; gloss styling, min44targets, 360px8x8 layout, reduced-motion styles, best-results panel and muted synthesised sound. Independent fresh-eyes review found and fixed fixed-unit time conversion, tunable Pairs instruction text, stale leave state on replay, and browser hash/history navigation guard. Safari UI successfully opened own testtab and displayed town. Apple Events recovered after Safari restart; WebDriver remains unavailable. The authorised Safari-only runner selects its own new window by ID difference and never relies on front-window ordering.

## Gate 5
Build, lint and all35unit tests pass on Node22. Safari visual gate passes12 town/Advanced-layout cases at360/768/1280: no horizontal overflow, no overlapping controls, all targets at least44CSSpx. Native window screenshots captured and reviewed. Native select controls needed explicit appearance/height styling in Safari. Art/audio/best panel and navigation review fixes complete.
