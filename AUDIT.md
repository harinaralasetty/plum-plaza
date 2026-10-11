# Plum Plaza audit

| Check | Command | Exit code | Key output |
|---|---|---|---|

| Scaffold build/test/lint | `npm run build; npm test; npm run lint` (Node 22) | 0 each | Build clean; core test passed; lint clean |
| Dev HTML | `npm run dev` then `curl -fsS http://127.0.0.1:5173/` | 0 | Plum Plaza root and module script returned; server stopped |
| Dependency vulnerability scan | `npm install` after patched tool upgrades | 0 | 0 vulnerabilities |

| Scaffold fresh clone | `git clone . /tmp/plum-scaffold.TRm2Wh; npm ci; npm run build; npm test` | 0 each | 141 packages; 0 vulnerabilities; build clean; 1 core test passed |

| Shop rules | `npm test -- tests/unit/shop.test.ts` | 0 | 14 tests; 7 vectors; 3000 seeded runs; Beginner solver ≤3; limits lock |
| Shop UI integration | `npm run build && npm run lint` | 0 | TypeScript/build/lint clean |

| Pairs rules | `npm test -- tests/unit/pairs.test.ts` | 0 | 13 tests; 200 seeds per level; all boards solved; specials and timer verified |
| Pairs UI integration | `npm run build && npm run lint` | 0 | Clean |

| Cakes rules | `npm test -- tests/unit/cakes.test.ts` | 0 | 7 tests; 3000seed order validity; each field graded; step and belt checks |
| Cakes UI integration | `npm run build && npm run lint` | 0 | Clean |

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
