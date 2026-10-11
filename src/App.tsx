import { useEffect } from 'react';
import { navigate, useRoute } from './routes';
import { TownScreen } from './ui/TownScreen';
export default function App(){const {path}=useRoute();useEffect(()=>{if(!['/','/pairs','/cakes','/shop'].includes(path))navigate('/');},[path]);return path==='/'?<TownScreen/>:<main><h1>Coming to the plaza</h1><button onClick={()=>navigate('/')}>Town</button></main>;}
