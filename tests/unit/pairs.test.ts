import { describe, expect, it } from 'vitest';
import { LEVELS, PAIRS, PAIRS_TIMING } from '../../src/config/constants';
import { mulberry32, type Rng } from '../../src/core/rng';
import { createGame, flip, resolveMismatch, peek, finishPeek, nextBoard, tick, resultTitle, type PairsState } from '../../src/games/pairs/logic';
function match(state: PairsState, pair: string, rng: Rng): PairsState {
  const indexes = state.tiles.flatMap((tile, index) => !tile.matched && tile.pair === pair ? [index] : []);
  return indexes.length === 2 ? flip(flip(state, indexes[0], rng), indexes[1], rng) : state;
}
function special(seed = 4): { state: PairsState; rng: Rng } {
  const rng = mulberry32(seed);
  return { state: createGame('advanced', rng), rng };
}
describe('pairs', () => {
  for (const level of LEVELS) it(`${level}: counts and solvable progression over 200 seeds`, () => {
    for (let seed = 0; seed < 200; seed++) {
      const rng = mulberry32(seed); let state = createGame(level, rng);
      for (let board = 0; board < PAIRS[level].boards; board++) {
        expect(state.tiles).toHaveLength(PAIRS[level].size ** 2);
        expect(new Set(state.tiles.map(t => t.id)).size).toBe(state.tiles.length);
        expect(state.tiles.filter(t => t.kind === 'normal')).toHaveLength(PAIRS[level].normalPairs * 2);
        for (const kind of PAIRS[level].specials) expect(state.tiles.filter(t => t.kind === kind)).toHaveLength(2);
        while (state.status === 'playing') {
          const pair = state.tiles.find(t => !t.matched && t.kind !== 'star')!.pair;
          state = match(state, pair, rng);
        }
        expect(state.tiles.every(t => t.matched)).toBe(true);
        if (board + 1 < PAIRS[level].boards) {
          expect(state.status).toBe('cleared');
          expect(tick(state, 999)).toBe(state);
          const turns = state.turns;
          state = nextBoard(state, rng);
          expect(state.turns).toBe(turns);
          expect(state.seconds).toBe(PAIRS[level].seconds);
        }
      }
      expect(state.status).toBe('won');
      expect(state.minimumTurns).toBe(({beginner:12,intermediate:34,advanced:120})[level]);
      expect(tick(state, 999)).toBe(state);
      expect(nextBoard(state, rng)).toBe(state);
    }
  });
  it('mismatch counts one turn, locks and resolves purely', () => {
    const rng = mulberry32(1); const original = createGame('beginner', rng);
    const a = original.tiles.findIndex(t => t.kind === 'normal');
    const b = original.tiles.findIndex(t => t.kind === 'normal' && t.pair !== original.tiles[a].pair);
    let state = flip(original, a, rng);
    expect(state.turns).toBe(0); expect(flip(state, a, rng)).toBe(state);
    state = flip(state, b, rng);
    expect(state.turns).toBe(1); expect(state.pending).toBe('mismatch');
    expect(flip(state, 0, rng)).toBe(state); expect(peek(state)).toBe(state);
    const resolved = resolveMismatch(state);
    expect(resolved.selected).toEqual([]); expect(resolved.pending).toBeNull();
    expect(original.selected).toEqual([]); expect(original.tiles.some(t => t.matched)).toBe(false);
    expect(PAIRS_TIMING.mismatchMs).toBe(800);
  });
  it('star never flips and clears only last', () => {
    const rng = mulberry32(2); const state = createGame('beginner', rng);
    expect(flip(state, state.tiles.findIndex(t => t.kind === 'star'), rng)).toBe(state);
  });
  it('clock adds twenty seconds', () => {
    const { state, rng } = special();
    expect(match(state, 'clock', rng).seconds).toBe(state.seconds + 20);
  });
  it('joker removes one random remaining pair', () => {
    const { state, rng } = special();
    const next = match(state, 'joker', rng);
    expect(next.tiles.filter(t => t.matched)).toHaveLength(4);
    expect(next.turns).toBe(1);
  });
  it('chef removes a cake-themed normal pair', () => {
    const { state, rng } = special(); const next = match(state, 'chef', rng);
    const bonus = next.tiles.filter(t => t.matched && t.kind !== 'chef');
    expect(bonus).toHaveLength(2); expect(bonus.every(t => t.kind === 'normal' && t.cake)).toBe(true);
  });
  it('shuffle keeps all matched positions and permutes unmatched tiles', () => {
    const { state, rng } = special();
    const before = match(state, 'normal-1', rng); const next = match(before, 'shuffle', rng);
    before.tiles.forEach((t, i) => { if (t.matched || t.kind === 'shuffle') expect(next.tiles[i].id).toBe(t.id); });
    expect(next.tiles.map(t => t.id).sort()).toEqual(before.tiles.map(t => t.id).sort());
    expect(next.tiles.map(t => t.id)).not.toEqual(before.tiles.map(t => t.id));
  });
  it('peek spends one token, reveals every unmatched tile and locks', () => {
    const { state, rng } = special(); const earned = match(state, 'peek', rng);
    expect(earned.peekTokens).toBe(1);
    const shown = peek(earned); const count = earned.tiles.filter(t => !t.matched).length;
    expect(shown.selected).toHaveLength(count); expect(shown.turns).toBe(earned.turns + count);
    expect(shown.peekTokens).toBe(0); expect(shown.pending).toBe('peek');
    expect(flip(shown, shown.selected[0], rng)).toBe(shown); expect(peek(shown)).toBe(shown);
    expect(resolveMismatch(shown)).toBe(shown);
    expect(finishPeek(shown).selected).toEqual([]); expect(PAIRS_TIMING.peekMs).toBe(2000);
    expect(peek(state)).toBe(state);
  });
  it('timer clamps to zero and locks a loss; beginner is untimed', () => {
    const rng = mulberry32(5); const lost = tick(createGame('advanced', rng), 999);
    expect(lost.seconds).toBe(0); expect(lost.status).toBe('lost');
    expect(flip(lost, 0, rng)).toBe(lost); expect(nextBoard(lost, rng)).toBe(lost);
    const beginner = createGame('beginner', rng); expect(tick(beginner, 999)).toBe(beginner);
  });
  it('replays deterministically and ranks by aggregate turns', () => {
    function replay() { const rng = mulberry32(71); let state = createGame('advanced', rng); for (const pair of ['shuffle', 'joker', 'chef', 'peek']) state = match(state, pair, rng); return state; }
    expect(replay()).toEqual(replay());
    const state = replay();
    expect(resultTitle({ ...state, turns: state.minimumTurns })).toBe('Plum Master');
    expect(resultTitle({ ...state, turns: state.minimumTurns * 2 })).toBe('Bloom');
    expect(resultTitle({ ...state, turns: state.minimumTurns * 3 })).toBe('Sprout');
  });
});

 it('minimum includes free pair clears by Chef and Joker',()=>{expect(createGame('beginner',mulberry32(1)).minimumTurns).toBe(12);expect(createGame('intermediate',mulberry32(1)).minimumTurns).toBe(34);expect(createGame('advanced',mulberry32(1)).minimumTurns).toBe(120);});
