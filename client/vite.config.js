import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor chunks
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (
            id.includes('node_modules/@radix-ui/react-dialog') ||
            id.includes('node_modules/@radix-ui/react-dropdown-menu') ||
            id.includes('node_modules/@radix-ui/react-tooltip')
          ) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform/resolvers') || id.includes('node_modules/zod')) {
            return 'vendor-forms';
          }
          if (id.includes('node_modules/zustand') || id.includes('node_modules/@tanstack/react-query')) {
            return 'vendor-state';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-animations';
          }
        },
      },
    },
    // Use esbuild minifier (default, built-in, no extra dependencies)
    minify: 'esbuild',
    // Optimize CSS
    cssCodeSplit: true,
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Set chunk size warning
    chunkSizeWarningLimit: 600,
    // Report compressed size
    reportCompressedSize: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@tanstack/react-query',
      'framer-motion',
      'date-fns',
    ],
  },
}));
