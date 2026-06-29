# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

IChing64 — 易经六十四卦学习平台，部署于 https://iching64.fun/。

技术栈：React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Router（HashRouter）+ Cloudflare Pages/Workers。
状态管理仅用 React Hooks，无 Redux。

## 常用命令

```bash
# 仅启动 Vite 前端（纯前端调试，无后端 API）
npm run dev:client

# 旧版开发（Express 后端，已弃用）
npm run dev:legacy

# ⚠️ `npm run dev`（wrangler pages dev -- npx vite）在 wrangler 4.x 报错
#    "Cannot specify both a directory and a proxy command"，目前不可用。
#    需前后端联调时改用：wrangler pages dev ./dist -- npx vite 或降级 wrangler。

# 构建（先打包技能内容 → TypeScript 编译 → Vite 构建）
npm run build

# 构建后本地预览
npm run preview

# 部署到 Cloudflare Pages（direct upload 到 cloudflare 生产分支，不依赖 git push）
npm run deploy

# D1 数据库迁移
npm run db:migrate:local   # 本地
# ⚠️ `npm run db:migrate` 脚本默认操作【本地】（未带 --remote），与下方"远程"不符。
#    远程迁移必须显式：npx wrangler d1 migrations apply iching64-db --remote

# 密钥管理
npx wrangler pages secret put <KEY_NAME>        # 设置密钥
npx wrangler pages secret list                   # 查看密钥列表

# D1 数据查询
npx wrangler d1 execute iching64-db --remote --command "SELECT * FROM users"

# 测试
npx vitest run              # 单次运行
npx vitest run <filter>     # 运行匹配文件
npx vitest                  # watch 模式

# 代码检查
npm run lint
```

## 架构

### 前端（HashRouter）

路由定义见 `src/App.tsx`（**lazy import** 代码分割）：
- `/` → `LifeReport`（人生发展报告，双盘合参，核心入口/默认页）
- `/life-report` → `LifeReport`（同上，别名）
- `/question` → `QuestionDivination`（问事解卦）
- `/hexagrams` → `GuaList`（六十四卦浏览）
- `/transformer` → `GuaTransformer`（变卦推演）
- `/bazi` → `BaziDivination`（八字排盘）
- `/ziwei` → `ZiweiDivination`（紫微斗数）
- `/classics` → `ClassicsPage`（经典查阅）
- `/ziwei-knowledge` → `ZiweiKnowledge`（星曜图鉴）
- `/admin/feedback` → `FeedbackAdmin`（反馈管理后台）

> 旧的 `/divination` → `Divination`（数字起卦）页已移除（`src/pages/Divination.tsx` 及 `divinationValidation.*` 已删除），起卦入口改为 `/question`。

导航栏组件在 `src/components/MainHeaderTabs.tsx`。

64卦数据为**单文件 JSON-like TS 导出**（`src/data/guaxiang.ts`），定义了 `Gua` / `Yao` 接口，包含卦辞、爻辞、卦变关系等全部字段。所有卦象数据在编译时打包。

前端 API 调用使用原生 `fetch()`，基础路径为 `/api`（通过 `VITE_FEEDBACK_API_URL` 配置，默认 `/api`），Cloudflare Pages Functions 自动路由，无需代理配置。

### 后端（Cloudflare Pages Functions + Hono）

运行在 Cloudflare Workers 边缘运行时，入口为 `functions/api/[[route]].ts`（Hono catch-all 路由）。

**关键文件**：
- `functions/api/[[route]].ts` — 所有 API 路由定义，替代原 Express 应用
- `server-workers/utils/auth.ts` — JWT 认证（jose，Web Crypto API）
- `server-workers/utils/openai-client.ts` — OpenAI SDK 工厂函数
- `server-workers/utils/resend-client.ts` — Resend SDK 工厂函数
- `server-workers/services/divination-ai.ts` — AI 解卦服务（从 divination-ai.cjs 移植）
- `server-workers/services/bazi-ai.ts` — 八字 AI 服务（从 bazi-ai.cjs 移植）
- `server-workers/services/ziwei-ai.ts` — 紫微斗数 AI 服务
- `server-workers/services/skill-content.ts` — **构建时自动生成**，包含玄学技能内容常量

