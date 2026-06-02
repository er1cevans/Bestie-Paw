# Bestie Paw 架构快照

> 维护者：Claude Code（架构师）｜更新：2026-06-02
> 这是对**现状**的描述，不是愿景。变更需经 ADR（`docs/ADR/`）。

## 系统概览

宠物主人的生活助手：健康档案、提醒、社区、AI 助手。前后端分离。

```
┌─────────────────────────┐        HTTPS /api        ┌──────────────────────────────┐
│  前端 (React 18 SPA)     │ ───────────────────────▶ │  后端 (Express + TypeScript)  │
│  index.html + app/*.jsx  │ ◀─────────────────────── │  bestie-paw-backend/          │
│  Babel Standalone 浏览器  │   JSON 信封 {success,data}│  Prisma ORM                   │
│  内编译，无构建工具       │                          │         │                      │
│  无后端时降级 demo 模式   │                          │  PostgreSQL (Neon)            │
└─────────────────────────┘                          └──────────────────────────────┘
```

## 前端
- React 18 单页应用，**Babel Standalone 在浏览器内编译 JSX**，无 webpack/vite，无构建步骤。
- 入口 `index.html`，模块按页面拆分于 `app/`：`services.jsx`(API/i18n/路由)、`ui.jsx`、`public.jsx`(落地/登录/注册)、`dashboard.jsx`、`health.jsx`、`social.jsx`、`settings.jsx`、`main.jsx`(装配)。
- 路由：`#/` 落地，`#/login` `#/register` `#/pet-profile` `#/complete` 注册流，`#/app/*` 应用内。
- 降级：后端不可用时进入 demo 模式（mock 数据），`demo@bestiepaw.com` + 任意密码。
- AI：`aiComplete()` 三级降级 Gemini → Pollinations → 本地兜底。

## 后端
- Express 4 + TypeScript（strict）+ Prisma 5 + PostgreSQL。`type: commonjs`，`tsc` 编译到 `dist/`。
- 分层：`routes → controller → service → prisma`；横切在 `middleware/`(auth/errorHandler/rateLimiter/upload) 与 `utils/`(jwt/hash/mailer/logger/response/prisma)。
- 模块：`auth`(含 Google/Apple OAuth、邮箱验证、刷新令牌)、`users`、`pets`、`health`(+附件)、`weight`、`reminders`(+node-cron 定时)、`community`(帖/评论/点赞)、`stats`。
- 鉴权：JWT access/refresh；中间件信任已验证 JWT，不再每请求查库。
- 数据模型（Prisma）：`User`、`RefreshToken`、`Pet`、`HealthRecord`、`Reminder`、`Post`、`PostLike`、`Comment`、`WeightRecord`；枚举 `PetType`/`Gender`/`NeuteredStatus`/`HealthRecordType`/`ReminderType`（**大写**）。
- 上传：`multer` 落本地磁盘 `UPLOAD_DIR`，`/uploads` 静态暴露（CORP 放宽为 cross-origin）。
- 环境：`config/env.ts` 用 zod 校验；支持 `NODE_ENV=test`。

## 已知技术债 / Backlog
- **后端零自动化测试**（jest/supertest 已装，无用例）→ TASK-001。
- **无 CI、无 ESLint** → TASK-002。
- 前端靠手工大小写转换对齐后端枚举（脆弱）；无共享类型包。
- 上传为本地磁盘，生产需对象存储。
- OAuth(Google/Apple) 仅配置位，未验证联通。
