# Plum Plaza

Three original, local browser games in one little town: Plum Pairs (memory), Cozy Cakes (conveyor orders), and Plum Shop (deduction). All art is hand-written SVG/CSS and audio is synthesised, muted by default. No backend, keys, external fonts or runtime services.

[Play Plum Plaza](https://harinaralasetty.github.io/plum-plaza/) · [Source](https://github.com/harinaralasetty/plum-plaza)

## Run

Use Node 22 (22.12 or later in the 22 series):

```sh
git clone https://github.com/harinaralasetty/plum-plaza.git
cd plum-plaza
nvm use # or install Node 22 yourself
npm ci
npm run dev
```

Open http://localhost:5173. Installation downloads development packages; the built game needs only its bundled files. For a production build:

```sh
npm run build
npm run preview
```

Preview uses http://localhost:4173. Serve `dist/` from any static host. Hash routes need no server rewrites. For a repeatable game use `/#/shop?level=advanced&seed=123`, substituting `pairs` or `cakes`. Levels are `beginner`, `intermediate`, `advanced`; omitting level opens a picker. Seeds are safe integers, normalised by the 32-bit generator. Outer URL query parameters are also accepted.

## Play

- Pairs: flip two tiles. Matched tiles disappear; mismatches lock for 800 ms. The free star clears last. Timed levels have specials and multiple boards; use Next board after clearing one. Peek costs a turn for every revealed tile.
- Cakes: select a cake, then click the illustrated pan, batter bowl, filling jar, icing bag or topping under its matching station. Add every batter layer, then fillings in order, then icing and topping. Select `none` explicitly when the order calls for it. Advanced glaze is applied at Topping after an iced cake has its topping. Beginner has Left/Right; higher levels loop automatically. Add cake starts another order when the pan slot is empty. Ship at Box; Trash is free.
- Shop: click illustrated eyes, noses, mouths, toppers and clothes on the shelves to dress your Plum, then Guess. A tick badge marks each chosen part. Colours may repeat. Beginner and Intermediate show ticks/crosses per slot; Advanced shows exact/misplaced counts. The curtain lifts at the end.

Tab, Enter and Space work on the illustrated object buttons throughout. Names and tick badges identify the selected Shop parts; Cakes highlights the station under the selected cake. Safari may require Option-Tab or its “Press Tab to highlight each item” setting to include buttons. Escape opens leave confirmation. Browser hash/back navigation is also guarded during play. Timers continue while leave confirmation is open. Sound and best winning results persist under `plum-plaza:prefs:v1`; unavailable or corrupt storage falls back safely. Restart repeats the current seed.

## Verification

```sh
npm test       # pure rules, seeded simulations and belt fake timers
npm run lint
npm run typecheck
npm run e2e   # builds must exist first
npm run audit # lint -> typecheck -> tests -> build -> Safari browser flows
```

The owner requested Safari only. The Playwright test runner therefore drives Safari via native Apple Events, rather than launching another browser engine. Browser tests require macOS, Safari’s Developer setting **Allow JavaScript from Apple Events**, OS permission for the invoking terminal to control Safari, and Accessibility permission for native keyboard checks. They create and close only their own test window. There is no browser download or extra runtime dependency. WebDriver on the tested Safari 27.0 had a session-creation timeout, so the Apple Events path was explicitly authorised.

Responsive tests render the actual app in same-origin Safari frame viewports, calibrate their measured CSS width (Safari can round fractional frames), and check the entire document’s controls. Geometry is saved in `test-results/screenshots/geometry.json`. The runner captures its own Safari window with macOS screencapture (Screen Recording permission may be needed). The suite reaches an end state for all nine combinations, exercises result actions, guards navigation and tests CSP blocking. Top/bottom screenshots are saved beside the geometry report; visual review remains separate from geometry assertions. Reduced-motion declarations are exercised by activating their media rule in Safari’s CSSOM; the OS preference is not changed.

Rules live in each game’s `logic.ts`; stores only dispatch actions with a retained seeded RNG, and screens own timer scheduling. Tunables are in `src/config/constants.ts`. See [PROGRESS.md](PROGRESS.md) for interpretations and [AUDIT.md](AUDIT.md) for commands, evidence, assumptions and verification limits.

## GitHub Pages

The public repository publishes `dist/` to free GitHub Pages. In Settings → Pages, the source is GitHub Actions. The pinned workflow in `.github/workflows/pages.yml` runs on each push to `main` or manual dispatch: Node 22, `npm ci`, lint, typecheck, unit tests, build, then deployment. A failed check stops deployment. Safari E2E runs locally on macOS, rather than on the Ubuntu build runner.

Relative asset paths (`base: './'`) and hash routes support the repository subpath without rewrites. A seeded live game is https://harinaralasetty.github.io/plum-plaza/#/shop?level=advanced&seed=123 . No environment variables are needed. Best results stay in each browser's local storage and are separate from localhost scores.

After an authorised update, commit and push `main`, check the Actions run, then check the live town and game routes in Safari. [AGENTS.md](AGENTS.md) records project constraints, decisions and maintenance instructions.
