import { PAIRS, PAIRS_TIMING, RANK, type Level } from '../../config/constants';
import { pick, shuffle, type Rng } from '../../core/rng';

export type Special = 'joker' | 'clock' | 'chef' | 'shuffle' | 'peek';
export type Tile = { id: string; pair: string; kind: 'normal' | Special | 'star'; cake: boolean; matched: boolean };
export type PairsState = {
  level: Level; board: number; tiles: Tile[]; selected: number[];
  pending: 'mismatch' | 'peek' | null; turns: number; minimumTurns: number;
  seconds: number; peekTokens: number; status: 'playing' | 'cleared' | 'won' | 'lost';
};
export type GameState = PairsState;
function boardTiles(level: Level, rng: Rng): Tile[] {
  const config = PAIRS[level];
  const tiles: Tile[] = [];
  for (let n = 0; n < config.normalPairs; n++) {
    for (let copy = 0; copy < 2; copy++) tiles.push({ id: `normal-${n}-${copy}`, pair: `normal-${n}`, kind: 'normal', cake: n % 3 === 0, matched: false });
  }
  for (const kind of config.specials) {
    for (let copy = 0; copy < 2; copy++) tiles.push({ id: `${kind}-${copy}`, pair: kind, kind, cake: false, matched: false });
  }
  if (level === 'beginner') tiles.push({ id: 'star', pair: 'star', kind: 'star', cake: false, matched: false });
  return shuffle(tiles, rng);
}
export function createGame(level: Level, rng: Rng): PairsState {
  const config = PAIRS[level];
  return { level, board: 0, tiles: boardTiles(level, rng), selected: [], pending: null, turns: 0,
    minimumTurns: (config.normalPairs + config.specials.length - config.specials.filter(s => s === 'chef' || s === 'joker').length) * config.boards,
    seconds: config.seconds, peekTokens: 0, status: 'playing' };
}
function checkClear(state: PairsState): PairsState {
  if (state.tiles.some(t => !t.matched && t.kind !== 'star')) return state;
  return { ...state, tiles: state.tiles.map(t => ({ ...t, matched: true })), selected: [], pending: null,
    status: state.board + 1 === PAIRS[state.level].boards ? 'won' : 'cleared' };
}
export function flip(state: PairsState, index: number, rng: Rng): PairsState {
  const tile = state.tiles[index];
  if (state.status !== 'playing' || state.pending || !tile || tile.matched || tile.kind === 'star' || state.selected.includes(index)) return state;
  if (!state.selected.length) return { ...state, selected: [index] };
  const first = state.tiles[state.selected[0]];
  let next: PairsState = { ...state, turns: state.turns + 1, selected: [...state.selected, index] };
  if (first.pair !== tile.pair) return { ...next, pending: 'mismatch' };
  next = { ...next, selected: [], tiles: state.tiles.map(t => t.pair === tile.pair ? { ...t, matched: true } : t) };
  if (tile.kind === 'clock') next.seconds += PAIRS_TIMING.clockBonus;
  if (tile.kind === 'peek') next.peekTokens++;
  if (tile.kind === 'joker' || tile.kind === 'chef') {
    const candidates = next.tiles.filter(t => !t.matched && t.kind !== 'star' && (tile.kind === 'joker' || (t.kind === 'normal' && t.cake)));
    if (candidates.length) {
      const chosen = pick(candidates, rng).pair;
      next.tiles = next.tiles.map(t => t.pair === chosen ? { ...t, matched: true } : t);
    }
  }
  if (tile.kind === 'shuffle') {
    const remaining = shuffle(next.tiles.filter(t => !t.matched), rng);
    let cursor = 0;
    next.tiles = next.tiles.map(t => t.matched ? t : remaining[cursor++]);
  }
  return checkClear(next);
}
export function resolveMismatch(state: PairsState): PairsState {
  return state.status === 'playing' && state.pending === 'mismatch' ? { ...state, selected: [], pending: null } : state;
}
export function peek(state: PairsState): PairsState {
  if (state.status !== 'playing' || state.pending || state.selected.length || state.peekTokens < 1) return state;
  const selected = state.tiles.flatMap((tile, index) => tile.matched ? [] : [index]);
  return { ...state, selected, turns: state.turns + selected.length, peekTokens: state.peekTokens - 1, pending: 'peek' };
}
export function finishPeek(state: PairsState): PairsState {
  return state.status === 'playing' && state.pending === 'peek' ? { ...state, selected: [], pending: null } : state;
}
export function tick(state: PairsState, seconds: number): PairsState {
  if (state.status !== 'playing' || state.level === 'beginner' || !Number.isFinite(seconds) || seconds <= 0) return state;
  const remaining = Math.max(0, state.seconds - seconds);
  return { ...state, seconds: remaining, status: remaining === 0 ? 'lost' : 'playing', ...(remaining === 0 ? { selected: [], pending: null } : {}) };
}
export function nextBoard(state: PairsState, rng: Rng): PairsState {
  if (state.status !== 'cleared') return state;
  return { ...state, board: state.board + 1, tiles: boardTiles(state.level, rng), selected: [], pending: null,
    peekTokens: 0, seconds: PAIRS[state.level].seconds, status: 'playing' };
}
export function resultTitle(state: PairsState): 'Sprout' | 'Bloom' | 'Plum Master' {
  const ratio = state.turns / state.minimumTurns;
  return ratio <= RANK.bestRatio ? 'Plum Master' : ratio <= RANK.middleRatio ? 'Bloom' : 'Sprout';
}
