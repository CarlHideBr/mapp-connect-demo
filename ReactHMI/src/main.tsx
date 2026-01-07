import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App';

const rootEl = document.getElementById('root')!;
Object.assign(document.documentElement.style, { height: '100%' });
Object.assign(document.body.style, { height: '100%', margin: '0', background: '#0b0d13' });
Object.assign(rootEl.style, { height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' });

const root = createRoot(rootEl);
root.render(<React.StrictMode><App /></React.StrictMode>);
