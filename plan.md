> Owner-supplied mechanics reference, redacted for publication. Historical names and links were replaced; research prose is not a factual claim about Plum Plaza. The current build brief and PROGRESS.md decisions take precedence. Original bytes are backed up outside the repository.

# [original game]-style web game: build spec and Codex prompt

Oct 11, 2026 · @Hari Naralasetty

## Research findings

The game is officially spelled [original game], a suite of three mini-games on one home screen, and the build below clones its mechanics in a browser. "Purple Place" is a common misspelling and also the name of unofficial remakes (a Unity build on Steam from 2023 and a mobile app), so check which one you mean.

**Origin.** original studio Media built it for original publisher; it shipped with Windows Vista (introduced 30 January 2007) and Windows 7, and was removed from later Windows ([Wikipedia]([source omitted])).

**Home screen.** One town screen. The schoolhouse (left) opens Plum Pairs, the cake factory opens Comfy Cakes, the shop opens Plum Shop. There is no unlock order; any game can be started at any time. Each game then asks for Beginner, Intermediate or Advanced ([rules guide]([source omitted])).

**Confirmed facts (two or more sources agree)**

- Pairs: Beginner = one 5x5 board, no timer; Intermediate = two 6x6 boards, timer; Advanced = four 8x8 boards, timer. Goal is to clear boards in the fewest turns. Mismatched tiles flip back.
- Pairs specials: Joker (finds the match for an exposed tile), Clock (adds time), Chef (matches cake tiles), a Comfy Cakes machine tile that reshuffles unmatched tiles when matched, and a Sneak Peek token that shows every remaining tile briefly while each revealed tile counts as a turn.
- Cakes: you move a cake along a conveyor belt under stations, building to match an order shown on a screen. Elements: pan (square, circle, heart), batter (strawberry, chocolate, vanilla), layers, icing (strawberry, chocolate, vanilla), decorations (sugar; rarely flame glaze). A wrong cake is penalised and thrown away; too many wrong orders ends the game; enough correct cakes wins. Higher levels put several cakes on the belt at once.
- Shop: a Mastermind-style code-breaker. Features are topper, eyes, nose, mouth, clothes; colours are red, purple, yellow, blue, green. Beginner = 3 features x 3 colours (27 answers), Intermediate = 4x4 (256), Advanced = 5x5 (3,125). Beginner and Intermediate tell you which items are right; Advanced gives only two counts (right colour and place, right colour wrong place). Beginner has unlimited guesses; the other levels are limited.

**Unknowns the sources do not settle** (the spec turns each into a tunable constant, see Game specs)

- Exact Pairs timer seconds and the Clock bonus size.
- Exact Shop guess limits for Intermediate and Advanced.
- Wrong-cake limit: sources say two or three, and cake counts vary from 5 to 8 by level.
- Whether Comfy Cakes has a timed oven step: one site says yes, Wikipedia's description does not mention it, so the spec leaves it out.
- Cake difficulty names and exact option counts per level, and the scoring formulas (original publisher never published them).
- Rank titles such as Plum Master come from a fan simulator, not the original.

Treat the numbers above as a faithful-enough design target, not a pixel-exact port. Several of the sources are SEO sites, so only facts repeated across them or on Wikipedia are marked confirmed.

## Legal and naming

Clone the mechanics, not the assets or the name. [original game] is original publisher's product, so the build uses an original title, original art, original characters and original audio.

- Working title: **Plum Plaza** (change freely). Mini-games: **Plum Pairs**, **Cozy Cakes**, **Plum Shop**. The characters are original blobs called "Plums"; no Plum or Professor Plum likeness.
- Art: hand-written inline SVG and CSS only (Frutiger Aero feel: glossy gradients, soft shadows, rounded shapes, sky and grass background). No images copied from the original or from clone sites.
- Sound: tiny synthesised tones via the Web Audio API, off by default with a mute toggle remembered in localStorage. No sampled audio.
- Mechanics, rules and difficulty structure are ideas and may be reproduced.
- Do not link to or host any original original publisher game files.

## Stack and run-on-pull

Vite + React 18 + TypeScript, Zustand for state, Vitest for logic tests, Playwright for end-to-end checks. No backend, no database, no API keys, so the game runs entirely in the browser. Defaults chosen to keep the repo small: three runtime dependencies (react, react-dom, zustand), everything else dev-only.

**Run on pull**

```bash
git clone <repo> && cd plum-plaza
npm ci
npm run dev        # [source omitted]
```

