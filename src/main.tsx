import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './globals.css';

console.log('🟢 @bytebank/financeiro - Iniciando em modo standalone');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
