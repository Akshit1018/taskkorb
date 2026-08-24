import path from 'path';
import {defineConfig} from 'vite';
import {healthPlugin} from './src/vite/health';
import {liveTokenPlugin} from './src/vite/live-token';
import {previewGatePlugin} from './src/vite/preview-gate';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    headers: {
      'Permissions-Policy': 'microphone=(self), camera=(), geolocation=()',
    },
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    headers: {
      'Permissions-Policy': 'microphone=(self), camera=(), geolocation=()',
    },
  },
  plugins: [previewGatePlugin(), liveTokenPlugin(), healthPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
