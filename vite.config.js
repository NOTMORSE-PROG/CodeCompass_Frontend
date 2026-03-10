import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@heroicons/react', 'react-hook-form', '@hookform/resolvers', 'clsx', 'tailwind-merge'],
          'vendor-data': ['axios', 'zustand', 'zod', 'date-fns'],
          'vendor-flow': ['@xyflow/react'],
          'vendor-charts': ['recharts'],
          'vendor-markdown': ['react-markdown', 'react-syntax-highlighter', 'remark-gfm'],
          'vendor-misc': ['react-hot-toast', '@react-oauth/google'],
        },
      },
    },
  },
  server: {
    port: 5173,
    // Required for Google Sign-In popup to communicate via postMessage
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },
    // Proxy API and WebSocket requests to Django backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
