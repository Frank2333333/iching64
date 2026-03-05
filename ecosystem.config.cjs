module.exports = {
  apps: [
    {
      name: 'iching64',           // 服务名称
      script: 'npx',              // 执行的命令
      args: 'vite preview --host', // 参数
      cwd: __dirname,  // 自动使用当前目录
      
      // 自动重启配置
      autorestart: true,          // 崩溃/退出时自动重启
      max_restarts: 10,           // 短时间内最多重启次数
      min_uptime: '10s',          // 运行10秒才算成功启动
      
      // 内存限制
      max_memory_restart: '500M', // 内存超500M自动重启
      
      // 日志
      log_file: './logs/app.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      
      // 环境变量
      env: {
        NODE_ENV: 'production'
      },
      
      // 开机自启（需要额外配置）
      // Windows 下执行: pm2 startup windows
    }
  ]
};
