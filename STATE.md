## 当前目标
新增"人生发展报告"功能：输入生辰→前端排八字+紫微双盘→AI 以"人生规划师"身份输出叙事性人生发展报告。

## 主线
C 为主干（八字定框架+紫微填细节）+ D 时间轴（纯数据双盘对齐）+ B 呈现（分维度叙事）。分章节流式生成。普通层大白话叙事，深度层折叠命盘详情。

## 当前步骤（STEP列表）
1. [x] 后端 life-report-ai.ts ✅
2. [x] 后端 [[route]].ts 加 /api/life-report/{overview,section,chat} 3 路由 ✅
3. [x] 前端 life-report-api.ts + LifeReportForm.tsx ✅
4. [x] 前端 LifeTimeline.tsx（双盘时间轴）✅
5. [x] 前端 LifeReportView.tsx（渐进渲染+折叠区+追问）✅
6. [x] 前端 LifeReport.tsx 页面 + 路由(/life-report) + 导航(置顶"人生报告") ✅
7. [x] 构建验证 ✅ npm run build 通过；tsc -b 通过

## 当前进展
- 全部 7 STEP 完成，构建通过
- bazi-calculator/ziwei-calculator 被正确拆为独立 chunk（314KB+479KB），LifeReport 页本身 27.5KB
- 代码分割良好，无新 chunk 警告

## 关键决策
- 人生规划师调性（非铁口直断），大白话叙事，markdown 输出
- 分章节流式：overview(max_tokens 2000,3-5s)→并行5 sections(max_tokens 1500,各带 overview 保证一致)
- 时间轴纯本地数据，不调 AI
- 前端编排：LifeReport.tsx 用 overviewRef 存最新总览，章节请求读取
- 深度层命盘详情自渲染简化双盘（八字四柱表+紫微十二宫列表），不引入 ZiweiPalaceGrid 避免耦合
- 导航"人生报告"置顶作为核心入口

## 验证状态
- ✅ tsc -b 通过
- ✅ npm run build 通过
- ⏳ 需手动联调：dev 模式跑通 overview→sections 流式、时间轴对齐、追问、保存档案

## 下一步（手动测试清单）
1. /life-report 输入生辰 → 3-5s 出本命总览
2. 5 个章节陆续出现（事业/财富/感情/健康/运势）
3. 时间轴展示双盘十年段对齐，当前段高亮
4. 展开"命盘详情"看八字四柱+紫微十二宫
5. 底部追问对话可用
6. 保存为档案
7. 部署：无需新迁移（复用 profiles 表），构建+deploy 即可
