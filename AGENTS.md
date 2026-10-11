# Plum Plaza: project memory and working instructions

## Project and ownership

This repository contains a completed browser game collection: Plum Pairs, Cozy Cakes and Plum Shop, reached through one illustrated town. Use original Plums, handwritten inline SVG/CSS and synthesised Web Audio. Reproduce mechanics only; do not add third-party game branding or assets.

The owner authorised pushing this project to the public personal repository `harinaralasetty/plum-plaza` and publishing it on free GitHub Pages on 2026-10-11. Repository: https://github.com/harinaralasetty/plum-plaza . Live site: https://harinaralasetty.github.io/plum-plaza/ . Check deployment status rather than inferring success from a push. Do not force-push, delete outside this repository, add paid services or change visibility without explicit approval.

## Sources of truth and current state

- `PROGRESS.md`: authoritative milestone status, decisions, open items and release history. All six implementation milestones are complete. The object-controls follow-up is complete and tracked in PROGRESS.md.
- `AUDIT.md`: commands, observed results, assumptions, deviations and verification limits. Do not claim an unrun check passed.
- `README.md`: run, play, test and deployment instructions.
- `plan.md`: historical, redacted mechanics reference; the owner's current brief and recorded decisions take precedence over its research prose.
- `task_plan.md` and `findings.md`: compact planning index and technical findings. Update affected documents consistently, without creating competing copies of state.

## Architecture and constraints

Use Vite, React 18, strict TypeScript and Zustand. Runtime dependencies must remain exactly `react`, `react-dom`, `zustand`. Node 22 is pinned by `.nvmrc` and engines. Commit `package-lock.json`; use `npm ci`.

Every gameplay rule belongs in the appropriate pure `src/games/{pairs,cakes,shop}/logic.ts`: no React, timers or unseeded randomness. Inject RNG from `src/core/rng.ts`; test rules before changing the screen. Stores dispatch actions and retain the seeded generator; screens schedule timers and render state. Every gameplay tunable belongs in `src/config/constants.ts`.

`src/routes.tsx` implements the local HashRouter to preserve the exact dependency constraint. Routes are `#/`, `#/pairs`, `#/cakes`, `#/shop`; hash query parameters `level` and integer `seed` select reproducible runs. Unknown paths go to town. Keep `base: './'` in `vite.config.ts`: relative assets work under the Pages repository path. No server rewrites are needed.

Ship only bundled assets: no backend, keys, runtime requests, CDN fonts or external images. Preserve the production CSP. Sound starts muted. Preferences and best winning results use only `plum-plaza:prefs:v1`; corrupt or unavailable storage must fall back safely. Browser storage is per origin, so localhost scores do not automatically transfer to the live site.

Keep object-based controls: Shop uses illustrated part buttons (data-slot/data-color, aria-pressed), and Cakes uses illustrated ingredient buttons (data-station/data-ingredient). Do not bring back dropdowns for game choices. Keep native keyboard support, focus indicators, leave confirmation (including Escape/history navigation), at least 44px hit targets, layouts from 360px and reduced-motion support. Colour must have a second identifying signal.

## Important mechanics decisions

- Pairs: mismatch locks for 800ms; Peek reveals for 2s and costs one turn per shown tile. Timed boards have 180s/240s, Clock adds 20s. Next board is explicit; tokens reset per board. Automatically cleared specials do not cascade. Rank minima are 12/34/120.
- Cakes: all batter layers precede ordered fillings, then icing, topping and optional glaze. Glaze requires icing and belongs at Topping. Every cake has its own order; Trash is free. Belt loops over six slots; no oven. All levels lose at three mistakes. Automatic intervals are 1200ms/800ms.
- Shop: repeats are allowed; count feedback removes exact matches before counting misplaced colours. Beginner has unlimited guesses and a six-guess ranking benchmark; other limits are eight/ten. Reveal the secret at either ending.
- Leave dialogs do not pause timers. Best results store wins; ties retain the earlier result. Same seed repeats generated content; actions and timing still affect outcomes.

See constants and AUDIT.md for all assumed values and rank thresholds; these decisions are not claims about another product.

## Commands and verification

```sh
nvm use
npm ci
npm run dev       # localhost:5173
npm run build     # strict types, then bundled dist/
npm run preview   # localhost:4173
npm run audit     # lint -> types -> unit tests -> build -> Safari flows
```

**Use only Safari for browser work.** E2E uses Playwright's runner with the native Safari Apple Events adapter in `tests/e2e/safari.ts`; it does not launch a Playwright browser. Tests require macOS, Safari's Allow JavaScript from Apple Events, Automation/Accessibility permissions, and Screen Recording for screenshots. Safari 27 WebDriver previously timed out; the owner explicitly authorised Apple Events. Preserve user tabs and unrelated servers; close only windows/processes created for this task.

The object-controls audit passed 39 unit tests and 15 Safari tests, including all nine game/level end states and 360/768/1280px layouts. A final CSS label-wrap refinement passed lint/build and the focused visual + native keyboard tests (2 cases). JS gzip is 61,684 bytes, below the assumed 250,000-byte budget. Rerun relevant checks after changes and write new evidence. A fresh remote clone of the object UI passed install/dev/build/preview and produced identical assets. Native key input must preserve the already focused iframe; avoid redundant activation immediately before keys. Reduced-motion checks activate all matching CSS media rules.

Release verification on 2026-10-11 repeated that full audit successfully. GitHub Pages [run38131850652](https://github.com/harinaralasetty/plum-plaza/actions/runs/38131850652) deployed commit c7b3ade; live HTML/JS/CSS matched the verified build. Safari live checks covered all three game pickers/play/return paths, a Shop win, seeded links and fallback routing. The owner's AdGuard injects scripts and rewrites DOM CSP on the live origin; preserve settings and distinguish extension behavior from served application bytes. See AUDIT.md for that verification limit.

Object UI release f6a0831 deployed successfully in [run38134938500](https://github.com/harinaralasetty/plum-plaza/actions/runs/38134938500). Live HTML/JS/CSS match the final verified build, and Safari tested actual Shop/Cakes objects, all three game routes and a Shop win. No implementation/release blocker remains.

## Publishing and future updates

`.github/workflows/pages.yml` installs locked dependencies on Node 22, runs lint, types, unit tests and build, uploads `dist/`, then deploys to the `github-pages` environment. It runs on pushes to `main` and manual dispatch. Actions are pinned by commit. Pages must use the GitHub Actions build source. Publishing is free with this public repository; no custom domain or paid service is required.

Ubuntu CI cannot run the macOS-only Safari suite. Run the complete audit locally for gameplay/UI changes; CI verifies the portable checks before deployment. Confirm both the workflow conclusion and the live page/assets after publishing. Deployment status and live smoke-test evidence belong in PROGRESS.md and AUDIT.md.

To update an authorised release: make focused changes, update affected tests/docs, run relevant checks, commit, push `main`, watch the Pages workflow, then smoke-test the live town and game routes in Safari. Every main push publishes automatically; do not push unrelated or unfinished work. No secrets belong in source, documentation or artifacts.
