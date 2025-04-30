import fs from 'fs';
import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const isDevCommand = process.env.npm_lifecycle_event === 'dev';

  const commonConfig = {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };

  if (isDevCommand) {
    return {
      ...commonConfig,
      server: {
        https: {
          key: fs.readFileSync('./localhost-key.pem'),
          cert: fs.readFileSync('./localhost.pem'),
        },
        host: 'localhost',
        port: 5173,
      },
    };
  } else {
    return {
      ...commonConfig,
      server: {
        host: 'localhost',
        port: 5173,
        allowedHosts: ['auth.mmhs.app'],
      },
    };
  }
});
