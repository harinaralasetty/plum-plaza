import {useMemo} from 'react';
import {useStore} from 'zustand';
import {SHOP} from '../../config/constants';
import {Button} from '../../ui/Button';
import {Hud} from '../../ui/Hud';
import {ResultDialog,type ScreenProps} from '../../ui/ResultDialog';
import {createShopStore} from './store';
import {resultTitle} from './logic';
import {Plum,PlumPart} from './plum';
import './shop.css';

export function ShopScreen(props:ScreenProps){
 const store=useMemo(()=>createShopStore(props.level,props.seed),[props.level,props.seed]);
 const {game,choose,submit}=useStore(store);const cfg=SHOP[props.level];
 return <><p className="game-intro">Pick colourful parts from the shelves to dress your Plum. Find the mystery Plum behind the curtain!</p><Hud items={{Guesses:game.guesses.length,Limit:cfg.limit||'Unlimited'}}/>
 <div className="shop-layout"><section className="panel plum-stage"><span className="eyebrow">THE MYSTERY PLUM</span><div className={game.status==='playing'?'curtain':'curtain revealed'}><Plum colors={game.secret} slots={cfg.slots} hidden={game.status==='playing'}/></div>{game.status!=='playing'&&<p>{cfg.slots.map((slot,i)=>slot+': '+game.secret[i]).join(' · ')}</p>}<p>{props.level==='advanced'?'Count the colours in the right place, and those in the wrong place. Colours can repeat.':'Each tick means that part is right. A cross means try another colour. Colours can repeat.'}</p><div className="shop-sign" aria-hidden="true">A LITTLE PLUM BOUTIQUE</div></section>
 <section className="panel guess-panel"><div className="shop-counter-heading"><span className="eyebrow">MIX, MATCH & MEET YOUR PLUM</span><h2>The dressing room</h2></div><div className="guess-builder"><div className="guess-preview"><span>Your Plum</span><Plum colors={game.draft} slots={cfg.slots}/><div className="plum-pedestal" aria-hidden="true"/></div><div className="parts-shelves">{cfg.slots.map((slot,i)=><fieldset key={slot} className="parts-shelf" disabled={game.status!=='playing'}><legend>{slot}</legend><div className="part-choices" style={{gridTemplateColumns:'repeat('+cfg.colors.length+',minmax(0,1fr))'}}>{cfg.colors.map(color=><Button key={color} className="part-choice" data-slot={slot} data-color={color} aria-label={'Use '+color+' '+slot} aria-pressed={game.draft[i]===color} onClick={()=>choose(i,color)}><PlumPart slot={slot} color={color}/><span>{color}</span></Button>)}</div></fieldset>)}</div></div>
 <Button className="primary shop-guess" disabled={game.status!=='playing'} onClick={submit}>Guess</Button><div className="guess-history" aria-live="polite"><h3>Your Plum parade</h3>{game.guesses.length===0?<p>Choose a colour for each part, then make your first guess.</p>:game.guesses.map((g,i)=><div className="guess-row" key={i}><strong>#{i+1}</strong><span className="guess-objects">{g.colors.map((color,j)=><span className="guess-object" key={cfg.slots[j]}><PlumPart slot={cfg.slots[j]} color={color}/><small>{cfg.slots[j]}<br/>{color}</small></span>)}</span><span>{props.level==='advanced'?g.feedback.exact+' exact · '+g.feedback.misplaced+' misplaced':g.slots.map((right,j)=><span key={j} className="slot-feedback">{cfg.slots[j]} {right?'✓':'✕'}</span>)}</span></div>)}</div></section></div>
 {game.status!=='playing'&&<ResultDialog {...props} game="shop" won={game.status==='won'} title={resultTitle(game)} stats={{Guesses:game.guesses.length,Answer:game.secret.join(', ')}} score={game.guesses.length}/>}</>;
}
