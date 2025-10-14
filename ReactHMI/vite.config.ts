import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    proxy: {
  '/api/1.0': {
    target: 'http://localhost:80',
        changeOrigin: true,
        ws: true,
        secure: false
      },
      '/api/mock': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  resolve: {}
});
