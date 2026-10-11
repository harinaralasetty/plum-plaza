import { SHOP, RANK, type Level } from '../../config/constants';
import { pick, type Rng } from '../../core/rng';
export type Color = 'red'|'purple'|'yellow'|'blue'|'green';
export interface Feedback { exact:number; misplaced:number }
export interface Guess { colors:Color[]; feedback:Feedback; slots:boolean[] }
export interface ShopState { level:Level; secret:Color[]; draft:Color[]; guesses:Guess[]; status:'playing'|'won'|'lost' }
export function feedback(secret:readonly Color[],guess:readonly Color[]):Feedback {
 if(secret.length!==guess.length)throw new Error('Codes must have equal length');
 let exact=0; const s=new Map<Color,number>(),g=new Map<Color,number>();
 secret.forEach((c,i)=>{if(c===guess[i])exact++;else{s.set(c,(s.get(c)??0)+1);g.set(guess[i],(g.get(guess[i])??0)+1);}});
 let misplaced=0;for(const [c,n] of s)misplaced+=Math.min(n,g.get(c)??0);return {exact,misplaced};
}
export function createGame(level:Level,rng:Rng):ShopState {const cfg=SHOP[level];return {level,secret:cfg.slots.map(()=>pick(cfg.colors,rng)),draft:cfg.slots.map(()=>cfg.colors[0]),guesses:[],status:'playing'};}
export function choose(state:ShopState,index:number,color:Color):ShopState {if(state.status!=='playing'||index<0||index>=state.draft.length||!(SHOP[state.level].colors as readonly string[]).includes(color))return state;const draft=[...state.draft];draft[index]=color;return {...state,draft};}
export function submit(state:ShopState):ShopState {if(state.status!=='playing')return state;const f=feedback(state.secret,state.draft);const guesses=[...state.guesses,{colors:[...state.draft],feedback:f,slots:state.secret.map((c,i)=>c===state.draft[i])}];const limit=SHOP[state.level].limit;return {...state,guesses,status:f.exact===state.secret.length?'won':limit&&guesses.length>=limit?'lost':'playing'};}
export function resultTitle(state:ShopState):string {const limit=SHOP[state.level].limit||RANK.beginnerGuessBenchmark;const ratio=state.guesses.length/limit;return ratio<=RANK.shopBestRatio?'Sharp Sleuth':ratio<=RANK.shopMiddleRatio?'Smart Sleuth':'Lucky Guesser';}