Required scripts in package.json:

| Script | Purpose |
| --- | --- |
| `dev` | Vite dev server on port 5173 |
| `build` | `tsc --noEmit` then `vite build` to `dist/` |
| `preview` | Serve `dist/` on port 4173 |
| `test` | Vitest, single run |
| `e2e` | Playwright against `preview` |
| `audit` | Runs lint, typecheck, test, build, e2e in order and fails on the first error |

Pin Node with `.nvmrc` (22) and `engines` in package.json; commit `package-lock.json`. The `dev` script must work after `npm ci` with no extra setup. Deploy target is any static host (`dist/` only), and routes use `HashRouter` so static hosting needs no rewrite rules.

**Repo layout**

```text
src/
  main.tsx, App.tsx, routes.tsx
  config/constants.ts        all tunable numbers (timers, limits, counts)
  core/rng.ts                seeded RNG (mulberry32), shuffle
  games/pairs/   logic.ts  store.ts  PairsScreen.tsx  tiles.tsx
  games/cakes/   logic.ts  store.ts  CakesScreen.tsx  parts.tsx
  games/shop/    logic.ts  store.ts  ShopScreen.tsx  plum.tsx
  ui/            TownScreen, DifficultyDialog, ResultDialog, Button, Hud
  audio/sfx.ts   settings/prefs.ts
tests/unit/      *.test.ts   (logic only, no DOM)
tests/e2e/       *.spec.ts
AUDIT.md         self-audit report (generated by the builder)
```

Rule: all game rules live in pure functions in each `logic.ts` (no React, no timers, no randomness except an injected RNG), so every rule is unit-testable and every game can be replayed from a seed.

## Screens and flow

&#91;embedded content: screen flow · 6 screens, 2 return paths\]

The town screen is the hub. Any building opens the level picker, then that game's play screen, then a result. From a result the player replays, picks another level, or returns to town; leaving a play screen early asks for confirmation first.

| Route | Screen | Notes |
| --- | --- | --- |
| `/` | Town | Three clickable buildings, mute toggle, "best results" panel |
| `/pairs`, `/cakes`, `/shop` | Level picker overlay, then play | `?level=beginner\|intermediate\|advanced` skips the picker; `?seed=<int>` makes a run reproducible |
| any other path | Redirect to `/` | Keep `HashRouter` |

Shared UI rules:

- Every play screen shows a top bar with Back to town, a restart button, and a mute toggle; Cakes and Pairs also show a HUD (turns, timer, mistakes, cakes shipped).
- Result dialog shows the outcome, the key numbers, and three buttons: Play again, Change level, Town.
- Best results per game and level are stored in localStorage under one namespaced key; a corrupt or missing value falls back to empty.
- Keyboard: Tab and Enter work on every button; Esc opens the leave confirmation. Layout works from 360 px wide up; all hit targets are at least 44 px.
- No network calls, spinners or external fonts: everything is bundled, so a cold load works offline.

## Game specs

Every number below that research could not confirm is marked **(assumed)** and lives in `src/config/constants.ts` so it can be tuned without touching logic.

### Plum Pairs (memory match)

Goal: clear every board in the fewest turns. A turn is two flips. A match removes both tiles; a mismatch flips both back after 800 ms. Input is locked during that delay.

| Level | Boards | Grid | Timer per board | Tile mix |
| --- | --- | --- | --- | --- |
| Beginner | 1 | 5x5 | none | 12 pairs + 1 free star tile (auto-clears last) |
| Intermediate | 2 | 6x6 | 180 s (assumed) | 15 pairs + Clock, Chef, Peek pairs |
| Advanced | 4 | 8x8 | 240 s (assumed) | 27 pairs + Joker, Clock, Chef, Shuffle, Peek pairs |

Special pairs trigger when both tiles are matched:

- **Joker**: the game also clears one random other unmatched pair.
- **Clock**: adds 20 s (assumed) to the board timer.
- **Chef**: clears one random unmatched pair of cake-themed tiles, if any remain.
- **Shuffle**: reshuffles the positions of all unmatched tiles (seeded RNG).
- **Peek**: grants one Peek token. Spending a token shows all unmatched tiles for 2 s and adds one turn per tile shown.

Harder levels use more look-alike artwork: Beginner motifs differ in shape and colour, Advanced motifs share shapes and differ only in one detail (colour, eyes, or accessory). Lose by timer expiry; win by clearing the last board. Show turns used, time left, and a result title: Sprout, Bloom, or Plum Master by turns relative to the minimum possible.

