# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

IChing64 — 易经六十四卦学习平台，部署于 https://www.iching64.fun/。

技术栈：React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Router（HashRouter）。
状态管理仅用 React Hooks，无 Redux。

## 常用命令

```bash
# 开发（同时启动 Vite 前端 5173 + Express 后端 3001）
npm run dev

# 仅启动后端（Express on 3001）
npm run server

# 仅启动 Vite 前端	npm run dev:client

# 构建
npm run build

# 测试
npx vitest run              # 单次运行
npx vitest run <filter>     # 运行匹配文件
npx vitest                  # watch 模式

# 代码检查
npm run lint

# 预览生产构建
npm run preview
```

## 架构

### 前端（HashRouter）

路由定义见 `src/App.tsx`（**lazy import** 代码分割）：
- `/` → `QuestionDivination`（问事解卦，默认页）
- `/hexagrams` → `GuaList`（六十四卦浏览）
- `/divination` → `Divination`（数字起卦）
- `/transformer` → `GuaTransformer`（变卦推演）
- `/bazi` → `BaziDivination`（八字排盘）
- `/admin/feedback` → `FeedbackAdmin`（反馈管理后台）

导航栏组件在 `src/components/MainHeaderTabs.tsx`。

64卦数据为**单文件 JSON-like TS 导出**（`src/data/guaxiang.ts`），定义了 `Gua` / `Yao` 接口，包含卦辞、爻辞、卦变关系等全部字段。本项目无数据库；所有卦象数据在编译时打包。

### 后端 Express（server/api.cjs）

开发时监听 `localhost:3001`，通过 Vite `proxy` 转发 `/api/*`。

API 分组：
- `/api/feedback` — 反馈 CRUD，JSON 文件持久化（`data/feedback.json`）
- `/api/divination/ai` + `/api/divination/chat` — AI 解卦与追问对话
- `/api/bazi/ai` + `/api/bazi/chat` — 八字排盘 AI 解读与对话
- `/api/health` — 服务健康检查

AI 服务通过 OpenAI SDK 调用，模型和密钥从 `.env` 读取。未配置 OPENAI_API_KEY 时接口返回 HTTP 503。

### 梅花易数核心逻辑

起卦计算散见于 `src/lib/meihua-divination.ts`，核心约定：
- 体卦 = 无动爻的卦（代表求测者），用卦 = 有动爻的卦（代表所问之事）
- 动爻位置（上卦 1-3 / 下卦 4-6）决定体用归属
- 生克关系基于八卦五行（金/木/水/火/土），由体用五行推导
- 互卦（过程）、变卦（结果）通过上/下卦组合变换得出

### AI 对话约束

`server/divination-ai.cjs` 实现了严格的对话控制逻辑：
- **场景锁定**：事业/感情/健康/财运/学业/出行/官司/寻物，AI 回答不得擅自切换场景
- **追问意图分类**：根据用户消息正则匹配分为 timing(时间)/advice(建议)/outcome(结果)/judgment(判断)，每种意图有固定的回答模板
- **追问轨迹追踪**：最近 3 条用户追问注入上下文，避免 AI 自相矛盾

### Vite 配置要点

`vite.config.ts` 中定义了自定义 Vite 插件（访问计数器 + 持久化日志写入 `logs/`），开发配置超过默认复杂程度。

**关键规则**：新增任何 `/api/*` 后端路由，必须**同时在** `server.proxy` 和 `preview.proxy` 两段代理配置中添加对应条目（已有 `/api/feedback`、`/api/health`、`/api/divination`、`/api/bazi`）。历史上曾因漏配 `/api/bazi` 导致开发环境前端收到空 HTML 响应。

### 样式主题

双主题系统：
- **浅色**：琥珀暖色（amber），衬线字体，祥云背景
- **深色**：墨黑背景 + 金色（#d4af37）强调，无阴影光晕

大量使用 Tailwind 的 `shadow-[...]` 和 `bg-gradient` 实现传统风格。全局样式和动画定义在 `src/index.css`。

shadcn/ui 组件位于 `components/ui/`，依赖 `class-variance-authority` + `tailwind-merge`（通过 `src/lib/utils.ts` 的 `cn()` 合并类名）。

## 环境变量

复制 `.env.example` 为 `.env`，必填项：
- `OPENAI_API_KEY` — AI 解卦/八字功能的后端依赖
- `VITE_ADMIN_PASSWORD` — 反馈管理后台密码
- `VITE_FEEDBACK_API_URL` — 开发环境用 `/api`

