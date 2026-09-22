import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    // Point the workspace packages at their source, so their raw JSX goes
    // through the React transform instead of being treated as a
    // pre-built dependency.
    alias: {
      '@addiscard/ui': fileURLToPath(new URL('./packages/ui/src', import.meta.url)),
      '@addiscard/services': fileURLToPath(new URL('./packages/services/src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
