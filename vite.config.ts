import path from 'path';
import {defineConfig} from 'vite';
import {liveTokenPlugin} from './src/vite/live-token';
import {previewGatePlugin} from './src/vite/preview-gate';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  plugins: [previewGatePlugin(), liveTokenPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
