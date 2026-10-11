import { NAMES, type Game } from '../config/constants';
import { navigate } from '../routes';
import { usePrefs } from '../settings/prefs';
export function TownScreen(){const p=usePrefs();return <main><h1>Plum Plaza</h1><p>Three little adventures. One happy place.</p><button onClick={p.toggle}>{p.muted?'Sound off':'Sound on'}</button><div>{(Object.keys(NAMES) as Game[]).map(g=><button key={g} onClick={()=>navigate('/'+g)}>{NAMES[g]}</button>)}</div></main>;}
