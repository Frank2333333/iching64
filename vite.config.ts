import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// 访问计数器插件（仅开发环境使用）
function visitCounterPlugin(): Plugin {
  let visitCount = 0;
  return {
    name: 'visit-counter',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/' || req.url === '/index.html' || req.url?.startsWith('/?')) {
          visitCount++;
          console.log(`[${new Date().toLocaleString('zh-CN')}] 访问次数: ${visitCount}`);
        }
        next();
      });

      server.middlewares.use('/api/visit-count', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ count: visitCount }));
      });
    }
  };
}

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: '/',

  plugins: [
    react(),
    ...(isProduction ? [] : [inspectAttr()]),
    ...(isProduction ? [] : [visitCounterPlugin()])
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
    allowedHosts: ['.iching64.fun', 'localhost', '127.0.0.1']
  },  // ← 确保这里有逗号！！！

  preview: {
    host: '0.0.0.0',
    port: 4173,
    cors: true
  }
});