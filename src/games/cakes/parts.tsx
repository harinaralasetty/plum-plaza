import type {CakeRecipe} from './logic';
const colors:Record<string,string>={vanilla:'#f6d894',chocolate:'#77432c',strawberry:'#ec8ea8',red:'#c83948',green:'#4d8d57',white:'#fff8e9',none:'transparent'};
export function Recipe({recipe}:{recipe:CakeRecipe}){return <dl className="cake-recipe"><div><dt>Pan</dt><dd>{recipe.pan??'Choose pan'}</dd></div><div><dt>Batter layers</dt><dd>{recipe.layers.length?recipe.layers.map((l,i)=>`${i+1}: ${l.batter}`).join(' → '):'Not added'}</dd></div><div><dt>Fillings</dt><dd>{recipe.fillings.length?recipe.fillings.map((f,i)=>`${i+1}: ${f}`).join(' → '):'None added'}</dd></div><div><dt>Icing</dt><dd>{recipe.icing??'Not selected'}</dd></div><div><dt>Topping</dt><dd>{recipe.topping??'Not selected'}</dd></div><div><dt>Glaze</dt><dd>{recipe.glaze?'Yes':'No'}</dd></div></dl>;}
export function CakeArt({recipe}:{recipe:CakeRecipe}){
 const shape=recipe.pan==='heart'?'M50 32 C14 1 0 45 50 77 C100 45 86 1 50 32':recipe.pan==='square'?'M12 18 H88 V78 H12 Z':'M8 48 A42 30 0 1 0 92 48 A42 30 0 1 0 8 48';
 return <svg viewBox="0 0 100 110" aria-hidden="true" className="cake-art" style={{width:'100%',maxWidth:140,display:'block',margin:'auto'}}>
  <ellipse cx="50" cy="99" rx="47" ry="7" fill="#c7dddb"/>
  {recipe.layers.map((layer,i)=><g key={i}><rect x="13" y={82-i*12} width="74" height="12" rx="4" fill={colors[layer.batter]} stroke="#744c36"/>{recipe.fillings[i]&&<rect x="13" y={81-i*12} width="74" height="3" fill={colors[recipe.fillings[i]]}/>}</g>)}
  <path d={shape} fill={recipe.icing&&recipe.icing!=='none'?colors[recipe.icing]:recipe.layers[0]?colors[recipe.layers[0].batter]:'#ddd6ca'} stroke="#75594c" strokeWidth="3"/>
  {recipe.topping==='sprinkles'&&[25,40,55,70].map((x,i)=><path key={x} d={`M${x} ${40+i%2*12} l5 5`} stroke={i%2?'#5744a0':'#df456f'} strokeWidth="3"/>)}
  {recipe.topping==='star candy'&&<path d="M50 30 l5 12 13 1 -10 8 3 13 -11 -7 -11 7 3 -13 -10 -8 13 -1Z" fill="#ffd45f" stroke="#aa7827"/>}
  {recipe.topping==='heart candy'&&<path d="M50 42 C32 23 25 47 50 64 C75 47 68 23 50 42" fill="#db4477"/>}
  {recipe.glaze&&<path d="M24 35 Q47 23 72 37" fill="none" stroke="white" strokeWidth="5" opacity=".75"/>}
 </svg>;
}
