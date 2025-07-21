import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { RefreshProvider } from './context/RefreshContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RefreshProvider>
    <App />
  </RefreshProvider>
);
