import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: 'src/bytebank-financeiro.tsx',
      output: {
        format: 'system',
        entryFileNames: 'bytebank-financeiro.js',
      },
      external: ['react', 'react-dom', 'single-spa'],
      preserveEntrySignatures: 'strict',
    },
    outDir: 'dist',
    lib: {
      entry: 'src/bytebank-financeiro.tsx',
      name: 'bytebank-financeiro',
      formats: ['system'],
      fileName: () => 'bytebank-financeiro.js',
    },
  },
  server: {
    port: 9002,
    cors: true,
  },
  preview: {
    port: 9002,
    cors: true,
  },
});
