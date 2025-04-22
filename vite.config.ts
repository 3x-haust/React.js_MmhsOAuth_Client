import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  let config;

  if (mode === 'development') {
    config = {
      plugins: [react()],
      server: {
        https: {
          key: fs.readFileSync('./localhost-key.pem'),
          cert: fs.readFileSync('./localhost.pem'),
        },
        host: 'localhost',
        port: 5173
      },
    };
  } else {
    config = {
      plugins: [react()],
      server: {
        host: 'localhost',
        port: 5173
      },
    };
  }

  return config;
});
