import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-legacy-dashboard',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          const urlPath = url.split('?')[0];

          let filePath = '';
          if (urlPath === '/app' || urlPath === '/app/') {
            filePath = path.resolve(__dirname, './app/index.html');
          } else if (urlPath.startsWith('/app/')) {
            const relativePath = urlPath.substring(5); // remove '/app/'
            filePath = path.resolve(__dirname, './app', relativePath);
          }

          if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const contentTypes: Record<string, string> = {
              '.html': 'text/html',
              '.js': 'application/javascript',
              '.css': 'text/css',
              '.svg': 'image/svg+xml',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif',
              '.json': 'application/json',
              '.woff': 'font/woff',
              '.woff2': 'font/woff2',
              '.ttf': 'font/ttf',
            };
            res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
            res.writeHead(200);
            res.end(fs.readFileSync(filePath));
            return;
          }

          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './components'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/v1/, '/api/v1'),
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom')) {
              return 'vendor-router';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react') || id.includes('sonner') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'vendor-ui';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
