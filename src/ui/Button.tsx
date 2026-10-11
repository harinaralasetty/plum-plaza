import type { ButtonHTMLAttributes } from 'react';
import { sfx } from '../audio/sfx';
export function Button({onClick,children,...props}:ButtonHTMLAttributes<HTMLButtonElement>){return <button type="button" {...props} onClick={e=>{sfx('tap');onClick?.(e);}}>{children}</button>;}
