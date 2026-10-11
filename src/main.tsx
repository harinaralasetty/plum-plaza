import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { HashRouter } from './routes';
import './style.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><HashRouter><App/></HashRouter></React.StrictMode>);