API 路由（与原 Express 完全对应，响应格式 `{ success, data?, error? }`）：
- `/api/feedback` — 反馈 CRUD，D1 数据库持久化
- `/api/divination/ai` + `/api/divination/chat` — AI 解卦与追问对话
- `/api/bazi/ai` + `/api/bazi/chat` — 八字排盘 AI 解读与对话
- `/api/ziwei/ai` + `/api/ziwei/chat` — 紫微斗数 AI 解读与对话
- `/api/classics/ai` — 经典文献 AI 解读
- `/api/life-report/overview` + `/api/life-report/section` + `/api/life-report/chat` — 人生发展报告（双盘合参，分章节流式生成）
- `/api/bazi/profiles` — 八字档案 CRUD（JWT 认证，D1 持久化，同名覆盖用 `INSERT OR REPLACE`）
- `/api/profiles` — 通用档案 CRUD（JWT 认证，D1 持久化，`profiles` 表，前端实际使用）
- `/api/life-history` — 人生报告历史会话（GET 列表 / POST upsert / DELETE，JWT 认证，D1 `life_history` 表，保留最近 10 条）
- `/api/auth/send-code` + `/api/auth/verify-code` + `/api/auth/me` — 邮箱验证码登录，验证码存 KV（TTL 600s），JWT 认证
- `/api/health` — 服务健康检查

### 数据存储

