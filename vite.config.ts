import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': '/src' } },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['auth.mmhs.app'],
  },
  preview: {
    host: true,
    port: 3000,
    allowedHosts: ['auth.mmhs.app'],
  },
});
