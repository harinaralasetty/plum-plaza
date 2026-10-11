import {useEffect,useState,type ReactNode} from 'react';
import {NAMES,type Game} from '../config/constants';
import {guardNavigation,navigate,useRoute} from '../routes';
import {usePrefs} from '../settings/prefs';
import {Button} from './Button';
import {DifficultyDialog} from './DifficultyDialog';
import {Modal} from './Modal';
import type {ScreenProps} from './ResultDialog';
export function GameShell({game,children}:{game:Game;children:(props:ScreenProps)=>ReactNode}){
 const {level,seed}=useRoute();const [run,setRun]=useState(0),[leave,setLeave]=useState<string|null>(null);const prefs=usePrefs();
 useEffect(()=>{if(!level)return;return guardNavigation(target=>{if(document.querySelector('dialog[data-result]'))return true;setLeave(target);return false;});},[level]);
 useEffect(()=>{const esc=(e:KeyboardEvent)=>{if(e.key==='Escape'&&level&&!document.querySelector('dialog[open]')){e.preventDefault();setLeave('/');}};document.addEventListener('keydown',esc);return()=>document.removeEventListener('keydown',esc);},[level]);
 if(!level)return <main><DifficultyDialog game={game} seed={seed}/></main>;
 const props:ScreenProps={level,seed,onRestart:()=>{setLeave(null);setRun(n=>n+1);},onChange:()=>{setLeave(null);navigate(`/${game}?seed=${seed}`,true);},onTown:()=>{setLeave(null);navigate('/',true);}};
 return <main className={`game-main ${game}`}><header className="game-header"><div><span className="eyebrow">PLUM PLAZA / {level}</span><h1>{NAMES[game]}</h1></div><nav aria-label="Game controls"><Button onClick={()=>setLeave('/')}>← Back to town</Button><Button onClick={props.onRestart}>Restart</Button><Button aria-pressed={!prefs.muted} onClick={prefs.toggle}>{prefs.muted?'Sound off':'Sound on'}</Button></nav></header><div key={`${level}:${seed}:${run}`}>{children(props)}</div>{leave&&<Modal title="Leave this round?" onCancel={()=>setLeave(null)}><p>Your current round will end.</p><Button className="primary" onClick={()=>setLeave(null)} autoFocus>Keep playing</Button><Button onClick={()=>{navigate(leave,true);setLeave(null);}}>Leave for town</Button></Modal>}</main>;
}
