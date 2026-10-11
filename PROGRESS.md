# Plum Plaza progress

## Goal and constraints
Six gated commits; React 18, strict TypeScript, Vite, Zustand, local HashRouter; bundled original art/audio; no runtime network. Every game rule in pure logic with injected RNG.

## Milestones
- [x] 1 Scaffold
- [x] 2 Shop
- [x] 3 Pairs
- [x] 4 Cakes
- [x] 5 Polish
- [x] 6 Hardening

## Decisions
- Local HashRouter avoids adding a fourth runtime dependency. Hash query parameters are canonical; outer URL query parameters also accepted.
- Seed defaults to current timestamp when omitted; explicit seed is an integer.
- Existing supplied plan redacted for publication; original backed up outside repository.
- Use standard native buttons, select controls and modal dialogs for keyboard access.

## Open items
None. All six gates, ordered audit, fresh-clone proof and follow-up GitHub Pages publication are complete. Project memory and release evidence are committed and pushed; no owner action is required.

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

## Hardening decisions and fixes
- Best results compare winning turns (Pairs), guesses (Shop), or mistakes (Cakes); ties keep the earlier title. Beginner Shop ranks against a six-guess benchmark because it has no limit. Rank cutoffs are constants, not researched facts.
- All batter layers precede ordered fillings; the filling array represents spaces between layers. Each belt cake has its own order; trash drops it for free. `none` is explicit for icing/topping; glaze defaults false.
- Seed accepts safe integers, including negative values, normalised to32bits. Invalid level opens the picker. A new run with the same seed repeats the generated content; player actions and timing still affect outcomes.
- Production CSP blocks external resources and connections. Development keeps Vite’s local HMR available. No external runtime assets or calls exist.
- Native Safari keyboard checks use Option-Tab for buttons, Enter for controls, Space/arrow/Enter for native selects, and Escape for leave confirmation. Reduced motion is checked by activating the real CSS media rule through CSSOM; OS settings are preserved.
- Browser tests use Playwright’s test runner and Safari Apple Events because Safari27WebDriver sessions time out. Apple Events were explicitly authorised by the owner. Runner identifies its new window by ID difference, ensures visibility, waits for picker dialogs as well as headings, and dispatches Pairs actions from Node to avoid background timer throttling. Native select popup events are paced before document queries.
- Corrupt preference keys with extra segments now fall back to empty. Shared44px target value comes from constants.39unit tests pass, including blocked/corrupt storage and improving best scores.
- Initial full browser run:7passed/6failed; runner fixes verified in focused reruns (4game/picker cases and3visual/keyboard/locks cases pass). Added per-run CSP assertion initially omitted quote characters; corrected that test literal before restarting the final audit.

Current remaining: final audit, final source/brief checks, milestone6commit and fresh-clone dev/build/preview proof.

Final ordered audit attempt reached13/14browser checks; Advanced cake Box polling timed out. Runner now raises its own Safari window and waits for the actual mistake count after shipping, including the selected-cake check, rather than treating a click as successful. Repeated Advanced Cakes and then full audit are being rerun.

Final brief reconciliation centralised Pairs cake-motif frequency and shape/hue variation. Advanced art now uses the closest look-alikes (one non-cake silhouette, smaller hue steps) while printed numbers remain a non-colour clue.

Accessibility colour review darkened primary-button gradient endpoints (including hover), muted text and footer text; minimum contrast calculations are recorded in AUDIT.md. The complete audit is rerun after that final CSS change.

## Gate 6
Final ordered npm run audit exits0: lint, strict types,39unit tests, build,14Safari tests pass (4.6min). All nine combinations reach a result with external requests blocked.23screenshots reviewed across360/768/1280; full-document geometry has no small/overlapping controls or horizontal overflow. Final JS gzip59,237bytes; exact dependencies and source scans pass. Implementation/docs reconciliation complete. Fresh clone is the final proof, after this gate commit.

Fresh-clone first attempt: npm ci passed143packages/0vulnerabilities, but the dev HTML assertion rejected an unrelated application already on IPv4 port5173. Preserved that process; dev now binds localhost (IPv6 available) on the same mandated5173. Repeating the exact startup proof in a new clone.

Final proof passed in `/var/folders/fz/y2ws1sbx15dggsrd5ts44lvm0000gn/T/plum-final-clone.u5fttwif`: npm ci143packages/0vulnerabilities; Node22.23.3; exact npm run dev returned app HTML at localhost5173; build clean; npm run preview returned app HTML at localhost4173. Both own process groups stopped; unrelated server preserved. Production asset bytes match audited build. Initial proof readiness mistakenly accepted the other server before ours started; fixed to wait for Plum Plaza’s own HTML. All brief items reconciled, with assumptions/interpretations and browser verification limits in AUDIT.md.

## GitHub Pages release — 2026-10-11

Owner explicitly authorised push and publication on free GitHub Pages, and requested clear project memory in AGENTS.md. Use signed-in personal account `harinaralasetty` and available public repository name `plum-plaza`. Preserve six milestone commits. No paid service or custom domain.

Prepared pinned Actions workflow, AGENTS.md and README deployment/run instructions. Keep existing relative Vite base and hash routes. Portable CI checks run on Ubuntu; the full Safari audit runs locally.

Release verification: Node22.23.3 `npm run audit` exits0;39unit tests and14Safari tests pass in4.0min. All nine results, responsive360/768/1280, native keyboard, reduced motion and CSP checks pass. Publication scan of52files/87historical blobs found no matching credentials or excluded branding; runtime scan/exact dependencies pass; JS gzip remains59,237bytes. Created public `https://github.com/harinaralasetty/plum-plaza`; Pages REST confirms workflow source, public site and HTTPS enforced. Next: commit/push, watch workflow, verify live page and record final evidence.

Read-only lookup confirmed the target repository does not exist (expected). The catalogued planning skill path was stale; located and read the installed skill at its current cache path. No unresolved owner question.

Published release commit `c7b3ade` with all original milestone history. GitHub Actions run38131850652 succeeded: build18s/deploy12s. Site: https://harinaralasetty.github.io/plum-plaza/ . Repo: https://github.com/harinaralasetty/plum-plaza . Live HTTP200 HTML/JS/CSS are byte-identical to the local audited build.

Live native Safari smoke passed the town, every building/picker, all three Beginner play screens and return paths, Pairs flip, Cakes Pan input, a Shop win, the Advanced seeded direct link and unknown-route fallback. Town screenshot reviewed and saved at `test-results/screenshots/live-town.png`. Owned test windows were closed; user tabs/settings and unrelated servers preserved.

Verification limitation: Safari's installed AdGuard injects two scripts from its local domain and rewrites DOM CSP on this live origin. Initial all-resource/CSP assertions exposed that browser modification; the served build and policy still match byte-for-byte. Live resource checks explicitly distinguish those identified injected scripts from the app's two same-origin assets. Extension settings were not changed. The local full audit still verifies CSP/external blocking. A temporary live harness also needed Unicode-safe AppleScript quoting for tick feedback; fixed before its successful rerun. No application code change was needed.

AGENTS.md holds requested project memory: constraints, architecture, sources of truth, known mechanics decisions, commands, Safari requirements and future release process. README has the real clone command, live URL and clear deployment instructions. Main pushes now deploy automatically after portable CI checks.

Release notes commit471cf14 was pushed and its Pages run38132131295 also succeeded (build20s/deploy12s). Follow-up is complete: no unfinished feature, hosting item or blocker. For future authorised changes, follow AGENTS.md and verify the new workflow/live site.
