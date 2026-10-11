import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {LEVELS,type Level} from './config/constants';
function readRoute(){const raw=location.hash.slice(1)||'/';const [path,search='']=raw.split('?');const params=new URLSearchParams(search||location.search);const value=params.get('level'),seed=params.get('seed');return {path,level:LEVELS.includes(value as Level)?value as Level:null,seed:seed!==null&&/^-?\d+$/.test(seed)&&Number.isSafeInteger(Number(seed))?Number(seed):Date.now()};}
let guard:((target:string)=>boolean)|undefined;
let forced=false;
export function guardNavigation(callback:(target:string)=>boolean){guard=callback;return()=>{if(guard===callback)guard=undefined;};}
const RouteContext=createContext(readRoute());
export function HashRouter({children}:{children:ReactNode}){const [route,setRoute]=useState(readRoute);useEffect(()=>{let currentHash=location.hash||'#/';const update=()=>{const target=location.hash.slice(1)||'/';const bypass=forced;forced=false;if(!bypass&&guard&&!guard(target)){history.replaceState(null,'',location.pathname+location.search+currentHash);return;}currentHash=location.hash||'#/';setRoute(readRoute());};addEventListener('hashchange',update);return()=>removeEventListener('hashchange',update);},[]);return <RouteContext.Provider value={route}>{children}</RouteContext.Provider>;}
export const useRoute=()=>useContext(RouteContext);
export function navigate(path:string,force=false){forced=force;location.hash=path;}
