import React from 'react';
import * as ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';
import './globals.css';
import { createDomGetter } from '@bytebank/shared';

console.log('🟢 @bytebank/financeiro - Módulo carregado com sucesso!');

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  // Mount the financeiro app inside the base app's main area so it appears between header and footer
  domElementGetter: createDomGetter('@bytebank/financeiro', 'mfe-financeiro-container'),
  errorBoundary(err: Error) {
    console.error('❌ @bytebank/financeiro error:', err);
    return <div className="text-red-500 p-4">Erro no módulo financeiro</div>;
  },
});

console.log('🟢 @bytebank/financeiro - Lifecycles configurados');

export const { bootstrap, mount, unmount } = lifecycles;
