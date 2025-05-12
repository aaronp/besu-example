import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/backup': 'http://localhost:3001',
      '/manual': 'http://localhost:3001',
      '/send-transaction': 'http://localhost:3001',
    },
  },
})
