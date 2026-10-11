# Plum Plaza audit

Commands run with Node22.23.3 on macOS, Safari27.0. Browser verification uses Playwright's runner with the owner's authorised Safari Apple Events adapter. No other browser was launched.

| Check | Command | Exit code | Key output |
|---|---|---|---|
| Scaffold | `npm run build; npm test; npm run lint` | 0 each | Strict types/build/lint clean; core test passed |
| Scaffold dev | `npm run dev`, then `curl -fsS http://127.0.0.1:5173/` | 0 | App HTML returned; own server stopped |
| Scaffold fresh clone | `git clone . /tmp/plum-scaffold.TRm2Wh; npm ci; npm run build; npm test` | 0 each |141packages;0vulnerabilities; build and core test pass |
| Shop rules before UI | `npm test -- tests/unit/shop.test.ts` | 0 |14tests; all7 supplied duplicate-feedback vectors;3000seeded runs; Beginner solver; limits lock |
| Shop integration | `npm run build && npm run lint` | 0 | Clean |
| Pairs rules before UI | `npm test -- tests/unit/pairs.test.ts` | 0 |13tests;200seeds per level/all boards; five specials, locks, timer, replay, ranks |
| Pairs integration | `npm run build && npm run lint` | 0 | Clean after correcting a test helper and minimum benchmark expectation |
| Cakes rules before UI | `npm test -- tests/unit/cakes.test.ts` | 0 |7tests;3000orders; every recipe field; assembly/alignment; limits; all targets; three-cake fake-timer loop |
| Cakes integration | `npm run build && npm run lint` | 0 | Clean |
| Polish | `npm run build && npm run lint && npm test` | 0 |35tests pass; original town/art/audio and responsive UI |
| Initial browser audit | `npm run e2e` | 1 |7passed/6failed; picker readiness, background timers, window visibility and native-popup timing corrected in runner |
| Focused gameplay rerun | `npm run e2e -- --grep 'pairs beginner\|pairs intermediate\|cakes advanced\|picker'` | 0 |4passed,2.2min |
| Focused accessibility/visual rerun | `npm run e2e -- --grep 'native keyboard\|visual gate\|UI locks'` | 0 |3passed,57.2s; all12 layouts, native keyboard, result actions, mismatch/Peek locks |
| Preference hardening | `npm run lint && npm test` | 0 |39tests in5files; storage corruption/unavailability and best-score updates |
| Runtime dependencies | Python JSON assertion on `package.json` | 0 | Exactly react18.3.1, react-dom18.3.1, zustand5.0.8 |
| Runtime network scan | `rg -n 'fetch\|XMLHttpRequest\|https?://' src` | 1 (no matches) |0matches; wrapper asserted exit1 |
| Excluded names | `rg -ni -f /tmp/plum-excluded-patterns src public index.html` | 1 (no matches) |0matches; names from owner brief kept outside repo |
| Extended name scan | Same pattern file, repository scan excluding generated/dependency directories | 1 (no matches) |0matches |
| JavaScript budget | Python `gzip.compress(bytes, mtime=0)` over `dist/assets/*.js` | 0 |59,237bytes total (compression level9), below250,000bytes |
| Ordered audit retry | `npm run audit` | 1 |39unit tests;13/14browser checks; Advanced Box polling timeout, corrected runner focus and post-shipment count wait |
| Repeated Advanced Cakes | `npm run e2e -- --grep "cakes advanced" --repeat-each=2` | 0 |2passed,46.5s; actual post-shipment counts and owned-window focus |
| Contrast endpoints | Python relative-luminance contrast calculation | 0 |Primary normal5.01:1/hover4.78:1; muted4.90:1; footer4.92:1 on darkest surface |
| Layout/purity scan | Python required-file, strictTS, Node22 and logic-import/timer assertions | 0 |Required files; pure modules have no React/timers/unseeded RNG |
| Final ordered audit | `npm run audit` | 0 |Lint/typecheck/build clean;39unit tests;14Safari tests pass in4.6min, including all nine results and external blocking |
| Final fresh-clone proof | `git clone`, `npm ci`, `npm run dev`/HTTP, `npm run build`, `npm run preview`/HTTP | 0 each |Node22.23.3;143packages/0vulnerabilities; localhost5173/4173 HTTP200 with app root/module; both own server groups stopped |

