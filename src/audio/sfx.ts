import { AUDIO } from '../config/constants';
import { usePrefs } from '../settings/prefs';
let context:AudioContext|undefined;
export function sfx(kind:keyof typeof AUDIO.frequencies){if(usePrefs.getState().muted)return;try{context??=new AudioContext();void context.resume();const osc=context.createOscillator(),gain=context.createGain();osc.frequency.value=AUDIO.frequencies[kind];gain.gain.setValueAtTime(AUDIO.volume,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+AUDIO.duration);osc.connect(gain);gain.connect(context.destination);osc.start();osc.stop(context.currentTime+AUDIO.duration);}catch{/* Audio is optional. */}}
