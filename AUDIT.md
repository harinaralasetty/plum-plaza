# Plum Plaza audit

| Check | Command | Exit code | Key output |
|---|---|---|---|

| Scaffold build/test/lint | `npm run build; npm test; npm run lint` (Node 22) | 0 each | Build clean; core test passed; lint clean |
| Dev HTML | `npm run dev` then `curl -fsS http://127.0.0.1:5173/` | 0 | Plum Plaza root and module script returned; server stopped |
| Dependency vulnerability scan | `npm install` after patched tool upgrades | 0 | 0 vulnerabilities |

| Scaffold fresh clone | `git clone . /tmp/plum-scaffold.TRm2Wh; npm ci; npm run build; npm test` | 0 each | 141 packages; 0 vulnerabilities; build clean; 1 core test passed |

## Assumptions
- Pairs timers: 180 s Intermediate, 240 s Advanced per board.
- Clock adds 20 s.
- Cakes auto belt: 1200 ms Intermediate, 800 ms Advanced.
- Cakes mistake limit: 3 at every level (including Advanced).
- Shop limits: 8 Intermediate, 10 Advanced.
- Gzipped JavaScript budget: 250 kB.

## Deviations
- HashRouter is implemented locally because exactly three runtime dependencies excludes a router package.

## Known issues
Verification pending.
