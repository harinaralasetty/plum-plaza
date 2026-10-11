import { useEffect } from 'react';
import { navigate, useRoute } from './routes';
import { GameShell } from './ui/GameShell';
import {ShopScreen} from './games/shop/Screen';
import { TownScreen } from './ui/TownScreen';
export default function App(){const {path}=useRoute();useEffect(()=>{if(!['/','/pairs','/cakes','/shop'].includes(path))navigate('/');},[path]);return path==='/shop'?<GameShell game="shop">{p=><ShopScreen {...p}/>}</GameShell>:path==='/'?<TownScreen/>:<main><h1>Coming to the plaza</h1><button onClick={()=>navigate('/')}>Town</button></main>;}
