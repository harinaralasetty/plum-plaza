import {afterEach,expect,test,vi} from 'vitest';
import {CAKES,ICING_OPTIONS,TOPPING_OPTIONS} from '../../src/config/constants';
import {mulberry32} from '../../src/core/rng';
import {addCake,createGame,generateOrder,matchesOrder,move,press,selectCake,ship,tick,trash,type CakeState} from '../../src/games/cakes/logic';
const rng=()=>mulberry32(14);
function at(state:CakeState,slot:number):CakeState {while(state.cakes.find(c=>c.id===state.selectedId)?.slot!==slot)state=move(state,'right');return state;}
function complete(state:CakeState):CakeState {
 const order=state.cakes.find(c=>c.id===state.selectedId)!.order;
 state=press(at(state,0),'pan',order.pan);
 for(const layer of order.layers)state=press(at(state,1),'batter',layer.batter);
 for(const filling of order.fillings)state=press(at(state,2),'filling',filling);
 state=press(at(state,3),'icing',order.icing);
 state=press(at(state,4),'topping',order.topping);
 if(order.glaze)state=press(state,'glaze',true);
 return at(state,5);
}
afterEach(()=>vi.useRealTimers());
test('1000 seeded orders per level are valid and repeatable',()=>{
 for(const level of ['beginner','intermediate','advanced'] as const)for(let seed=0;seed<1000;seed++){
  const order=generateOrder(level,mulberry32(seed));
  expect(order).toEqual(generateOrder(level,mulberry32(seed)));
  expect(order.layers).toHaveLength(CAKES[level].layers);expect(order.fillings).toHaveLength(CAKES[level].layers-1);
  expect(ICING_OPTIONS).toContain(order.icing);expect(TOPPING_OPTIONS).toContain(order.topping);
  if(order.glaze){expect(level).toBe('advanced');expect(order.icing).not.toBe('none');}
 }
});
test('equality checks every field, count and ordered ingredient',()=>{
 const order={pan:'round' as const,layers:[{batter:'vanilla' as const},{batter:'chocolate' as const},{batter:'strawberry' as const}],fillings:['red','green'] as ('red'|'green')[],icing:'vanilla' as const,topping:'sprinkles' as const,glaze:true};
 expect(matchesOrder(order,order)).toBe(true);
 const changes=[{pan:'heart'},{layers:order.layers.slice(1)},{layers:[...order.layers].reverse()},{fillings:['green','red']},{fillings:['red']},{icing:'chocolate'},{topping:'none'},{glaze:false},{icing:null},{topping:null}];
 for(const change of changes)expect(matchesOrder({...order,...change} as typeof order,order)).toBe(false);
 expect(matchesOrder({...order,icing:'none'},{...order,icing:'none'})).toBe(false);
});
test('station alignment and prior assembly are enforced without mistakes',()=>{
 let state=createGame('intermediate',rng());
 const original=state.cakes;
 state=press(state,'batter','vanilla');expect(state.cakes).toEqual(original);expect(state.cue).toBeTruthy();
 state=press(at(state,3),'icing','vanilla');expect(state.cakes[0].icing).toBeNull();
 state=press(at(state,0),'pan','round');state=press(at(state,1),'batter','vanilla');
 state=press(at(state,2),'filling','red');expect(state.cakes[0].fillings).toHaveLength(0);
 state=press(at(state,1),'batter','chocolate');state=press(at(state,3),'icing','none');expect(state.cakes[0].icing).toBeNull();
 state=press(at(state,2),'filling','red');state=press(at(state,3),'icing','none');state=press(at(state,4),'topping','none');
 expect(state.cakes[0].icing).toBe('none');expect(state.cakes[0].topping).toBe('none');expect(state.mistakes).toBe(0);
});
test('glaze requires advanced level, real icing and chosen topping',()=>{
 let state=createGame('advanced',rng());state=press(at(state,4),'glaze',true);expect(state.cakes[0].glaze).toBe(false);
 state=complete(state);state=at(state,4);
 const cake=state.cakes[0];state={...state,cakes:[{...cake,icing:'vanilla',topping:null}]};
 expect(press(state,'glaze',true).cakes[0].glaze).toBe(cake.glaze);
 state={...state,cakes:[{...cake,icing:'none',glaze:false}]};expect(press(state,'glaze',true).cakes[0].glaze).toBe(false);
 state={...state,cakes:[{...cake,icing:'vanilla',glaze:false}]};expect(press(state,'glaze',true).cakes[0].glaze).toBe(true);
});
test('shipping requires box, trash is free, wrong cake is discarded and three mistakes lose',()=>{
 let state=createGame('beginner',rng());expect(ship(state,1).cakes).toHaveLength(1);
 state=trash(state,1);expect(state.mistakes).toBe(0);
 for(let n=0;n<3;n++){state=addCake(state,rng());const id=state.selectedId!;state=ship(at(state,5),id);expect(state.cakes).toHaveLength(0);}
 expect(state.status).toBe('lost');expect(addCake(state,rng())).toBe(state);
});
test('exact orders win at each level target and terminal state stays frozen',()=>{
 for(const level of ['beginner','intermediate','advanced'] as const){
  let state=createGame(level,rng());
  for(let n=0;n<CAKES[level].target;n++){if(n)state=addCake(state,rng());state=complete(state);state=ship(state,state.selectedId!);}
  expect(state.status).toBe('won');expect(state.shipped).toBe(CAKES[level].target);expect(state.mistakes).toBe(0);expect(tick(state)).toBe(state);
 }
});
test('three cakes keep unique loop positions with external fake timer ticks',()=>{
 vi.useFakeTimers();let state=createGame('intermediate',rng());state=tick(state);state=addCake(state,rng());state=tick(state);state=addCake(state,rng());
 expect(state.cakes).toHaveLength(3);expect(addCake(state,rng()).cakes).toHaveLength(3);
 const initial=state.cakes.map(c=>c.slot);const timer=setInterval(()=>{state=tick(state);},CAKES.intermediate.beltMs);
 vi.advanceTimersByTime(CAKES.intermediate.beltMs*6);clearInterval(timer);
 expect(state.cakes.map(c=>c.slot)).toEqual(initial);expect(new Set(state.cakes.map(c=>c.slot)).size).toBe(3);
 state=selectCake(state,state.cakes[0].id);expect(state.selectedId).toBe(state.cakes[0].id);
 const beginner=createGame('beginner',rng());expect(tick(beginner)).toBe(beginner);expect(move(beginner,'left').cakes[0].slot).toBe(5);
});
