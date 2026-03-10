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
      chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kB
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor'; // React and routing
              }
              if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('tailwind-merge') || id.includes('clsx')) {
                return 'ui'; // UI and animation libraries
              }
              if (id.includes('@supabase')) {
                return 'supabase'; // Database
              }
              return 'dependencies'; // Other dependencies
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
