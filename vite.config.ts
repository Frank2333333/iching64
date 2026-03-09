import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// 访问计数器插件（开发和预览环境使用）
function visitCounterPlugin(): Plugin {
  let visitCount = 0;
  
  // 计数中间件
  const countMiddleware = (req: any, _res: any, next: any) => {
    if (req.url === '/' || req.url === '/index.html' || req.url?.startsWith('/?')) {
      visitCount++;
      console.log(`[${new Date().toLocaleString('zh-CN')}] 访问次数: ${visitCount}`);
    }
    next();
  };
  
  // API 中间件
  const apiMiddleware = (req: any, res: any, next: any) => {
    if (req.url === '/api/visit-count') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ count: visitCount }));
      return;
    }
    next();
  };
  
  return {
    name: 'visit-counter',
    configureServer(server) {
      server.middlewares.use(countMiddleware);
      server.middlewares.use(apiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(countMiddleware);
      server.middlewares.use(apiMiddleware);
    }
  };
}

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: '/',

  plugins: [
    react(),
    ...(isProduction ? [] : [inspectAttr()]),
    visitCounterPlugin()  // 计数器在 dev 和 preview 都启用
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
    proxy: {
      '/api/feedback': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },  // ← 确保这里有逗号！！！

  preview: {
    host: '0.0.0.0',
    port: 4173,
    cors: true,
    allowedHosts: ['.iching64.fun', 'localhost', '127.0.0.1']
  }
});