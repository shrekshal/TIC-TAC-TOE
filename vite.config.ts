import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Netlify will use this for deployment
  },
  server: {
    port: 5173, // local dev server port
    open: true, // auto-open browser when running `npm run dev`
  },
})