| Final screenshot review | Safari native capture + whole-document geometry; local image inspection | 0 |23PNGs; town and all Advanced screens at360/768/1280; no horizontal overflow or overlap |

| First final-clone attempt | `git clone`, `npm ci`, dev/HTML assertion | 1 (proof assertion) |143packages/0vulnerabilities; rejected unrelated IPv4 app on5173; preserved foreign job and switched dev bind to localhost |

| Final tracked-file scan | Python regex over `git ls-files` | 0 |0excluded-name matches, including lockfile and documentation |
| Clone asset identity | Python byte equality on audited/clone `dist/assets/*` | 0 |All production assets identical |
| Commit gates/clean tree | `git log -6 --oneline; git rev-list --count HEAD; git status --short` | 0 each |Exactly6milestone commits; status empty |

## Assumptions
- Pairs timers are180s Intermediate and240s Advanced, per board.
- Clock adds20s.
- Cakes automatic belt is1200ms Intermediate and800ms Advanced.
- Advanced Cakes loses at3mistakes; the conflicting2-mistake source is not used. All levels use the configured3.
- Shop limits are8Intermediate and10Advanced.
- JavaScript gzip budget is250kB, interpreted conservatively as250,000bytes.
- Unspecified rank cutoffs: Pairs ratios<=1.5/<=2.5 against theoretical minimum12/34/120; Shop ratios<=.4/<=.7 against level limit, or a6guess benchmark for unlimited Beginner. Higher tier for fewer turns/guesses. These are design decisions, not researched values.
- Cake glaze probability is.5when iced at Advanced. Gameplay counts, times, ranks, audio settings and the hit-target size are in constants.ts; SVG coordinates and CSS presentation measurements are art/layout data.

## Deviations and interpretations
- Local HashRouter replaces an external routing package to meet the exact three-runtime-dependency requirement.
- Safari27WebDriver failed session creation despite remote automation being enabled (matching issue18109). The owner expressly authorised Apple Events. Playwright runs the tests without a browser fixture; its adapter controls only Safari. E2E therefore requires macOS, Safari Apple Events and native keyboard/screenshot permissions. The game itself has no such platform restriction.
- Per-game orders are attached to each cake; one blank cake starts the round, Add cake creates another when the Pan position is empty. Trash drops that cake and its order without cost. All batter is added before fillings; ordered filling entries represent the spaces between layers. This follows the stated station order. No oven step exists.
- Next board is explicit; turns aggregate, seconds/tokens reset per board. Joker may clear another special without triggering it; Chef clears a cake-themed normal pair. Leave dialogs keep timers running.
- Results store only wins; ties keep the earlier result. Comparison uses turns, guesses or mistakes. Invalid query levels open the picker; safe-integer seeds normalise to32bits, including negative values.
- Production CSP blocks connections and external resources. Dev's local HMR is kept available. All nine preview flows assert the policy and same-origin resource entries; an intentionally external image also raises a CSP violation.
- Reduced-motion CSS is exercised by enabling its actual media rule in CSSOM and checking computed animation/transition values. The owner's OS preference is not changed. Safari button tabbing may require Option-Tab or its full keyboard-navigation preference.
- Supplied research plan was redacted before the first commit, with original bytes backed up outside this publishable repository. Current brief and PROGRESS.md decisions take precedence over older research prose.

## Brief reconciliation

Each checked item was reread against implementation and tests. Browser results are accepted only when the final ordered audit passes.