### Cozy Cakes (conveyor belt)

Goal: ship cakes that exactly match their order cards. Read-only order cards sit on the left; the belt runs left to right through five stations and ends at a box.

Stations, left to right: **Pan** (round, square, heart), **Batter** (vanilla, chocolate, strawberry; each press adds one layer), **Filling** (red, green, white; goes between layers), **Icing** (none, vanilla, chocolate, strawberry), **Topping** (none, sprinkles, star candy, heart candy; glaze is an optional flag only valid on an iced cake). Then **Box** (ship) and a **Trash** button.

Cake state: `{ pan, layers: [{ batter }], fillings: [...], icing, topping, glaze }`. A cake is correct only if every field equals its order. Rules:

- A station button works only while a cake is aligned under that station; otherwise show a short "not here" nudge.
- Order of operations is enforced: pan first, then batter, then fillings, then icing, then topping; an illegal press is ignored with a visible "not allowed" cue and no penalty.
- Shipping a wrong cake adds one mistake and discards the cake. Trashing a cake costs nothing.
- Game over when mistakes reach the limit; win when correct cakes reach the target.

| Level | Layers | Belt | Cakes on belt | Target | Mistake limit |
| --- | --- | --- | --- | --- | --- |
| Beginner | 1 | manual: Left and Right buttons move the cake one slot | 1 | 5 | 3 |
| Intermediate | 2 | auto, loops, one slot per 1.2 s (assumed) | up to 3 | 5 | 3 |
| Advanced | 3, plus glaze orders | auto, loops, one slot per 0.8 s (assumed) | up to 3 | 6 | 3 (one source says 2, tunable) |

Orders are generated from the seeded RNG; Beginner orders use pan, batter, icing and topping only. Score is cakes shipped, wrong cakes, and time per cake. There is no oven timing step.

### Plum Shop (code-breaker)

Goal: work out the hidden Plum. Each guess fills every slot with a colour; repeats are allowed. Press Guess to get feedback. The curtain lifts on a win or when guesses run out.

| Level | Slots | Colours | Answers | Feedback | Guess limit |
| --- | --- | --- | --- | --- | --- |
| Beginner | eyes, nose, mouth | red, purple, yellow | 27 | per slot: tick or cross | unlimited |
| Intermediate | topper, eyes, nose, mouth | + blue | 256 | per slot: tick or cross | 8 (assumed) |
| Advanced | topper, eyes, nose, mouth, clothes | + green | 3,125 | counts only: right colour and place, right colour wrong place | 10 (assumed) |

Count feedback uses standard Mastermind scoring with duplicates (exact matches first, then the minimum count of each remaining colour). Required test vectors, secret then guess, as (exact, misplaced), R=red P=purple Y=yellow B=blue G=green:

| Secret | Guess | Result |
| --- | --- | --- |
| RPYBG | RRYGB | (2, 2) |
| RRP | RPR | (1, 2) |
| RPY | RRR | (1, 0) |
| RRYY | YYYR | (1, 2) |
| RPY | RPY | (3, 0) |
| RRRR | PPPP | (0, 0) |
| RPYB | BYPR | (0, 4) |

Result title by guesses used relative to the limit: three tiers (for example Sharp Sleuth, Smart Sleuth, Lucky Guesser).

## Build plan

Build in six milestones, each ending at a gate that must pass before the next starts. Commit after each gate.

| # | Milestone | Deliverables | Gate to pass |
| --- | --- | --- | --- |
| 1 | Scaffold | Vite + React + TS app, scripts table from Stack, ESLint, strict tsconfig, constants file, seeded RNG, router with Town screen and three placeholder routes, mute and prefs modules | `npm ci && npm run build && npm test` pass on a clean clone; `npm run dev` serves the town |
| 2 | Plum Shop | `logic.ts` (feedback, win and lose), store, UI for all three levels, answer reveal, result dialog | All 7 test vectors pass; a 1,000-run simulation per level never produces an answer outside its colour set; a solver finishes Beginner in at most 3 guesses by using the ticks |
| 3 | Plum Pairs | Board generator, flip and match logic, specials, timer, Peek tokens, multi-board progression, result dialog | Unit tests for tile counts per level, each special effect, timer expiry, and turn counting with Peek |
| 4 | Cozy Cakes | Order generator, cake state machine, belt (manual and auto), stations, box and trash, mistakes and win logic | Unit tests for order generation validity, step-order enforcement, exact-match grading, mistake limit; belt tick tests with fake timers |
| 5 | Polish | Frutiger-style SVG art for all tiles, parts and Plums, glossy buttons, town illustration, synthesised sounds, responsive layout, reduced-motion support, best-results panel | Manual checklist in Self-audit passes at 360, 768 and 1280 px |
| 6 | Hardening | Playwright flows for all nine game-and-level combos (reach a win or lose), a11y pass, README with run steps, `AUDIT.md` | `npm run audit` exits 0 and `AUDIT.md` lists every check with evidence |

