## 当前目标
实现邮箱验证码登录 + 八字档案保存功能

## 当前步骤（STEP列表）
1. [x] 安装后端依赖（jsonwebtoken, resend）
2. [x] 后端：新建 auth-store.cjs
3. [x] 后端：新建 bazi-profile-store.cjs
4. [x] 后端：修改 api.cjs（JWT 中间件 + 5 个 API 路由）
5. [x] 环境变量：修改 .env.example + vite.config.ts 代理
6. [x] 前端：新建 auth-api.ts
7. [x] 前端：新建 bazi-profile-api.ts
8. [x] 前端：新建 useAuth.ts
9. [x] 前端：新建 LoginDialog.tsx
10. [x] 前端：修改 BaziDivination.tsx（集成登录态 + 保存按钮 + 档案列表）
11. [x] 前端：修改 BaziForm.tsx（支持 initialData + 档案载入）
12. [x] TypeScript 编译检查 + 构建验证
13. [x] 日志输出完善

## 当前进展
- 后端全部完成：auth-store + bazi-profile-store + api.cjs 新路由 + JWT 中间件
- 前端全部完成：API 模块 + useAuth + LoginDialog + BaziDivination 集成 + BaziForm 修改
- 构建验证：npm run build 通过
- TypeScript 检查：tsc --noEmit 通过

## 关键决策
- 采用邮箱验证码（无密码）登录，Resend 发邮件，JWT 认证（7天有效期）
- 数据存储沿用 JSON 文件模式，与 feedback-store.cjs 保持一致
- 开发环境未配置 Resend 时，验证码直接打印到控制台

## 验证状态
- ✅ TypeScript 编译通过
- ✅ Vite 生产构建通过
- ⏳ 需要手动运行 `npm run dev` 测试完整的登录/保存/载入流程

## 部署前需配置
1. 复制 `.env.example` 新增项到 `.env`：
   - `RESEND_API_KEY=your-resend-api-key`
   - `JWT_SECRET=your-random-secret-at-least-32-chars`
2. 服务器 `data/` 目录需要持久化挂载
3. 生产环境建议更换 `RESEND_API_KEY` 使用自定义域名，提高邮件送达率

## 下一步
功能已全部实现。请运行 `npm run dev` 进行手动测试，验证：
1. 登录弹窗 → 输入邮箱 → 开发环境控制台查看验证码
2. 输入验证码 → 登录成功 → Header 显示用户邮箱
3. 输入八字排盘 → 结果页点击"保存此八字" → 命名保存
4. 返回输入页 → 看到"我的档案"列表 → 点击档案自动填充表单
5. 测试退出登录和删除档案功能
