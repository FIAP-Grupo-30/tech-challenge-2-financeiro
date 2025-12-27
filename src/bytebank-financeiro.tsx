import React from 'react';
import * as ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';
import './globals.css';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err: Error) {
    console.error('@bytebank/financeiro error:', err);
    return <div className="text-red-500 p-4">Erro no módulo financeiro</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
