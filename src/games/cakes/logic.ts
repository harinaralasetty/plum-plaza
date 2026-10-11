import {BATTER_OPTIONS, BELT_SLOTS, CAKES, FILLING_OPTIONS, GLAZE_CHANCE, ICING_OPTIONS, PAN_OPTIONS, TOPPING_OPTIONS, type Level} from '../../config/constants';
import {pick, type Rng} from '../../core/rng';

export type Pan = typeof PAN_OPTIONS[number];
export type Batter = typeof BATTER_OPTIONS[number];
export type Filling = typeof FILLING_OPTIONS[number];
export type Icing = typeof ICING_OPTIONS[number];
export type Topping = typeof TOPPING_OPTIONS[number];
export type Station = 'pan'|'batter'|'filling'|'icing'|'topping'|'glaze'|'box';
export interface CakeRecipe { pan: Pan|null; layers: {batter:Batter}[]; fillings:Filling[]; icing:Icing|null; topping:Topping|null; glaze:boolean }
export interface Cake extends CakeRecipe { id:number; slot:number; order:CakeRecipe }
export interface CakeState { level:Level; cakes:Cake[]; selectedId:number|null; nextId:number; shipped:number; mistakes:number; elapsed:number; score:number; status:'playing'|'won'|'lost'; cue:string }
const stationSlots:Record<Station,number> = {pan:0,batter:1,filling:2,icing:3,topping:4,glaze:4,box:5};
const blank = ():CakeRecipe => ({pan:null,layers:[],fillings:[],icing:null,topping:null,glaze:false});
export function generateOrder(level:Level,rng:Rng):CakeRecipe {
 const icing=pick(ICING_OPTIONS,rng);
 return {pan:pick(PAN_OPTIONS,rng),layers:Array.from({length:CAKES[level].layers},()=>({batter:pick(BATTER_OPTIONS,rng)})),fillings:Array.from({length:CAKES[level].layers-1},()=>pick(FILLING_OPTIONS,rng)),icing,topping:pick(TOPPING_OPTIONS,rng),glaze:level==='advanced'&&icing!=='none'&&rng()<GLAZE_CHANCE};
}
export function createGame(level:Level,rng:Rng):CakeState {
 return addCake({level,cakes:[],selectedId:null,nextId:1,shipped:0,mistakes:0,elapsed:0,score:0,status:'playing',cue:''},rng);
}
const ignored=(state:CakeState,cue:string):CakeState=>({...state,cue});
export function addCake(state:CakeState,rng:Rng):CakeState {
 if(state.status!=='playing')return state;
 if(state.cakes.length>=CAKES[state.level].capacity)return ignored(state,'Cake capacity reached.');
 if(state.cakes.some(c=>c.slot===0))return ignored(state,'Move the cake at the pan station first.');
 const cake:Cake={...blank(),id:state.nextId,slot:0,order:generateOrder(state.level,rng)};
 return {...state,cakes:[...state.cakes,cake],nextId:state.nextId+1,selectedId:cake.id,cue:'New cake ready at the pan station.'};
}
export function selectCake(state:CakeState,id:number):CakeState {return state.status==='playing'&&state.cakes.some(c=>c.id===id)?{...state,selectedId:id,cue:''}:state;}
export function press(state:CakeState,station:Station,value:unknown):CakeState {
 if(state.status!=='playing')return state;
 const cake=state.cakes.find(c=>c.id===state.selectedId);
 if(!cake||cake.slot!==stationSlots[station])return ignored(state,'Select a cake at this station.');
 const count=CAKES[state.level].layers;
 let changed:Cake|undefined;
 if(station==='pan'&&cake.pan===null&&PAN_OPTIONS.some(v=>v===value))changed={...cake,pan:value as Pan};
 if(station==='batter'&&cake.pan!==null&&cake.layers.length<count&&BATTER_OPTIONS.some(v=>v===value))changed={...cake,layers:[...cake.layers,{batter:value as Batter}]};
 if(station==='filling'&&cake.layers.length===count&&cake.fillings.length<count-1&&FILLING_OPTIONS.some(v=>v===value))changed={...cake,fillings:[...cake.fillings,value as Filling]};
 if(station==='icing'&&cake.layers.length===count&&cake.fillings.length===count-1&&cake.icing===null&&ICING_OPTIONS.some(v=>v===value))changed={...cake,icing:value as Icing};
 if(station==='topping'&&cake.icing!==null&&cake.topping===null&&TOPPING_OPTIONS.some(v=>v===value))changed={...cake,topping:value as Topping};
 if(station==='glaze'&&state.level==='advanced'&&cake.icing!==null&&cake.icing!=='none'&&cake.topping!==null&&typeof value==='boolean')changed={...cake,glaze:value};
 if(!changed)return ignored(state,'Complete the previous steps first, or choose a valid ingredient.');
 return {...state,cakes:state.cakes.map(c=>c.id===cake.id?changed:c),cue:'Ingredient added.'};
}
// Every cake moves together on a six-slot loop, preserving unique positions.
export function move(state:CakeState,direction:'left'|'right'):CakeState {
 if(state.status!=='playing')return state;
 const delta=direction==='left'?-1:1;
 return {...state,cakes:state.cakes.map(c=>({...c,slot:(c.slot+delta+BELT_SLOTS)%BELT_SLOTS})),cue:''};
}
export function tick(state:CakeState):CakeState {return CAKES[state.level].beltMs===0?state:move(state,'right');}
export function matchesOrder(cake:CakeRecipe,order:CakeRecipe):boolean {
 return cake.pan!==null&&cake.icing!==null&&cake.topping!==null&&cake.pan===order.pan&&cake.icing===order.icing&&cake.topping===order.topping&&cake.glaze===order.glaze&&(!cake.glaze||cake.icing!=='none')&&cake.layers.length===order.layers.length&&cake.layers.every((l,i)=>l.batter===order.layers[i].batter)&&cake.fillings.length===order.fillings.length&&cake.fillings.every((f,i)=>f===order.fillings[i]);
}
function remove(state:CakeState,id:number):CakeState {const cakes=state.cakes.filter(c=>c.id!==id);return {...state,cakes,selectedId:state.selectedId===id?(cakes[0]?.id??null):state.selectedId};}
export function ship(state:CakeState,id:number):CakeState {
 if(state.status!=='playing')return state;
 const cake=state.cakes.find(c=>c.id===id);
 if(!cake||cake.slot!==stationSlots.box)return ignored(state,'Move this cake to the box station.');
 const correct=matchesOrder(cake,cake.order);
 const shipped=state.shipped+Number(correct),mistakes=state.mistakes+Number(!correct);
 return {...remove(state,id),shipped,mistakes,score:shipped,status:shipped>=CAKES[state.level].target?'won':mistakes>=CAKES[state.level].mistakeLimit?'lost':'playing',cue:correct?'Order shipped!':'Wrong order discarded.'};
}
export function trash(state:CakeState,id:number):CakeState {return state.status==='playing'&&state.cakes.some(c=>c.id===id)?{...remove(state,id),cue:'Cake discarded. No mistake added.'}:state;}
export function elapse(state:CakeState,seconds:number):CakeState {return state.status==='playing'&&Number.isFinite(seconds)&&seconds>0?{...state,elapsed:state.elapsed+seconds}:state;}
export function resultTitle(state:CakeState):string {return state.status==='won'?'Cake Champion!':state.status==='lost'?'Keep Practicing!':'Cozy Cakes';}