## 注意事项

- `server/skills/xuan/` 是一个**Git 子模块**（内嵌仓库），存储八字排盘的参考资料（SKILL.md + references）。克隆后可能需要 `git submodule update --init`。
- Windows 开发环境：部分源文件为 LF 换行，Git `core.autocrlf` 可能导致 `git add` 时出现 LF→CRLF warning，不影响运行但需注意 `Edit` 工具逐字节匹配的问题。
- 前端 `# HashRouter` 意味着所有路由以 `/#/` 开头部署为静态站点，无需服务端路由配置。

# IChing64 项目 Claude 工作记录

## Edit 工具频繁失败的根因与对策

### 问题现象
在修改 `vite.config.ts`、`server/api.cjs`、`src/components/bazi/BaziForm.tsx` 等文件时，多次出现 `Edit failed` 或 `String to replace not found`。部分失败后又重复出现空参数调用 `Edit: {}` 的错误。

### 根因分析

1. **Windows 换行符（CRLF）漂移**
   - 项目仓库中部分文件为 LF 换行，但 Windows Git 配置 `core.autocrlf=true` 会在签出时自动替换为 CRLF。
   - `Edit` 要求 `old_string` 与文件内容 **逐字节一致**，CRLF vs LF 的差异会导致匹配失败。
   - 证据：`git add` 时多次出现 `warning: in the working copy of 'xxx', LF will be replaced by CRLF the next time Git touches it`。

2. **未重新 Read 就重复 Edit**
   - 第一次 Edit 失败后，文件内容可能已部分变更（或未变更），但后续重试仍基于**过期记忆**中的 old_string。
   - 在 `server/api.cjs` 案例中：第一次读取时验证逻辑已被修改为 `(!baziInput.year && !baziInput.pillars)`，但后续仍按旧逻辑 `!baziInput.year` 构造 old_string，导致再次失败。

3. **Read 输出的行号前缀干扰**
   - `Read` 工具返回 `cat -n` 格式（每行 `  1\t内容`），直接复制到 Edit 的 `old_string` 时必须**手动去掉行号和前导 tab**，否则必然不匹配。

4. **空参数误调用**
   - 在工具链偶发异常时，出现了 `Edit: {}` 的无效调用，导致 `InputValidationError`。
   - 这属于工具调用层问题，但可通过“先确认参数再调用”避免。

### 解决对策（强制遵循）

1. **Edit 前必须重新 Read**
   - 规则：只要距离上一次 `Read` 超过 **1 分钟**、或上一次 `Edit` 失败、或有任何其他文件操作发生，**必须重新 Read** 目标文件再构造 `old_string`。
   - 不要在对话上下文中依赖旧的 Read 结果作为 Edit 的输入。

2. **使用 Grep 精确定位**
   - 在 Edit 前先 `Grep` 查找需要替换的关键字，确认行号、上下文和空格/缩进。
   - 这比直接 `Read` 整文件更高效，也更容易构造精确的 `old_string`。

3. **处理 CRLF 换行符**
   - 在 Windows 环境执行 `Edit` 时，如果反复出现匹配失败，优先用 `PowerShell` 的 `Get-Content` 或 `Bash` 的 `cat -A` 检查文件实际换行符。
   - 若确认是 CRLF 导致，可一次性用 PowerShell 批量转换：
     ```powershell
     Get-Content file.ts -Raw | Set-Content file.ts -NoNewline; Add-Content file.ts -Value "" -Encoding UTF8
     ```
     或更简单地：在 VS Code 右下角切换 `CRLF` → `LF` 后保存。

4. **old_string 的构造原则**
   - 只复制**确切相邻的几行**（3~10 行），不要复制大块内容。
   - 必须包含**前后上下文**（至少各 1 行），确保唯一性。
   - 通过 `Read` 的输出去掉行号前缀后原样复制，不要手动改动空格或换行。

5. **失败后的恢复流程**
   - 若 `Edit` 返回 `String to replace not found`，**禁止立即重试**。
   - 必须执行：
     ```
     1. Grep 或 Read 确认文件当前内容
     2. 对比 old_string 与实际内容的差异
     3. 修正 old_string 后再次 Edit
     ```

### 经验
- 在 Windows 上，大文件用 `Read` 的 `limit`/`offset` 分段读取；小段文件可直接读。
- 当 `server/api.cjs` 这种 .cjs 文件被修改时，注意 LF/CRLF 混合问题，必要时用 `dos2unix` 处理。

---