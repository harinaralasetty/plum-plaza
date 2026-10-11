import {afterEach,expect,test,vi} from 'vitest';
import {readPrefs,usePrefs} from '../../src/settings/prefs';
import {PREFS_KEY} from '../../src/config/constants';
const empty={muted:true,best:{}};
afterEach(()=>vi.unstubAllGlobals());
test('corrupt storage and invalid result keys safely fall back',()=>{
 for(const value of ['broken','null','{}',JSON.stringify({muted:false,best:{'shop:beginner:extra':{score:1,title:'Sleuth'}}}),JSON.stringify({muted:true,best:{'pairs:advanced':{score:-1,title:'Bloom'}}})]){
  vi.stubGlobal('localStorage',{getItem:()=>value});expect(readPrefs()).toEqual(empty);
 }
});
test('valid mute and winning result survive storage reload',()=>{
 const data={muted:false,best:{'shop:beginner':{score:2,title:'Smart Sleuth'}}};vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify(data)});expect(readPrefs()).toEqual(data);
});
test('best scores improve only and use the single namespaced key',()=>{
 const writes:unknown[][]=[];vi.stubGlobal('localStorage',{setItem:(...args:unknown[])=>writes.push(args)});usePrefs.setState(empty);usePrefs.getState().record('shop','beginner',{score:3,title:'Smart Sleuth'});usePrefs.getState().record('shop','beginner',{score:4,title:'Lucky Guesser'});usePrefs.getState().record('shop','beginner',{score:1,title:'Sharp Sleuth'});
 expect(writes).toHaveLength(2);expect(writes.every(w=>w[0]===PREFS_KEY)).toBe(true);expect(usePrefs.getState().best['shop:beginner']?.score).toBe(1);
});
test('unavailable storage does not prevent settings changes',()=>{
 vi.stubGlobal('localStorage',{getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('quota');}});expect(readPrefs()).toEqual(empty);usePrefs.setState(empty);expect(()=>usePrefs.getState().toggle()).not.toThrow();expect(usePrefs.getState().muted).toBe(false);
});
