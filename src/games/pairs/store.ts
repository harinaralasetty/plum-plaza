import { createStore } from 'zustand/vanilla';
import type { Level } from '../../config/constants';
import { mulberry32 } from '../../core/rng';
import { createGame, flip, resolveMismatch, peek, finishPeek, tick, nextBoard, type PairsState } from './logic';
export function createPairsStore(level: Level, seed: number) {
  const rng = mulberry32(seed);
  return createStore<{
    game: PairsState; flip: (index: number) => void; resolveMismatch: () => void;
    peek: () => void; finishPeek: () => void; tick: (seconds: number) => void; nextBoard: () => void;
  }>(set => ({
    game: createGame(level, rng),
    flip: index => set(s => ({ game: flip(s.game, index, rng) })),
    resolveMismatch: () => set(s => ({ game: resolveMismatch(s.game) })),
    peek: () => set(s => ({ game: peek(s.game) })),
    finishPeek: () => set(s => ({ game: finishPeek(s.game) })),
    tick: seconds => set(s => ({ game: tick(s.game, seconds) })),
    nextBoard: () => set(s => ({ game: nextBoard(s.game, rng) })),
  }));
}
