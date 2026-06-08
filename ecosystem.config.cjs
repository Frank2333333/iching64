module.exports = {
  apps: [
    {
      name: 'iching64-frontend',    // 前端服务
      script: 'npx',
      args: 'vite preview --host',
      cwd: __dirname,

      // 自动重启配置
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // 内存限制
      max_memory_restart: '500M',

      // 日志
      log_file: './logs/frontend.log',
      out_file: './logs/frontend-out.log',
      error_file: './logs/frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // 环境变量
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'iching64-backend',     // 后端 API 服务
      script: 'node',
      args: 'server/api.cjs',
      cwd: __dirname,

      // 自动重启配置
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // 内存限制
      max_memory_restart: '300M',

      // 日志
      log_file: './logs/backend.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // 环境变量
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
