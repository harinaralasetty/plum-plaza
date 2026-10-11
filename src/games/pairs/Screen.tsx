import { useEffect, useMemo } from 'react';
import { useStore } from 'zustand';
import { PAIRS, PAIRS_TIMING, UI } from '../../config/constants';
import { sfx } from '../../audio/sfx';
import { Button } from '../../ui/Button';
import { Hud } from '../../ui/Hud';
import { ResultDialog, type ScreenProps } from '../../ui/ResultDialog';
import { resultTitle } from './logic';
import { createPairsStore } from './store';
import { PairTile } from './tiles';
export function PairsScreen(props: ScreenProps) {
  const store = useMemo(() => createPairsStore(props.level, props.seed), [props.level, props.seed]);
  const { game, flip, peek, nextBoard } = useStore(store);
  const config = PAIRS[props.level];
  useEffect(() => {
    return store.subscribe((state, previous) => {
      if (state.game.board !== previous.game.board) return;
      if (state.game.pending === 'mismatch' && previous.game.pending !== 'mismatch') sfx('wrong');
      else if (state.game.tiles.filter(t => t.matched).length > previous.game.tiles.filter(t => t.matched).length) sfx('match');
    });
  }, [store]);
  useEffect(() => {
    if (!game.pending) return;
    const id = window.setTimeout(() => {
      if (game.pending === 'mismatch') store.getState().resolveMismatch();
      else store.getState().finishPeek();
    }, game.pending === 'mismatch' ? PAIRS_TIMING.mismatchMs : PAIRS_TIMING.peekMs);
    return () => window.clearTimeout(id);
  }, [game.pending, store]);
  useEffect(() => {
    if (props.level === 'beginner' || game.status !== 'playing') return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      store.getState().tick((now - last) / UI.msPerSecond);
      last = now;
    }, UI.timerTickMs);
    return () => window.clearInterval(id);
  }, [store, props.level, game.status, game.board]);
  return <section className={`pairs-game pairs-${props.level}`}>
    <p className="game-intro">Turn over two tiles per turn. Match their picture and number to clear them. {props.level === 'beginner' ? 'The free star clears last.' : 'Special pairs lend a little magic.'}</p>
    <Hud items={{ Board: `${game.board + 1}/${config.boards}`, Turns: game.turns, Time: config.seconds ? `${Math.ceil(game.seconds)}s` : 'No timer', 'Peek tokens': game.peekTokens }}/>
    {config.specials.length > 0 && <p className="pairs-instructions">Clock: +{PAIRS_TIMING.clockBonus} seconds. Chef: clears a cake pair. Peek: earns a token; use it to reveal all remaining tiles for {PAIRS_TIMING.peekMs / UI.msPerSecond} seconds, costing one turn per tile.{props.level === 'advanced' && ' Joker: clears a random pair. Shuffle: rearranges remaining tiles.'}</p>}
    <div className="pairs-board" aria-label="Matching board" style={{ display: 'grid', gridTemplateColumns: `repeat(${config.size}, minmax(44px, 1fr))`, gap: 0, padding: 0, width: '100%' }}>
      {game.tiles.map((tile, index) => <PairTile key={tile.id} tile={tile} index={index} level={props.level} revealed={game.selected.includes(index)} locked={game.pending !== null || game.status !== 'playing'} onFlip={() => flip(index)}/>)}
    </div>
    <div className="pairs-actions"><Button disabled={game.peekTokens < 1 || game.pending !== null || game.selected.length > 0 || game.status !== 'playing'} onClick={peek}>Use peek ({game.peekTokens})</Button></div>
    <p className="pairs-status" role="status">{game.pending === 'peek' ? 'Take a look! The tiles will turn back soon.' : game.pending === 'mismatch' ? 'Try another pair when these turn back.' : game.status === 'cleared' ? 'Board cleared. Ready for the next garden?' : 'Find a matching pair.'}</p>
    {game.status === 'cleared' && <Button className="primary" onClick={nextBoard}>Next board</Button>}
    {(game.status === 'won' || game.status === 'lost') && <ResultDialog {...props} game="pairs" won={game.status === 'won'} title={resultTitle(game)} stats={{ Turns: game.turns, Time: config.seconds ? `${Math.ceil(game.seconds)}s left` : 'No timer', Boards: `${game.board + 1}/${config.boards}` }} score={game.turns}/>}
  </section>;
}
