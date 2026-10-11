import {useEffect,useMemo} from 'react';
import {useStore} from 'zustand';
import {BATTER_OPTIONS,CAKES,FILLING_OPTIONS,ICING_OPTIONS,PAN_OPTIONS,TOPPING_OPTIONS,UI} from '../../config/constants';
import {Button} from '../../ui/Button';
import {Hud} from '../../ui/Hud';
import {ResultDialog,type ScreenProps} from '../../ui/ResultDialog';
import {resultTitle,type Station} from './logic';
import {createCakesStore} from './store';
import {CakeArt,Recipe} from './parts';
const stations=['Pan','Batter','Filling','Icing','Topping','Box'] as const;
const ingredients:{station:Station;options:readonly string[]}[]=[{station:'pan',options:PAN_OPTIONS},{station:'batter',options:BATTER_OPTIONS},{station:'filling',options:FILLING_OPTIONS},{station:'icing',options:ICING_OPTIONS},{station:'topping',options:TOPPING_OPTIONS}];
export function CakesScreen(props:ScreenProps){
 const store=useMemo(()=>createCakesStore(props.level,props.seed),[props.level,props.seed]);
 const {game,add,select,press,move,tick,ship,trash,elapse}=useStore(store);
 const cfg=CAKES[props.level];const selected=game.cakes.find(c=>c.id===game.selectedId);
 useEffect(()=>{if(!cfg.beltMs||game.status!=='playing')return;const timer=setInterval(tick,cfg.beltMs);return()=>clearInterval(timer);},[cfg.beltMs,tick,game.status]);
 useEffect(()=>{if(game.status!=='playing')return;let previous=performance.now();const timer=setInterval(()=>{const now=performance.now();elapse((now-previous)/UI.msPerSecond);previous=now;},UI.timerTickMs);return()=>{clearInterval(timer);};},[elapse,game.status]);
 return <><p className="game-intro">Build each order from pan to box. Add all batter layers first, then fillings between layers, icing and topping. The belt loops around.</p>
 <Hud items={{Shipped:`${game.shipped} / ${cfg.target}`,Mistakes:`${game.mistakes} / ${cfg.mistakeLimit}`,Cakes:`${game.cakes.length} / ${cfg.capacity}`,Time:`${Math.floor(game.elapsed)}s`}}/>
 <div className="cakes-layout"><aside className="panel cake-orders"><h2>Order notebook</h2>{game.cakes.length===0&&<p>Add a cake to receive another order.</p>}{game.cakes.map(c=><article key={c.id} className={`cake-order ${game.selectedId===c.id?'selected':''}`}><Button aria-pressed={game.selectedId===c.id} onClick={()=>select(c.id)}>Cake #{c.id} · {stations[c.slot]}</Button><CakeArt recipe={c.order}/><Recipe recipe={c.order}/></article>)}</aside>
 <section className="panel cake-workspace"><h2>Conveyor kitchen</h2><p>{props.level==='beginner'?'Use Left and Right to move your cake.':`The belt moves every ${cfg.beltMs/UI.msPerSecond} seconds. Select the cake you want to work on.`}</p>
 <div className="cake-belt" style={{display:'grid',gridTemplateColumns:'repeat(6,minmax(0,1fr))',gap:2}}>{stations.map((name,slot)=>{const cake=game.cakes.find(c=>c.slot===slot);return <div key={name} className="belt-slot" style={{minWidth:0,textAlign:'center'}}><strong style={{fontSize:11}}>{name}</strong>{cake?<Button className="belt-cake" aria-label={`Select cake ${cake.id} at ${name}`} aria-pressed={game.selectedId===cake.id} onClick={()=>select(cake.id)} style={{width:'100%',minWidth:44,padding:0,margin:'4px 0',fontSize:11}}><CakeArt recipe={cake}/><span>#{cake.id}</span></Button>:<div className="empty-belt-slot" style={{minHeight:70}}>·</div>}</div>;})}</div>
 <div className="cake-actions">{props.level==='beginner'&&<><Button onClick={()=>move('left')}>← Left</Button><Button onClick={()=>move('right')}>Right →</Button></>}<Button onClick={add}>Add cake</Button><Button onClick={trash} disabled={!selected}>Trash selected cake</Button></div>
 <p aria-live="polite" className="cake-cue">{game.cue||'Select a cake, then use its station.'}</p>
 <h3>{selected?`Making cake #${selected.id} at ${stations[selected.slot]}`:'No cake selected'}</h3>{selected&&<Recipe recipe={selected}/>} 
 <div className="cake-stations">{ingredients.map(({station,options})=><section key={station} className="cake-station"><h3>{station[0].toUpperCase()+station.slice(1)}</h3>{station==='filling'&&cfg.layers===1?<p>Single layer cakes skip fillings.</p>:options.map(option=><Button key={option} onClick={()=>press(station,option)}>{option}</Button>)}{station==='topping'&&props.level==='advanced'&&<><p>Glaze needs icing and a selected topping.</p><Button onClick={()=>press('glaze',true)}>Add glaze</Button><Button onClick={()=>press('glaze',false)}>No glaze</Button></>}</section>)}<section className="cake-station"><h3>Box</h3><Button className="primary" onClick={ship}>Ship selected cake</Button></section></div>
 </section></div>{game.status!=='playing'&&<ResultDialog {...props} game="cakes" won={game.status==='won'} title={resultTitle(game)} stats={{Shipped:game.shipped,Mistakes:game.mistakes,'Time per shipped cake':`${(game.elapsed/Math.max(game.shipped,1)).toFixed(1)}s`}} score={game.mistakes}/>}</>;
}
