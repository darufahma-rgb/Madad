import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'data-maddah':     ['./src/maddah-data.jsx'],
          'data-mahad':      ['./src/mahad-data.jsx'],
          'data-muqaranah':  ['./src/muqaranah-data.jsx'],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  publicDir: 'public',
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: 'all',
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
