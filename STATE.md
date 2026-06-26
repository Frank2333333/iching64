## 当前目标
将"档案存储 + 登录"从八字页扩展到全平台：用户输入一次生辰，八字/紫微等所有生辰类功能复用同一档案；未登录可本地存档案，登录后同步云端。

## 当前步骤（STEP列表）
1. [x] 后端：migrations/0002_profiles.sql（通用 profiles 表 + 从 bazi_profiles 迁移）
2. [x] 后端：functions/api/[[route]].ts 新增 GET/POST/DELETE /api/profiles 路由
3. [x] 前端：AuthContext（useAuth 改造为 Context，token key bazi_token→iching_token 迁移）
4. [x] 前端：ProfileContext（本地+云端合并、currentProfile、save/delete/uploadLocalToCloud）
5. [x] 前端：main.tsx 注入 AuthProvider > ProfileProvider > App
6. [x] 前端：GlobalUserMenu（登录+档案切换器+上传本地+删除）嵌入 MainHeaderTabs
7. [x] 前端：BaziDivination/BaziForm 接入 ProfileContext（预填+保存，移除页面内登录UI/档案列表）
8. [x] 前端：ZiweiDivination/ZiweiForm 接入 ProfileContext（initialData+保存，仅 birthdate 档案）
9. [x] 本地+云端同步逻辑（uploadLocalToCloud 失败保留本地）
10. [x] 构建验证：npm run build 通过、tsc -b 通过

## 当前进展
- 后端：profiles 表 + /api/profiles 路由完成，本地迁移已应用
- 前端：全局 AuthContext/ProfileContext + 导航栏 GlobalUserMenu + 八字/紫微页接入完成
- 构建：npm run build 通过；tsc -b 通过
- lint：47 error 均为预存问题（setState-in-effect / prefer-const / 未使用变量 / D1 any 等），本次未引入新 error

## 关键决策
- 通用人物档案（生辰为核心），八字+紫微共用 profiles 表；旧 bazi_profiles 迁移后保留作备份
- 全局导航栏入口（GlobalUserMenu 嵌入 MainHeaderTabs），AuthProvider > ProfileProvider 全局共享
- 支持本地档案：未登录存 localStorage(iching_local_profiles)，登录后 uploadLocalToCloud 同步云端
- pillars 档案（直接八字）仅八字可用，紫微不可选（技术限制：四柱无法反推紫微盘）
- token key 从 bazi_token 迁移到 iching_token（初始化时自动迁移老 key）

## 验证状态
- ✅ TypeScript 编译通过
- ✅ Vite 生产构建通过
- ✅ 本地 D1 迁移 0002 应用成功，profiles 表结构正确（14 列）
- ⏳ 需手动测试：未登录本地存档 / 登录云端同步 / 八字紫微跨功能复用 / 旧档案迁移

## 下一步（手动测试清单）
1. 未登录：导航栏档案切换器新增/选择/删除本地档案
2. 八字页选档案自动填生辰；紫微页选 birthdate 档案自动填
3. 登录：云端档案拉取，本地档案"上传到云端"
4. 退出登录：本地档案保留，云端不可见
5. 直接八字保存为 pillars 档案（仅八字可选）
6. 部署前：npm run db:migrate（远程）应用 0002 迁移到生产 D1
