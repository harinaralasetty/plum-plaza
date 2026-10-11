import { useEffect } from 'react';
import { type Game,type Level } from '../config/constants';
import { usePrefs } from '../settings/prefs';
import { sfx } from '../audio/sfx';
import { Button } from './Button';
import { Hud } from './Hud';
import { Modal } from './Modal';
export interface ScreenProps {level:Level;seed:number;onRestart:()=>void;onChange:()=>void;onTown:()=>void}
export function ResultDialog({game,won,title,stats,score,level,onRestart,onChange,onTown}:{game:Game;won:boolean;title:string;stats:Record<string,string|number>;score:number}&ScreenProps){const record=usePrefs(s=>s.record);useEffect(()=>{if(won)record(game,level,{score,title});sfx(won?'win':'wrong');},[game,level,score,title,won,record]);return <Modal title={won?'You won!':'Round complete'} onCancel={onTown}><div className="result-badge" aria-hidden="true">{won?'✦':'❋'}</div><h3>{title}</h3><Hud items={stats}/><div className="dialog-actions"><Button className="primary" onClick={onRestart}>Play again</Button><Button onClick={onChange}>Change level</Button><Button onClick={onTown}>Town</Button></div></Modal>;}
