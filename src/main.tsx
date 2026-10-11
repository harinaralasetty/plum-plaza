import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { HashRouter } from './routes';
import './style.css';
import {UI} from './config/constants';
document.documentElement.style.setProperty('--target-size',`${UI.minTarget}px`);
createRoot(document.getElementById('root')!).render(<React.StrictMode><HashRouter><App/></HashRouter></React.StrictMode>);
