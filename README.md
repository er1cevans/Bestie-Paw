# Bestie Paw

专为宠物主人打造的全能生活助手，提供健康档案管理、社区社交和 AI 智能分析功能。

## 技术栈
- 前端：React 18（单页应用，通过 Babel Standalone 在浏览器内编译，无需构建工具）
- 后端：Node.js + Express + PostgreSQL（Prisma ORM）

## 前端结构
单页应用，入口 `index.html`，组件按模块拆分在 `app/` 下：

| 文件 | 说明 |
|------|------|
| index.html | 应用入口，挂载 React 并加载下列模块 |
| app/services.jsx | API 客户端、demo 降级、i18n、路由 |
| app/ui.jsx | 通用 UI 组件与图标 |
| app/public.jsx | 落地页、登录、注册、宠物登记、完成页 |
| app/dashboard.jsx | 应用外壳（侧边栏）与概览仪表盘 |
| app/health.jsx | 健康管理 |
| app/social.jsx | 社区与 AI 助手 |
| app/settings.jsx | 提醒管理与个人中心 |
| app/main.jsx | 顶层路由与应用装配 |

> 路由说明：`#/` 落地页，`#/login`、`#/register`、`#/pet-profile`、`#/complete` 为注册流程，`#/app/*` 为登录后的应用页面。

## 本地运行
需通过 HTTP 服务访问（`app/*.jsx` 经 `fetch` 加载，`file://` 会被 CORS 拦截）：

```bash
python3 -m http.server 4173
# 浏览器打开 http://localhost:4173
```

后端不可用时，前端会自动进入 **演示模式**（内置 mock 数据），可用 `demo@bestiepaw.com` + 任意密码登录体验。
