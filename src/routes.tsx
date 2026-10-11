import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { LEVELS, type Level } from './config/constants';
function readRoute(){const raw=location.hash.slice(1)||'/';const [path,search='']=raw.split('?');const params=new URLSearchParams(search||location.search);const value=params.get('level');const seed=params.get('seed');return {path,level:LEVELS.includes(value as Level)?value as Level:null,seed:seed!==null&&/^-?\d+$/.test(seed)?Number(seed):Date.now()};}
const RouteContext=createContext(readRoute());
export function HashRouter({children}:{children:ReactNode}){const [route,setRoute]=useState(readRoute);useEffect(()=>{const update=()=>setRoute(readRoute());addEventListener('hashchange',update);return()=>removeEventListener('hashchange',update);},[]);return <RouteContext.Provider value={route}>{children}</RouteContext.Provider>;}
export const useRoute=()=>useContext(RouteContext);
export function navigate(path:string){location.hash=path;}
