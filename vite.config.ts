import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.GITHUB_ACTIONS === 'true' ? "/Portfolio/" : "/",
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // React core must be isolated — other UI libs depend on it
              if (id.includes('react-dom') || id.includes('react-router-dom') || id.match(/\/react\//)) {
                return 'vendor'
              }
              if (id.includes('@supabase')) {
                return 'supabase'
              }
              // Everything else (framer-motion, lucide, etc.) stays in the default chunk
              // to avoid circular dependencies between UI libs and React
            }
          }
        }
      }
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  }
})