Order matters: the logic for each game is built and tested before any of its screen is drawn, so the UI cannot hide a rules bug.

Decisions the builder should not reopen: the stack, the folder layout, HashRouter, no backend, original art and names. Open choices (title, palette, tile motifs) are left to the builder and listed in `AUDIT.md`.

## Self-audit plan

The builder proves each claim with a command run in this session and records the output in `AUDIT.md`. A check with no recorded output counts as not done.

| Area | Check | How |
| --- | --- | --- |
| Run on pull | Fresh clone works | In a temp dir: `git clone`, `npm ci`, start `npm run dev`, request `[source omitted] and confirm it returns the app HTML; stop the server |
| Build | Production build is clean | `npm run build` exits 0 with no TypeScript errors; `npm run preview` serves `dist/` |
| Size | Stays small | Gzipped JS under 250 kB (assumed budget); report the real number |
| Dependencies | Only the allowed ones | Runtime dependencies are exactly react, react-dom, zustand; list `package.json` in the report |
| Offline | No network at runtime | `grep -rnE "fetch\(\|XMLHttpRequest\|https?://" src` finds nothing but the license or comment text; a Playwright run with all external requests blocked still plays a full round |
| Originality | No original publisher IP | `grep -rniE "Plum\|original studio\|original publisher" src public index.html` returns nothing; every image is inline SVG or CSS |
| Shop logic | Feedback is correct | The 7 test vectors, plus a 1,000-seed simulation per level: answers always use only that level's slots and colours, and a perfect guess always wins |
| Pairs logic | Boards are valid | For every level and 200 seeds: tile counts match the table, every normal tile has exactly one partner, specials appear exactly once as pairs (Beginner instead has one free star tile), a solver clears every board, timers never go negative |
| Pairs effects | Each special works | Unit test per special: Joker, Clock (+20 s), Chef, Shuffle (matched tiles stay put), Peek (turn count rises by the tiles shown) |
| Cakes logic | Grading is exact | Table-driven tests: each differing field (pan, layer count, batter, filling, icing, topping, glaze) fails the match; identical cake passes; glaze without icing is rejected |
| Cakes flow | Rules hold | Illegal step is ignored without penalty; wrong ship adds one mistake; trash adds none; third mistake ends the game; target count wins; belt loops under fake timers |
| Determinism | Seeds replay | The same seed and the same inputs give identical boards, orders and answers |
| End to end | Every combo reachable | Playwright reaches a win or a lose result for all nine game-and-level combos, then Play again, Change level and Town all work |
| Accessibility | Basics | All controls reachable by Tab and Enter; Esc opens leave confirmation; visible focus; colour is never the only signal (Shop ticks and crosses use shapes; tiles differ by shape too); `prefers-reduced-motion` turns off animations |
| Responsive | Three widths | Screenshots at 360, 768 and 1280 px for Town and each game: no horizontal scroll, no overlap, targets at least 44 px |
| Persistence | Prefs survive | Mute and best results survive a reload; corrupted localStorage does not crash the app |

**Fresh-eyes review.** After milestone 6, re-read this whole spec top to bottom and tick every rule against code or a test. If a subagent is available, give it only the spec and the repo and ask it to hunt for gaps; otherwise do the pass as a skeptical outsider. List every gap found and its fix.

**Report format for `AUDIT.md`:** a table of check, command, exit code, key output; then three lists: assumptions made (every value marked assumed), deviations from the spec with the reason, and known issues. Close with: verified done, unfinished, blockers, next steps.

## Prompt for GPT / Codex

Written as a Claude Code or agentic task brief following the prompt:create guidelines: role, context, spec, task, constraints, autonomy, state, verification, output. Paste it as the first message in an empty repo. It is self-contained, so the model does not need this doc.

```text
<role>
You are a senior front-end engineer building a small, polished browser game from a written spec. You work autonomously in an empty git repository and finish the whole project.
</role>

