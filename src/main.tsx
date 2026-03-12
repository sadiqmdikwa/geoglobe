import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// 1. Change the import to HashRouter
import { HashRouter } from 'react-router-dom'; 
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('content')!).render(
  <StrictMode>
    {/* 2. Change the tag to HashRouter (we don't even need the basename anymore!) */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
