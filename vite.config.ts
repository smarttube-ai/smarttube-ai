import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['framer-motion'],
    exclude: ['lucide-react']
  },
  define: {
    'process.env': {},
    'process': {
      env: {},
      stdout: { isTTY: false },
      stderr: { isTTY: false }
    }
  },
});