| 存储 | 用途 | 替代 |
|------|------|------|
| Cloudflare D1 | 用户、反馈、通用档案 profiles（结构化数据） | 原 data/*.json 文件 |
| Cloudflare KV | 验证码（带 TTL 自动过期） | 原内存 Map |
| 浏览器 localStorage | 未登录用户的本地档案 + 当前选中档案 + 登录 token | — |
| 构建时打包 | 玄学技能 SKILL.md + references/*.md | 原 fs.readFileSync 运行时读取 |

D1 表结构见 `migrations/0001_initial.sql`（users/feedback/bazi_profiles）、`migrations/0002_profiles.sql`（通用 profiles 表 + 从 bazi_profiles 迁移）、`migrations/0003_life_history.sql`（人生报告历史会话表 `life_history`，登录用户跨设备同步）。

### 通用档案系统（全平台共用）

八字/紫微等所有生辰类功能复用同一份"人物档案"，用户输入一次生辰全平台可用。

- **后端**：`profiles` 表（`migrations/0002_profiles.sql`）以生辰为核心，生辰字段独立列 + `pillars` JSON 列 + `UNIQUE(user_id,name)`；`/api/profiles`（GET/POST/DELETE，`authMiddleware` 保护）在 `functions/api/[[route]].ts`。旧 `bazi_profiles` 表与 `/api/bazi/profiles` 路由保留作备份/兼容，前端不再调用。
- **前端全局状态**：`src/context/AuthContext.tsx`（`AuthProvider`，登录态全局共享，token 存 `localStorage` 的 `iching_token`，初始化时从旧 `bazi_token` 迁移）+ `src/context/ProfileContext.tsx`（`ProfileProvider`，管理档案列表/当前选中档案/保存/删除/上传本地到云端）。`main.tsx` 注入 `AuthProvider > ProfileProvider > App`。`src/hooks/useAuth.ts` 已改为从 AuthContext 重新导出（向后兼容）。
- **本地+云端双层**：未登录档案存 `localStorage(iching_local_profiles)`，当前选中档案存 `iching_current_profile`；登录后 `uploadLocalToCloud` 逐个上传（按 name 去重，失败保留本地），云端档案存 D1。
- **全局入口**：`src/components/GlobalUserMenu.tsx`（登录按钮/邮箱菜单 + 档案切换器 + 上传本地 + 删除）嵌入 `MainHeaderTabs`，所有页面自动生效；`LoginDialog` 在此全局渲染。
- **档案数据结构**：`Profile`（`src/context/ProfileContext.tsx`）= `{id, name, inputMode:'birthdate'|'pillars', gender, year/month/day/hour/minute, birthplace, useSolarTime, pillars?, createdAt, source:'local'|'cloud'}`。`birthdate` 全平台可用；`pillars`（直接四柱）仅八字可用，紫微不可选（四柱无法反推紫微盘）。
- **页面接入**：`BaziDivination`/`ZiweiDivination` 从 `useProfile().currentProfile` 派生 `initialData` 预填表单（`useMemo`，切换档案自动回输入页）；保存走 `ProfileContext.saveProfile`（登录云端/未登录本地）。`BaziForm` 生辰模式与直接八字模式均可"保存为档案"；`ZiweiForm` 新增 `initialData`/`onSave` props。

### 玄学技能内容打包

`scripts/bundle-xuan-skill.ts` 在构建前运行，读取 `server/skills/xuan/` 下的 .md 文件，生成 `server-workers/services/skill-content.ts`（两个 export 常量：SKILL_CONTENT 和 REFERENCES_CONTENT）。截断规则与原 `loadSkillContent()` 一致。

### 梅花易数核心逻辑

起卦计算散见于 `src/lib/meihua-divination.ts`，核心约定：
- 体卦 = 无动爻的卦（代表求测者），用卦 = 有动爻的卦（代表所问之事）
- 动爻位置（上卦 1-3 / 下卦 4-6）决定体用归属
- 生克关系基于八卦五行（金/木/水/火/土），由体用五行推导
- 互卦（过程）、变卦（结果）通过上/下卦组合变换得出

### 八字排盘核心逻辑

本地排盘引擎 `src/lib/bazi-calculator.ts`，与梅花易数架构一致（先本地计算，再给 AI 解读）：

- **依赖**：`lunar-javascript`（阴历转换、日柱、节气时间）
- **常量表**：`src/data/bazi-constants.ts`（天干地支、纳音、藏干、五虎遁/五鼠遁、十神映射）
- **城市经纬度**：`src/data/cities.ts`（335 城市，用于真太阳时修正）
- **计算流程**：真太阳时修正 → 阴历转换 → 年柱(立春为界) → 月柱(节气为界) → 日柱(lunar-javascript) → 时柱(五鼠遁) → 纳音/藏干/十神 → 日主强弱(得令+得地+得势) → 格局(月支本气透出) → 用神喜忌 → 大运(8步) → 当前流年
- **数据结构**：`BaziChart` 接口包含四柱(Pillar)、日主信息、格局用神、大运(DaYun[])、流年(LiuNian)、真太阳时修正信息
- **UI 组件**：`BaziChartTable`（传统命盘表格）、`BaziSummaryCards`（日主+格局卡片）、`BaziDaYunTimeline`（大运时间轴）
- **AI 集成**：`BaziInput.chart` 字段将排盘数据传入后端，`bazi-ai.ts` 的 `buildChartPrompt` 直接用排盘数据构建 prompt，AI 无需自行排盘
- **type 声明**：`lunar-javascript` 无自带类型，使用 `src/types/lunar-javascript.d.ts`

### 紫微斗数核心逻辑

本地排盘引擎 `src/lib/ziwei-calculator.ts`，使用 iztro 库作为计算引擎（与 bazi 用 lunar-javascript 的模式一致）：

- **依赖**：`iztro`（核心排盘：14主星+辅星+煞星安位、命宫身宫、大限、四化、亮度）
- **常量表**：`src/data/ziwei-constants.ts`（星曜分类展示映射、四化颜色、宫位网格映射、hourToTimeIndex 转换、SI_HUA_TABLE 十天干四化表、PALACE_SVG_POS 三方四正 SVG 坐标、PALACE_ROLES 宫位领域映射）
- **星曜描述**：`src/data/ziwei-star-descriptions.ts`（14 主星五行/性质/关键词/倪海厦解读/事业感情财运健康分析，辅星简述，ALL_STAR_ENTRIES 知识库条目，getStarByName 查询函数）
- **夫妻宫断语**：`src/data/ziwei-heming.ts`（移植自开源 Renhuai123/ziwei-doushu，含 14 主星在夫妻宫五段式断语 STAR_IN_FUQI_GU、四化在夫妻宫 SIHUA_IN_FUQI_GU、合盘方法论 HEMING_METHODOLOGY、婚姻辅助表；供星曜详情面板与未来合盘功能使用）
- **格局检测**：`src/lib/ziwei-patterns.ts`（40 种格局检测器，含君臣庆会/紫府同宫/火贪格/杀破狼等，按级别 excellent/good/neutral/caution 分级；其中 13 种扩展格局移植自 Renhuai123/ziwei-doushu，如廉贞天相格/武曲七杀/日月同宫/石中隐玉/明珠出海/魁钺夹命/廉杀羊/巨火羊/铃昌陀武/机月同梁三星会/科权双会等）
- **城市经纬度**：复用 `src/data/cities.ts`（真太阳时修正）
- **计算流程**：真太阳时修正 → hour→timeIndex 转换 → `astro.bySolar()` → FunctionalAstrolabe → 转换为纯对象 ZiweiChart → 提取生年四化 → 后处理（三方四正索引、空宫/借宫、当前大限、DaXianInfo 列表）→ 计算运限数据(horoscopeData)
- **数据结构**：`ZiweiChart` 接口包含12宫(Palace[])、生年四化(SiHua)、五行局、命主/身主、真太阳时修正、currentAge、currentDaXianIndex、daXians(DaXianInfo[])、natalYearStemIndex、horoscopeData(HoroscopeData：含大限/流年旋转宫名、天干地支、四化星名、流耀星名)；每宫含主星/辅星/杂耀(Star[])、大限信息、oppositeIndex、sanFangIndices、isEmpty、borrowedFromIndex/borrowedStars、isCurrentDaXian
- **星曜分类**：iztro 的 8 种 type（major/soft/tough/adjective/flower/helper/lucun/tianma），四化直接用 star.mutagen
- **交互状态**：`ZiweiPalaceContext.tsx` 管理宫位选中、星曜选中、时间视图（本命/大限/流年）、叠加四化、运限宫名(scopePalaceNames)、运限流耀(scopeHoroscopeStars)、选中大限索引(selectedDaXianIndex)
- **UI 组件**：`ZiweiPalaceGrid`（4×4宫位网格+三方四正SVG叠加+交互选中+运限宫名旋转+流耀星显示+入场动画）、`ZiweiTimeNav`（本命/大限/流年切换+大限步进器+流年步进器+四化叠加+运限宫名/流耀传入Context）、`ZiweiSummaryCards`（命格总览+四化+大限运程+格局概览）、`ZiweiPatternsCard`（格局识别详情卡片）、`ZiweiStarDetailPanel`（星曜详情滑入面板+知识库链接）、`ZiweiPalaceAITrigger`（宫位点击自动触发 AI 分析，含运限上下文注入）、`ZiweiForm`（4步向导：日期→时间+时辰→性别→问题）
- **AI 集成**：`ZiweiInput.chart` 字段注入后端，`ziwei-ai.ts` 的 `buildChartPrompt` 格式化12宫+四化为文本 prompt；宫位/四化/话题快捷按钮均通过客户端构建 prompt + 现有 chat API 实现；大限/流年视图下自动注入运限四化和命宫信息到 AI prompt；运限专用话题按钮（大限总运/事业/感情、流年运势/提醒）；婚姻类问题（命中 MARRIAGE_KEYWORDS）自动注入夫妻宫主星的专家断语（来自后端 `server-workers/services/ziwei-heming-data.ts`，倪师体系+《全书》断语），并提示夫妻+福德双宫联参
- **星曜详情面板**：`ZiweiStarDetailPanel` 点击星曜滑入展示；当星曜所在宫位为夫妻宫时，追加展示 `STAR_IN_FUQI_GU` 五段式断语（核心/吉象/凶象/配偶特征/婚期/倪师原话）
- **序列化边界**：iztro 的 FunctionalAstrolabe 有方法和循环引用，calculator 层一步转换为纯对象
- **星曜图鉴**：`/ziwei-knowledge` 路由，ZiweiKnowledge 页面，卡片网格浏览14主星+8吉星+6煞星，点击展开详情

### 人生发展报告核心逻辑（双盘合参）

`src/pages/LifeReport.tsx` + `src/lib/life-report-api.ts` + `server-workers/services/life-report-ai.ts`，定位"人生规划师"而非命盘分析师，输出叙事性人生发展报告。

- **主线**：八字定框架（日主/格局/用神/大运气候=人生基调）+ 紫微填细节（宫位/星曜/四化=具体领域呈现）+ 时间轴对齐双盘十年段 + 分维度叙事呈现
- **分章节流式生成**（前端编排）：用户提交 → 前端同时排双盘（`calculateBaziChart` + `calculateZiweiChart`，输入参数一致）→ 调 `/api/life-report/overview` 出"本命总览"（首屏 3-5s）→ 总览回来后**并行**调 5 个 `/api/life-report/section`（career/wealth/marriage/health/trend，各带 overview 保证一致性）→ 每个回来就渲染。各请求独立 30s 互不影响
- **AI 调性**：`life-report-ai.ts` 的 system prompt 是"资深人生规划师"，温暖笃定不宿命，命理术语转大白话，markdown 叙事输出（非铁口直断六段式）。目标：解释权/决策信心/情绪安慰/身份认同
- **一致性约束**：总览确定的核心结论（日主特质/用神朝向/命宫格局/四化落点）通过 overview 注入各 section prompt + chat 的 reportSummary，禁止自相矛盾
- **结构化锚定结论**：`life-report-ai.ts` 的 `buildAnchorConclusions()` 从排盘数据抽取硬结论（日主/格局/用神喜忌/命宫主星/命主身主/五行局/生年四化；命宫按 `earthlyBranch===soulPalace` 定位取主星）成带"禁止改写"强约束的独立块，注入 overview/section prompt 头部。与 system prompt 的"命理数据铁律"互补（铁律=规则层禁推导，锚定块=数据层照写），防止 overview 判错被各章节当锚点固化。chat 已有"命理数据对照"段，不重复注入
- **温度设置**：overview/section `temperature=0.25`（与八字/紫微首次解读 0.15 同理——硬结论照盘说、不发挥，与结构化锚定结论配合稳定核心结论不被抖动改写）；chat 追问 `0.6`（保持灵活）。低于八字/紫微的 0.15 是因人生报告偏叙事，留少量温度避免死板
- **数据结构**：`LifeReportInput` = 生辰 + `baziChart` + `ziweiChart` + `focus?`（用户关注点，影响侧重）；`SectionType` = career/wealth/marriage/health/trend
- **呈现**：`LifeReportView` 渐进渲染 6 个章节位（loading 占位→markdown）+ `LifeTimeline`（纯本地双盘数据，八字大运↔紫微大限按 startAge 对齐，当前段高亮）+ 命盘详情折叠区（自渲染简化八字四柱表+紫微十二宫列表，深度用户可展开，不引入 ZiweiPalaceGrid 避免耦合）+ 追问对话（复用 `BaziChatInput`）
- **追问**：`/api/life-report/chat`，reportSummary = 总览+各章节内容拼接，保证追问与报告一致
- **档案复用**：复用通用 profiles 表（inputMode='birthdate'），无需新迁移；`LifeReportForm` 从 `ProfileContext.currentProfile` 预填
- **输入与排盘准确度**：`LifeReportForm` 填出生地时自动勾选真太阳时（`useSolarTime && birthplace` 同时成立才修正，两个 calculator 修正后均按 `correctedHour` 重判时柱/时辰）。中国统一北京时间，西部出生者真太阳时差可达 1-2 小时，不校正会算错时柱——故默认引导填出生地
- **云端历史会话**：登录用户的报告存 D1 `life_history` 表（`migrations/0003_life_history.sql`），跨设备同步。前端 `src/lib/life-history.ts` + `src/lib/life-history-api.ts`，后端路由 `/api/life-history`（GET 列表 / POST upsert / DELETE，`authMiddleware` 保护）在 `functions/api/[[route]].ts`。每条历史 = 生辰 + 总览 + 5 章节内容 + 多个追问聊天（保留最近 10 条，POST 时超出删最旧）。总览生成即创建条目，章节/聊天/重命名变化时 upsert 回写。未登录用户不存历史。
- **今日运势卡（每日回流抓手，围绕人生报告双盘）**：用户首次生成报告后生辰缓存到 `localStorage(iching_last_report)`；回到输入页出现"今日运势"快捷入口 → 一键进入 `step:'daily'` 视图。复用同一份双盘数据 + 本地流日计算（`src/lib/daily-fortune.ts` 用 lunar-javascript `Solar.fromYmd` 算今日干支，`SHI_SHEN_MAP` 推日主×今日天干十神 → "今日主调"印绶/食伤/财星/官杀/比劫日）。后端 `/api/life-report/daily`（`authMiddleware` + `quotaMiddleware('chat')`，JSON 模式 `response_format:json_object`，温度 0.4/max_tokens 500）返回 `{level:1-5, tip, yi[], ji[], comment}`，AI 服务 `getDailyFortune()` 在 `life-report-ai.ts`。运势卡 `src/components/life-report/DailyFortuneCard.tsx` 整张以 SVG 渲染（单源，既是可见 UI 也是分享图源）；分享用 `src/lib/svg-to-png.ts`（零依赖：序列化 SVG→Image→canvas→PNG，支持下载+复制剪贴板）。同日结果按 `iching_daily_<YYYY-MM-DD>` 缓存到 localStorage，"刷新"按钮可强制重算（消耗额度）。
- **命格翻译卡 + 用户自填 MBTI（结果页顶部）**：MBTI 由用户在 `LifeReportForm` 自填（16 型 select，选填；自动推算不准已弃用），存入 `LifeReportInput.mbti`，随生辰缓存到 `iching_last_report`、写入 `life_history` 的 `LifeHistoryBirth.mbti`（JSON 字段，无需迁移）。`src/data/personality-mapping.ts` 的 `getPersonalityProfile(baziChart, ziweiChart, mbti?)` —— 用户 MBTI 查 `MBTI_TYPES`（16 型展示标签/关键词，纯展示非推导）；星座/生肖取 iztro 已算出的 `ziweiChart.sign`/`zodiac`；命宫按 `earthlyBranch===soulPalace` 取主星（空宫用 `borrowedStars`）；日主天干 → `DAY_MASTER_PERSONALITY` 五行性格 archetype。`src/components/life-report/PersonalityCard.tsx` 在 `LifeReportView` 的 `ReportBody` 顶部展示徽章（MBTI·星座·属相·命宫主星·日主）+ 可展开关键词 + 隐藏 SVG 名片（复用 svg-to-png 分享）。
- **MBTI 注入 AI 分析**：用户自填 MBTI 通过 `formatInputHeader`（`用户MBTI（自填）：XXX`）注入 overview/section/chat 三类 prompt 的头部；`buildSystemPrompt` 的「MBTI 融合规则」段指示 AI 把 MBTI 作为现代心理学视角与命理相互印证（命理优先，冲突时温和点出差异，1-2 处点睛不喧宾夺主，追问性格/人际/职业时主动调用）。仅当用户填了 MBTI 时生效。

### 结构化经典文献

经典文献数据位于 `src/data/classics/`，沿用 Book > Chapter > Paragraph 体系：

- **类型定义**：`src/data/classics/types.ts`（Book/Chapter/Paragraph/SearchHit）
- **数据文件**：`gusuifu.ts`（骨髓赋）、`quanji.ts`（全集）、`quanshu.ts`（全书）
- **注册表**：`src/data/classics/index.ts`（ALL_BOOKS、getBookBySlug、searchClassics）
- **搜索**：前端内存全文搜索，返回带 `<mark>` 高亮的摘要
- **UI**：`ClassicsPage` 三步导航（书架→目录→阅读），每段有 AI 解读按钮
- **AI**：`classics-ai.ts` 提供 `interpretParagraph()`，温度 0.3

### AI 对话约束

`server-workers/services/divination-ai.ts` 实现了严格的对话控制逻辑：
- **场景锁定**：事业/感情/健康/财运/学业/出行/官司/寻物，AI 回答不得擅自切换场景
- **追问意图分类**：根据用户消息正则匹配分为 timing(时间)/advice(建议)/outcome(结果)/judgment(判断)，每种意图有固定的回答模板
- **追问轨迹追踪**：最近 3 条用户追问注入上下文，避免 AI 自相矛盾

### 样式主题

双主题系统：
- **浅色**：琥珀暖色（amber），衬线字体，祥云背景
- **深色**：墨黑背景 + 金色（#d4af37）强调，无阴影光晕

大量使用 Tailwind 的 `shadow-[...]` 和 `bg-gradient` 实现传统风格。全局样式和动画定义在 `src/index.css`。

shadcn/ui 组件位于 `components/ui/`，依赖 `class-variance-authority` + `tailwind-merge`（通过 `src/lib/utils.ts` 的 `cn()` 合并类名）。

## 环境变量与密钥

### 生产环境（Cloudflare）

非敏感配置写在 `wrangler.toml` 的 `[vars]` 段：
- `OPENAI_MODEL` — 模型名，如 `gpt-4o-mini`
- `OPENAI_BASE_URL` — API 基础地址
- `RESEND_FROM_EMAIL` — 发件人地址

敏感密钥通过 `wrangler pages secret put` 设置（加密存储，代码中不可见）：
- `OPENAI_API_KEY` — AI 解卦/八字功能依赖
- `RESEND_API_KEY` — 邮件服务
- `JWT_SECRET` — JWT 签名密钥，至少 32 位

前端构建时变量（在 Cloudflare Dashboard 设置）：
- `VITE_ADMIN_PASSWORD` — 反馈管理后台密码
- `VITE_FEEDBACK_API_URL` — 默认 `/api`，无需修改

### 本地开发

创建 `.dev.vars` 文件（与 `.env` 格式相同，`wrangler pages dev` 自动读取，已被 `.gitignore` 忽略）：

```ini
OPENAI_API_KEY=sk-xxx
RESEND_API_KEY=re_xxx
JWT_SECRET=your-random-secret
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
RESEND_FROM_EMAIL=IChing64 <noreply@iching64.fun>
```

## 部署

```bash
# 1. 首次：创建 D1 数据库和 KV 命名空间
npx wrangler d1 create iching64-db        # 把返回的 database_id 填入 wrangler.toml
npx wrangler kv namespace create AUTH_KV  # 把返回的 id 填入 wrangler.toml

# 2. 远程建表（⚠️ 必须显式 --remote，npm run db:migrate 默认操作本地）
npx wrangler d1 migrations apply iching64-db --remote

# 3. 设置密钥
npx wrangler pages secret put OPENAI_API_KEY
npx wrangler pages secret put RESEND_API_KEY
npx wrangler pages secret put JWT_SECRET

# 4. 构建 + 部署（Production 分支为 cloudflare）
npm run build
npx wrangler pages deploy ./dist --project-name=iching64 --branch=cloudflare --commit-dirty=true
```

Production 分支设置为 `cloudflare`（在 Cloudflare Dashboard → Workers & Pages → iching64 → Settings → Builds & deployments 中配置）。

## 注意事项

- `server/skills/xuan/` 是一个 **Git 子模块**，存储八字排盘的参考资料。克隆后需 `git submodule update --init`。构建脚本 `scripts/bundle-xuan-skill.ts` 依赖此子模块。
- Windows 开发环境：部分源文件为 LF 换行，Git `core.autocrlf` 可能导致 LF→CRLF warning，不影响运行但需注意 `Edit` 工具逐字节匹配的问题。
- 前端 HashRouter 意味着所有路由以 `/#/` 开头，Cloudflare Pages 无需额外路由配置。
- 旧的 Express 后端代码保留在 `server/` 目录（已不在生产环境使用），仅供参考。
- D1 不支持 `undefined` 值绑定，所有可选字段必须用 `?? null` 处理。
- Workers 执行时间限制：免费版 10ms CPU / 30s 挂钟时间。AI 调用是 I/O 等待不占 CPU，但长时间对话可能接近 30s 挂钟上限。

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
   - 这属于工具调用层问题，但可通过"先确认参数再调用"避免。

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