<context>
The owner wants a browser game collection that plays like the classic Windows mini-game suite [original game]: three mini-games on one town screen. It must run straight after a git pull: clone, npm ci, npm run dev, and it works with no backend, no API keys and no network access at runtime.
The original is original publisher's product, so reproduce only the mechanics. Use an original name (working title: Plum Plaza), original characters (blobs called Plums), original art (hand-written inline SVG and CSS, glossy Frutiger Aero look), and original synthesised sound (Web Audio, muted by default). Never use Plum, original studio or original publisher names or assets anywhere in the repo, because the owner intends to publish it.
</context>

<spec>
Stack: Vite, React 18, TypeScript (strict), Zustand, HashRouter. Runtime dependencies are exactly react, react-dom and zustand. Dev tools: Vitest, Playwright, ESLint. Node 22 (.nvmrc and engines). Commit package-lock.json.

Scripts in package.json: dev (Vite on 5173), build (tsc --noEmit then vite build), preview (port 4173), test (Vitest single run), e2e (Playwright against preview), audit (lint, typecheck, test, build, e2e in order, stop on first failure).

Layout: src/main.tsx, App.tsx, routes.tsx; src/config/constants.ts (every tunable number); src/core/rng.ts (seeded mulberry32 and shuffle); src/games/{pairs,cakes,shop}/ each with logic.ts (pure functions, no React, no timers, RNG injected), store.ts, a Screen.tsx and art components; src/ui/ (TownScreen, DifficultyDialog, ResultDialog, Button, Hud); src/audio/sfx.ts; src/settings/prefs.ts; tests/unit; tests/e2e; AUDIT.md; PROGRESS.md; README.md with run steps.

Screens and routes: / is the town with three clickable buildings (schoolhouse = Plum Pairs, cake factory = Cozy Cakes, shop = Plum Shop), a mute toggle and a best-results panel. /pairs, /cakes, /shop open a level picker (Beginner, Intermediate, Advanced), then the play screen, then a result dialog with Play again, Change level and Town. Query params: level=beginner|intermediate|advanced skips the picker; seed=<int> makes a run reproducible. Unknown paths redirect to /. Every play screen has Back to town (with a leave confirmation, also on Esc), restart and mute. Best results live in one namespaced localStorage key and fall back to empty if the value is corrupt. Keyboard works everywhere, hit targets are at least 44 px, layout works from 360 px up, prefers-reduced-motion disables animation, colour is never the only signal.

Plum Pairs (memory match). A turn is two flips. A match removes both tiles; a mismatch flips back after 800 ms with input locked. Levels: Beginner = 1 board 5x5, no timer, 12 pairs plus one free star tile that clears last. Intermediate = 2 boards 6x6, timer 180 s per board (assumed), 15 pairs plus Clock, Chef and Peek pairs. Advanced = 4 boards 8x8, timer 240 s per board (assumed), 27 pairs plus Joker, Clock, Chef, Shuffle and Peek pairs. Matching a special pair triggers it: Joker clears one other random unmatched pair; Clock adds 20 s (assumed); Chef clears one random unmatched cake-themed pair if any remain; Shuffle reshuffles positions of all unmatched tiles using the seeded RNG; Peek grants a token, and spending a token shows all unmatched tiles for 2 s and adds one turn per tile shown. Harder levels use more look-alike art. Lose when a timer hits zero; win when the last board clears. Result shows turns, time left and a title (Sprout, Bloom, Plum Master) by turns relative to the minimum.

Cozy Cakes (conveyor belt). Five stations left to right: Pan (round, square, heart), Batter (vanilla, chocolate, strawberry; each press adds one layer), Filling (red, green, white; between layers), Icing (none, vanilla, chocolate, strawberry), Topping (none, sprinkles, star candy, heart candy; plus an optional glaze flag valid only on an iced cake). Then a Box to ship and a Trash button. Order cards on the left show what each cake must be. Cake state: pan, layers (batter each), fillings, icing, topping, glaze; a cake is correct only if every field equals its order. A station button works only when a cake is aligned under that station. Order of operations is enforced: pan, batter, fillings, icing, topping; an illegal press is ignored with a visible cue and no penalty. Shipping a wrong cake adds one mistake and discards the cake; trashing costs nothing. Levels: Beginner = 1 layer, manual belt with Left and Right buttons moving the cake one slot, 1 cake on the belt, target 5 correct, game over at 3 mistakes; orders use pan, batter, icing and topping only. Intermediate = 2 layers, automatic looping belt one slot per 1.2 s (assumed), up to 3 cakes, target 5, 3 mistakes. Advanced = 3 layers plus glaze orders, belt one slot per 0.8 s (assumed), up to 3 cakes, target 6, 3 mistakes (one source says 2; keep it a constant). Orders come from the seeded RNG. There is no oven timing step.