- [x] Stack/files: React18, strict TS, Vite, Zustand, local HashRouter; main/App/routes/constants/rng; each game pure logic/store/Screen/art; shared Town/Difficulty/Result/Button/Hud; audio/prefs; unit/e2e directories; Node22engines/.nvmrc; committed lockfile; required scripts in the specified order.
- [x] Original identity/art/audio: Plum Plaza/Plums, hand-written inline SVG/CSS with gradients and highlights; synthesised sound muted on fresh storage; no external runtime assets, fonts, backend or keys.
- [x] Routing: town's three buildings; picker for each game; level/seed shortcuts; invalid path goes town; play/restart/mute; leave and Escape confirmation; result Play again/Change level/Town. Browser hash/back changes are guarded during play.
- [x] Persistence/accessibility: one namespaced key; corrupt/unavailable fallback; best winning results; native buttons/selects/dialogs, labels, feedback/status text and visible focus;44px controls; responsive360pxup; reduced motion; colour is supplemented by names, numbers, shapes, ticks/crosses or counts.
- [x] Pairs board values: Beginner1x5x5,12pairs/star, no timer; Intermediate2x6x6,15normal plus Clock/Chef/Peek; Advanced4x8x8,27normal plus all five specials. Harder levels reduce shape/hue differences and increase look-alike tiles. Star clears last.
- [x] Pairs actions/results: two flips per turn; match removes; mismatch800ms with input locked; seeded Joker/Chef choices,20sClock, unmatched-only Shuffle; Peek token/2s/per-tile turn cost; timer clamps/loss locks; last board wins; result turns/time/title by minimum.
- [x] Cakes recipe/options: round/square/heart; three batters, each press one layer; ordered red/green/white fillings; none/three icing flavours; none/sprinkles/star candy/heart candy; optional glaze only on iced Advanced cake; all fields and ingredient order graded exactly.
- [x] Cakes operations: Pan/Batter/Filling/Icing/Topping then Box; only aligned station works; illegal input ignored with visible cue/no mistake; wrong ship adds one mistake/discards; trash free; seeded orders; no oven. Beginner1layer/manual/single cake/5target/3mistakes; Intermediate2layers/1200ms/cap3/5target/3mistakes; Advanced3layers/glaze/800ms/cap3/6target/3mistakes.
- [x] Shop: repeats allowed; Beginner eyes/nose/mouth, three colours,27codes, per-slot feedback/unlimited; Intermediate adds topper/blue,256codes, per-slot/8guesses; Advanced adds clothes/green,3125codes, count-only/10guesses. Exact-first duplicate counts; all7supplied vectors; curtain lifts at either ending; three guess-based titles.
- [x] Rule separation/replay: logic imports only constants/RNG; no React or timers; stores dispatch with retained RNG; screens schedule ticks; seeded simulations solve every board and cake target. Logic was tested before each screen was integrated.
- [x] Final evidence: ordered audit, nine end states with external requests blocked, reviewed screenshots at all requested widths, clean clone run-on-pull, six gate commits and clean working tree. See final gate rows above.

## Known issues and verification limits
- No known implementation defect or unfinished delivery requirement. Fresh clone and ordered audit passed. No deployment/publication was performed.
- Safari fractional frame hit geometry is compared at whole CSS-pixel precision; the shared CSS minimum is44px.
- Safari-only native automation is platform-specific. Other browsers and a full screen-reader session were not run. Labels, focus, native keyboard navigation, modal semantics, text alternatives and target/layout geometry are checked; this is not a formal WCAG certification.

Final clone: `/var/folders/fz/y2ws1sbx15dggsrd5ts44lvm0000gn/T/plum-final-clone.u5fttwif`. Its generated production assets match the audited build byte-for-byte. The dev command uses localhost rather than an IPv4-only bind; an unrelated IPv4 server on5173 was preserved. Readiness checks wait for this app’s title/root rather than accepting any HTTP200.
