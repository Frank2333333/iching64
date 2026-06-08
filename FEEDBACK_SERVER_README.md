# 反馈系统使用说明

## 概述

反馈系统现在使用服务器端存储，所有反馈数据都会保存在运行服务器的电脑上，而不是用户浏览器本地。

## 启动方式

### 方式一：同时启动服务器和前端（推荐开发使用）

```bash
npm install  # 首次使用需要安装依赖
npm run dev  # 同时启动API服务器和前端开发服务器
```

这会启动：
- API服务器: http://localhost:3001
- 前端开发服务器: http://localhost:5173

### 方式二：单独启动

```bash
# 终端1 - 启动API服务器
npm run server

# 终端2 - 启动前端开发服务器
npm run dev:client
```

### 方式三：生产环境部署

构建前端：
```bash
npm run build
```

启动API服务器：
```bash
npm run server
# 或
node server/api.js
```

生产环境可以通过环境变量配置API端口：
```bash
FEEDBACK_PORT=3001 node server/api.js
```

## 数据存储

反馈数据存储在：`data/feedback.json`

每次提交反馈时，数据会自动追加到此文件。

## API接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/feedback | 获取所有反馈 |
| POST | /api/feedback | 提交新反馈 |
| DELETE | /api/feedback | 清空所有反馈 |
| DELETE | /api/feedback/:id | 删除单条反馈 |
| GET | /api/health | 健康检查 |

## 管理后台

访问：`http://localhost:5173/#/admin/feedback`

默认密码：`iching64-admin`

可以在 `.env` 文件中设置自定义密码：
```
VITE_ADMIN_PASSWORD=your-password
```

## 功能特点

1. **服务器端存储** - 所有反馈保存在服务器，可从任何设备查看
2. **离线兼容** - 如果服务器暂时不可用，反馈会暂存本地，稍后自动同步
3. **刷新功能** - 管理后台支持手动刷新获取最新反馈
4. **单条删除** - 支持删除单条反馈，不只是清空全部
5. **导出功能** - 支持导出JSON格式备份

## 注意事项

1. 确保服务器有写入 `data/` 目录的权限
2. 定期备份 `data/feedback.json` 文件
3. 生产环境建议配置防火墙，限制3001端口访问
