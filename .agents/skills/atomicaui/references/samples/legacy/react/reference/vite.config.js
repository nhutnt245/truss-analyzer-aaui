import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const starter = path.resolve(import.meta.dirname, '../../../../..');

// `npm run sample:reference` serves this folder. `@` is the starter's own src/, so the converted screen finds the kit's parts as it does in an app; the starter's public/ (its fonts) serves it too.
export default defineConfig({
  plugins: [react()],
  publicDir: path.join(starter, 'public'),
  resolve: { alias: { '@': path.join(starter, 'src') } },
});
