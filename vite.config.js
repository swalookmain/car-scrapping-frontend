import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    // 3000 is often taken by WSL/other services on Windows — ERP dev server uses 3002
    port: 3002,
    strictPort: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**', 'src/main.jsx'],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@mui/system'],
          'vendor-charts': ['apexcharts', 'react-apexcharts'],
          'vendor-router': ['react-router-dom'],
          'vendor-core': ['react', 'react-dom'],
        },
      },
    },
  },
})
