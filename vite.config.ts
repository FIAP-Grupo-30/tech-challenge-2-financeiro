import federation from '@originjs/vite-plugin-federation';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: '@bytebank/financeiro',
      filename: 'remoteEntry.js',
      exposes: {
        './bytebank-financeiro': './src/exposes/bytebank-financeiro.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 9002,
  },
  preview: {
    port: 9002,
  },
});
