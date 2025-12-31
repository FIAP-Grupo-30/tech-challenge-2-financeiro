import React from 'react';
import * as ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';
import './globals.css';

console.log('🟢 @bytebank/financeiro - Módulo carregado com sucesso!');

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err: Error) {
    console.error('❌ @bytebank/financeiro error:', err);
    return <div className="text-red-500 p-4">Erro no módulo financeiro</div>;
  },
});

console.log('🟢 @bytebank/financeiro - Lifecycles configurados');

export const { bootstrap, mount, unmount } = lifecycles;