Plum Shop (code-breaker). The hidden Plum has slots filled with colours, repeats allowed. Beginner = eyes, nose, mouth; red, purple, yellow; 27 answers; per-slot tick or cross feedback; unlimited guesses. Intermediate = adds topper and blue; 4 slots, 256 answers; per-slot feedback; 8 guesses (assumed). Advanced = adds clothes and green; 5 slots, 3125 answers; feedback is only two counts (right colour and place, right colour wrong place); 10 guesses (assumed). Count feedback is standard Mastermind with duplicates: exact matches first, then the minimum count of each remaining colour. Test vectors, secret then guess, result (exact, misplaced), R red P purple Y yellow B blue G green: RPYBG vs RRYGB = (2,2); RRP vs RPR = (1,2); RPY vs RRR = (1,0); RRYY vs YYYR = (1,2); RPY vs RPY = (3,0); RRRR vs PPPP = (0,0); RPYB vs BYPR = (0,4). A win or an exhausted guess limit lifts the curtain. Result title by guesses used relative to the limit, three tiers.

Values marked assumed are unconfirmed by research. Keep them in constants.ts, and list each one in AUDIT.md.
</spec>

<task>
Build the complete game in six milestones, committing after each gate: (1) scaffold with scripts, router, town placeholder, constants, RNG, prefs; (2) Plum Shop logic, tests and UI; (3) Plum Pairs; (4) Cozy Cakes; (5) polish: SVG art, town illustration, sounds, responsive layout, reduced motion, best-results panel; (6) hardening: Playwright flows for all nine game and level combinations, accessibility pass, README, AUDIT.md. Write and test each game's logic.ts before drawing its screen, so the interface cannot hide a rules bug.
</task>

<constraints>
- Follow the spec. Add no features, dependencies or abstractions it does not call for; this keeps the repo small and the audit tractable.
- Game rules live only in the pure logic modules, because that makes every rule unit-testable and every run replayable from a seed.
- Write general logic, not code that satisfies only the tests. If a test or a spec line looks wrong or conflicting, say so in AUDIT.md and pick the simplest reasonable reading instead of working around it.
- Make no network requests at runtime. Bundle everything.
- Where the spec is silent on a detail, choose the simplest option and record it as a decision in PROGRESS.md.
</constraints>

<autonomy>
Proceed without waiting for approval. Ask the owner only if you are blocked by something you cannot resolve yourself, such as a missing tool. Local, reversible actions are fine. Do not force-push, delete anything outside the repository, deploy, or publish anything.
</autonomy>

<state>
Keep PROGRESS.md with the milestone checklist, decisions and open items, and update it at every gate. Your context may be compacted, so save state to files and git regularly and do not stop early because of context budget.
</state>

<verification>
At each gate run that milestone's checks. At the end run npm run audit, then prove run-on-pull in a fresh temporary clone: git clone, npm ci, start npm run dev, request [source omitted] and confirm the app HTML comes back, then stop the server; also run npm run build and npm run preview. Also verify: gzipped JS under 250 kB (assumed budget, report the real number); runtime dependencies are exactly react, react-dom and zustand; grep of src finds no fetch, XMLHttpRequest or http URLs; grep for Plum, original studio and original publisher finds nothing in src, public or index.html; Playwright reaches a win or lose result for all nine combinations with external requests blocked; screenshots at 360, 768 and 1280 px show no horizontal scroll or overlap. Do not claim a check passed unless you ran it and saw the output. Finally re-read this whole brief against the code and tests, tick every rule, and list gaps with fixes.
</verification>

<output_format>
After each milestone, post three short lines: what is done, the evidence (command and result), and what is next. Your final message is plain prose with at most one short list, covering what is verified done, what is unfinished, any blockers, and the next steps. AUDIT.md holds a table of check, command, exit code and key output, followed by lists of assumptions, deviations from the spec with reasons, and known issues.
</output_format>
```

Rationale: the target is an agentic build brief, so it uses the Claude Code variant (context, task, constraints, autonomy, state, verification) with the whole spec inline because the builder starts cold. The main guards are no test gaming, no extra scope, and a no-claim-without-output rule; assumed numbers are fenced into one constants file. After a first run, tune the milestone granularity and the assumed timers and limits against how the game actually feels.
