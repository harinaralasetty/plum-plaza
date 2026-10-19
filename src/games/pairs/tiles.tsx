import { PAIR_ART, UI } from '../../config/constants';
import type { Level } from '../../config/constants';
import { Button } from '../../ui/Button';
import { tileName, type Tile } from './logic';
const symbols = { joker: '✦', clock: '◷', chef: '♧', shuffle: '⇄', peek: '◎', star: '★' };
export function TileFace({ tile, level }: { tile: Tile; level: Level }) {
  if (tile.kind !== 'normal') return <span className={`pair-special pair-${tile.kind}`}><span aria-hidden="true">{symbols[tile.kind]}</span><small>{tile.kind}</small></span>;
  const ordinal = Number(tile.pair.split('-')[1]) + 1;
  const shape = ordinal % PAIR_ART.shapeCount[level];
  const hue = (ordinal * PAIR_ART.hueStep[level]) % 360;
  return <span className="pair-face"><svg viewBox="0 0 40 32" aria-hidden="true" focusable="false">
    <g fill={`hsl(${hue} 65% 70%)`} stroke="currentColor" strokeWidth="1.5">
      {tile.cake ? <><path d="M7 14h26v14H7z"/><path d="M7 14q4-7 8 0q5-7 10 0q4-7 8 0" fill="white"/><path d="M20 5v7"/><circle cx="20" cy="4" r="2" fill="#ffae55"/></> : shape === 0 ? <circle cx="20" cy="17" r="12"/> : shape === 1 ? <path d="M20 3 34 27H6Z"/> : shape === 2 ? <rect x="8" y="5" width="24" height="24" rx="5"/> : <path d="M20 4 35 17 20 30 5 17Z"/>}
      <path d={`M${12 + ordinal % 4} 19h${9 + ordinal % 3}`} fill="none"/>
      <circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="25" cy="15" r="1" fill="currentColor"/>
    </g></svg><small>{tile.cake ? 'Cake ' : ''}{ordinal}</small></span>;
}
export function PairTile({ tile, index, revealed, locked, level, onFlip }: { tile: Tile; index: number; revealed: boolean; locked: boolean; level: Level; onFlip: () => void }) {
  if (tile.matched) return <span className="pair-slot pair-removed" aria-hidden="true" style={{ minWidth: UI.minTarget, minHeight: UI.minTarget }}/>;
  if (tile.kind === 'star') return <span className="pair-slot pair-star" aria-label="Free star: clears last" style={{ minWidth: UI.minTarget, minHeight: UI.minTarget }}><TileFace tile={tile} level={level}/></span>;
  return <Button className={`pair-tile ${revealed ? 'is-revealed' : 'is-hidden'}`} style={{ minWidth: UI.minTarget, minHeight: UI.minTarget, padding: 0 }} aria-label={revealed ? tileName(tile) : `Tile ${index + 1}`} aria-pressed={revealed} disabled={locked || revealed} onClick={onFlip}>{revealed ? <TileFace tile={tile} level={level}/> : <span aria-hidden="true" className="pair-back">❋</span>}</Button>;
}
