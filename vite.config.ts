import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/TileMaster/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('dockview-react')) return 'vendor-dockview'
          if (id.includes('zustand')) return 'vendor-state'
          if (id.includes('lucide-react')) return 'vendor-icons'
          return undefined
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
