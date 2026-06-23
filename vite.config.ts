import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: '/',

  plugins: [
    react(),
    ...(isProduction ? [] : [inspectAttr()]),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: ['.iching64.fun', 'localhost', '127.0.0.1'],
  },
});
