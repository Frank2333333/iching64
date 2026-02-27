import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// 访问计数器插件
function visitCounterPlugin(): Plugin {
  let visitCount = 0;
  
  return {
    name: 'visit-counter',
    configureServer(server) {
      // 添加中间件来跟踪页面访问
      server.middlewares.use((req, res, next) => {
        // 只跟踪 HTML 页面访问（不是静态资源）
        if (req.url === '/' || req.url === '/index.html' || req.url.startsWith('/?')) {
          visitCount++;
          const timestamp = new Date().toLocaleString('zh-CN');
          console.log(`[${timestamp}] 页面被访问 - 当前访问人数: ${visitCount}`);
        }
        next();
      });
      
      // 添加 API 端点来获取访问计数
      server.middlewares.use('/api/visit-count', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ count: visitCount }));
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react(), visitCounterPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
