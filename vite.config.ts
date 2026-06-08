import fs from "fs"
import path from "path"
import react from "@vitejs/plugin-react"
import { createLogger, defineConfig, type Logger, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

function ensureLogDir(): string {
  const logDir = path.resolve(__dirname, "logs")
  fs.mkdirSync(logDir, { recursive: true })
  return logDir
}

function appendVisitCountLog(message: string): void {
  const logDir = ensureLogDir()
  const date = new Date().toISOString().slice(0, 10)
  const dailyPath = path.join(logDir, `visit-count-${date}.log`)
  const latestPath = path.join(logDir, "visit-count.latest.log")
  const line = `[${new Date().toISOString()}] ${message}\n`

  fs.appendFileSync(dailyPath, line)
  fs.writeFileSync(latestPath, line, { flag: "a" })
}

function createPersistentViteLogger(): Logger {
  const baseLogger = createLogger()
  const logDir = ensureLogDir()
  const date = new Date().toISOString().slice(0, 10)
  const dailyPath = path.join(logDir, `vite-${date}.log`)
  const latestPath = path.join(logDir, "vite.latest.log")

  fs.writeFileSync(latestPath, "")

  const write = (level: string, message: string) => {
    const line = `[${new Date().toISOString()}] [${level}] ${message}\n`
    fs.appendFileSync(dailyPath, line)
    fs.appendFileSync(latestPath, line)
  }

  const forward = (level: string, original: Logger['info']): Logger['info'] => {
    return (msg, options) => {
      write(level.toUpperCase(), msg)
      const maybeError = options && 'error' in options ? options.error : undefined
      if (maybeError instanceof Error) {
        write(level.toUpperCase(), maybeError.stack || maybeError.message)
      }
      original(msg, options)
    }
  }

  return {
    ...baseLogger,
    info: forward('info', baseLogger.info),
    warn: forward('warn', baseLogger.warn),
    warnOnce: forward('warn', baseLogger.warnOnce),
    error: forward('error', baseLogger.error),
    clearScreen(type) {
      write('INFO', `clearScreen:${type}`)
      baseLogger.clearScreen(type)
    },
  }
}

// 访问计数器插件（开发和预览环境使用）
function visitCounterPlugin(): Plugin {
  let visitCount = 0;
  
  // 计数中间件
  const countMiddleware = (req: any, _res: any, next: any) => {
    if (req.url === '/' || req.url === '/index.html' || req.url?.startsWith('/?')) {
      visitCount++;
      const message = `[${new Date().toLocaleString('zh-CN')}] 访问次数: ${visitCount}`;
      console.log(message);
      appendVisitCountLog(message);
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
  customLogger: createPersistentViteLogger(),

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
      '/api/divination': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },  // ← 确保这里有逗号！！！

  preview: {
    host: '0.0.0.0',
    port: 4173,
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
      '/api/divination': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  }
});
