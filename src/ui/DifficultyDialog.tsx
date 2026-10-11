import { LEVELS,NAMES,type Game } from '../config/constants';
import { navigate } from '../routes';
import { Button } from './Button';
import { Modal } from './Modal';
export function DifficultyDialog({game,seed}:{game:Game;seed:number}){return <Modal title={`Choose a level · ${NAMES[game]}`} onCancel={()=>navigate('/')}><p>Start small, or give yourself a challenge.</p><div className="level-options">{LEVELS.map((level,i)=><Button key={level} onClick={()=>navigate(`/${game}?level=${level}&seed=${seed}`)}><span className="level-number">0{i+1}</span><strong>{level}</strong><span>{i===0?'A gentle beginning':i===1?'A little more to learn':'Put your skills to work'}</span></Button>)}</div><Button onClick={()=>navigate('/')}>Back to town</Button></Modal>;}
