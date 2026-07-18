import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Browser refreshes on SPA routes like /tickets or /admin/users send Accept: text/html.
 * Without this bypass, Vite would proxy those navigations to the API, which returns 401 JSON.
 */
function spaHtmlBypass(req) {
  const accept = req.headers.accept || '';
  if (accept.includes('text/html')) {
    return '/index.html';
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/tickets': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        bypass: spaHtmlBypass,
      },
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        bypass: spaHtmlBypass,
      },
      '/dashboard': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        bypass: spaHtmlBypass,
      },
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
