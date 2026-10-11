import { createStore } from 'zustand/vanilla';
import type { Level } from '../../config/constants';
import {mulberry32} from '../../core/rng';
import {createGame,choose,submit,type ShopState,type Color} from './logic';
export function createShopStore(level:Level,seed:number){return createStore<{game:ShopState;choose:(index:number,color:Color)=>void;submit:()=>void}>(set=>({game:createGame(level,mulberry32(seed)),choose:(i,c)=>set(s=>({game:choose(s.game,i,c)})),submit:()=>set(s=>({game:submit(s.game)}))}));}
