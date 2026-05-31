# 更新日志 / Changelog

本项目所有值得记录的改动都会写在这里。
格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布 / Unreleased]

### 前后端联调 Integration
打通前端与真实后端（+ Neon）的端到端链路，修复仅在真连后端时才暴露、被 demo 模式掩盖的不匹配：
- **枚举大小写**：前端的 `api` 适配层在发送时把 `type`/`gender`/`neutered` 转大写、接收时转小写，对齐后端 Prisma 的大写枚举。
- **分页信封**：适配层自动拆解后端返回的 `{records,total,...}` / `{posts,total,...}`，前端继续按数组消费。
- **错误解析**：`apiFetch` 改读 `data.error.code/message`（此前读 `data.code` 导致后端错误信息全部丢失），并透传 `fields`。
- **提醒列表**：去掉默认 `?upcoming=true`，列出全部未完成提醒。
- **开发期邮箱验证**：非生产环境且未配置 SMTP 时，注册自动验证邮箱，避免登录被卡死（生产仍走真实验证）。

### 后端 Backend

#### 新增 Added
- **体重历史模块**（新）：`GET/POST/DELETE /api/pets/:petId/weight`，记录体重趋势，新增记录时同步 `pet.weightKg`。
- **认证补全**：`POST /api/auth/resend-verification`（重发验证码，限流、防枚举）、`POST /api/users/me/password`（登录态修改密码，改后吊销所有会话）。
- **社区取消点赞**：`DELETE /api/community/posts/:postId/like`。
- **提醒完成**：`POST /api/pets/:petId/reminders/:reminderId/complete` + `Reminder.completedAt` 字段；列表默认隐藏已完成（`?includeCompleted=true` 可见），定时任务跳过已完成提醒。
- **健康附件删除**：`DELETE /api/pets/:petId/health/:recordId/attachments`（同时删除磁盘文件）。
- 数据库迁移 `20260530000000_add_comment_author_and_indexes`（Comment→User 关系、`Pet.ownerId`/`Comment.postId` 索引、`WeightRecord`、`Reminder.completedAt`）。

#### 变更 Changed
- 分页列表（健康记录、社区帖子）返回 `{ items, total, page, limit }`，便于前端分页。
- 帖子详情评论改为按时间正序，并附带评论作者信息（新增 `Comment.author` 关系）。
- 鉴权中间件移除每请求的用户表查询，直接信任已验证的 JWT（降低数据库压力）。
- 头像更新（用户/宠物）时清理旧文件；`updateCurrentUser` 增加手机号唯一性校验。
- 提醒 `dueDate` 创建/更新均要求为将来时间。

#### 修复 Fixed
- 修复 `tsconfig.json` 中无效的 `ignoreDeprecations: "6.0"`（导致 `tsc`/`npm run build` 完全无法运行）。
- 修复 `jwt.ts`、`oauth.strategy.ts`、`node-cron` 等历史遗留的类型错误；新增 `src/types/ambient.d.ts` 为无类型依赖补声明；提交 `package-lock.json` 锁定依赖版本。整个后端 `tsc --noEmit` 零报错。

### 前端 Frontend

#### 新增 Added
- **AI 助手接入真实大模型**：新增统一入口 `aiComplete()`，调用优先级为
  Google Gemini（配置免费 key 时）→ 免费无需注册的 Pollinations 接口 → 本地话题感知兜底，
  保证演示环境零配置也始终有响应。免费 Gemini Key 获取见 `app/services.jsx` 顶部 `AI_CONFIG` 注释。
- 应用入口 `index.html` 补充 favicon 链接。
- 新增本更新日志 `CHANGELOG.md`。

#### 变更 Changed
- **前端整合为单一 React 单页应用**：`BestiePaw App.html` 重命名为 `index.html`，
  以 React 版作为唯一前端入口。
- 重写 `README.md`：更新技术栈说明、前端模块结构、路由说明与本地运行/演示模式指引。

#### 修复 Fixed
- 修复 `DashboardPage` 的 React Hooks 顺序错误（`useLang()` 在早返回后才调用，导致控制台持续报错）。
- 修复宠物卡片网格 CSS：`minmax(260, 1fr)` → `minmax(260px, 1fr)`，此前缺省单位导致整组声明失效、卡片竖排。

#### 移除 Removed
- 删除已被 React 版取代的静态多页前端：`login.html`、`register.html`、`pet-profile.html`、
  `onboarding-complete.html`，以及旧静态版的 `css/`、`js/`。
- 移除死代码：未被加载的 `app/tweaks-panel.jsx`、未被调用的 `matchRoute()` 工具函数。

---

## 历史 / Earlier

项目早期里程碑（见 git 历史）：

- 初版前端界面
- 后端功能实现（Express + Prisma：认证、宠物、健康、提醒、社区、统计）
- 项目框架构建
