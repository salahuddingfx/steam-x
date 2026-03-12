import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Local development - PWA needs HTTPS or localhost
    https: false, // Keep false for localhost development
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
