# Plum Plaza progress

## Goal and constraints
Six gated commits; React 18, strict TypeScript, Vite, Zustand, local HashRouter; bundled original art/audio; no runtime network. Every game rule in pure logic with injected RNG.

## Milestones
- [x] 1 Scaffold
- [x] 2 Shop
- [ ] 3 Pairs
- [ ] 4 Cakes
- [ ] 5 Polish
- [ ] 6 Hardening

## Decisions
- Local HashRouter avoids adding a fourth runtime dependency. Hash query parameters are canonical; outer URL query parameters also accepted.
- Seed defaults to current timestamp when omitted; explicit seed is an integer.
- Existing supplied plan redacted for publication; original backed up outside repository.
- Use standard native buttons, select controls and modal dialogs for keyboard access.

## Open items
All implementation and verification gates pending.

## Gate 1
Node 22.23.3; build, core test and lint pass. Dev returned app HTML on 5173. Initial dev tool pins reported vulnerabilities; upgraded to patched tools, npm reports 0 vulnerabilities. Shop/Pairs/Cakes logic prepared independently and excluded from scaffold commit. Safari WebDriver needs Allow remote automation enabled; owner notified.

Scaffold fresh clone confirmed npm ci/build/core test on Node22. Safari automation owner enabled; connection being checked.

## Gate 2
Shop logic tested before screen: all7 feedback vectors;1000seeds per level; beginner solver<=3guesses; limits and locking.14 tests pass; shared dialogs/navigation and original Plum SVG UI; build/lint pass.
