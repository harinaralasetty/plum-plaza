import {createStore} from 'zustand/vanilla';
import type {Level} from '../../config/constants';
import {mulberry32} from '../../core/rng';
import * as logic from './logic';
export interface CakesStore {
 game:logic.CakeState;
 add:()=>void; select:(id:number)=>void; press:(station:logic.Station,value:unknown)=>void;
 move:(direction:'left'|'right')=>void; tick:()=>void; ship:()=>void; trash:()=>void; elapse:(seconds:number)=>void;
}
export function createCakesStore(level:Level,seed:number){
 const rng=mulberry32(seed);
 return createStore<CakesStore>(set=>({game:logic.createGame(level,rng),
  add:()=>set(s=>({game:logic.addCake(s.game,rng)})),
  select:id=>set(s=>({game:logic.selectCake(s.game,id)})),
  press:(station,value)=>set(s=>({game:logic.press(s.game,station,value)})),
  move:direction=>set(s=>({game:logic.move(s.game,direction)})),
  tick:()=>set(s=>({game:logic.tick(s.game)})),
  ship:()=>set(s=>({game:s.game.selectedId===null?s.game:logic.ship(s.game,s.game.selectedId)})),
  trash:()=>set(s=>({game:s.game.selectedId===null?s.game:logic.trash(s.game,s.game.selectedId)})),
  elapse:seconds=>set(s=>({game:logic.elapse(s.game,seconds)}))
 }));
}
