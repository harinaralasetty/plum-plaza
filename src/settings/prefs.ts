import { create } from 'zustand';
import { PREFS_KEY, LEVELS, type Game, type Level } from '../config/constants';
export interface Best { score:number; title:string }
export interface Prefs { muted:boolean; best:Partial<Record<`${Game}:${Level}`,Best>> }
export function readPrefs():Prefs {try{const x=JSON.parse(localStorage.getItem(PREFS_KEY)??'null');if(!x||typeof x.muted!=='boolean'||typeof x.best!=='object'||x.best===null||Array.isArray(x.best))return {muted:true,best:{}};for(const [k,v] of Object.entries(x.best)){const [g,l]=k.split(':');const b=v as Best;if(!['pairs','cakes','shop'].includes(g)||!LEVELS.includes(l as Level)||!b||typeof b.title!=='string'||!Number.isFinite(b.score)||b.score<0)return {muted:true,best:{}};}return x;}catch{return {muted:true,best:{}};}}
function save(p:Prefs){try{localStorage.setItem(PREFS_KEY,JSON.stringify(p));}catch{/* Storage may be unavailable. */}}
export const usePrefs=create<Prefs & {toggle:()=>void;record:(game:Game,level:Level,best:Best)=>void}>((set,get)=>({...readPrefs(),toggle:()=>{const p={muted:!get().muted,best:get().best};save(p);set(p);},record:(game,level,best)=>{const key=`${game}:${level}` as const;const prev=get().best[key];if(prev&&prev.score<=best.score)return;const p={muted:get().muted,best:{...get().best,[key]:best}};save(p);set(p);}}));
