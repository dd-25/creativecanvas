import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    rollupOptions: {
      // Completely disable native modules
      external: [
        '@rollup/rollup-linux-x64-gnu',
        '@rollup/rollup-darwin-x64',
        '@rollup/rollup-win32-x64-msvc',
        '@rollup/rollup-linux-x64-musl',
        '@rollup/rollup-linux-arm64-gnu'
      ]
    },
    // Use terser instead of esbuild for minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    // Force pre-bundling to avoid runtime issues
    include: ['react', 'react-dom', 'axios', 'react-hot-toast', 'react-icons']
  },
  server: {
    port: 3000,
    strictPort: false
  },
  preview: {
    port: 3000,
    strictPort: false
  }
})
