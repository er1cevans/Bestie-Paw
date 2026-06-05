# ADR 0001：前端引入构建工具链与 TypeScript（Vite + TS + Vitest + 共享类型）

- **状态**: Accepted（Owner 已批准启动 2026-06-05）
- **日期**: 2026-06-05（提出）／2026-06-05（批准 + 拆分细化）
- **决策者**: 架构师（Claude Code）+ Owner
- **相关**: COORDINATION §2（引入构建工具/monorepo 需先立 ADR）；TASKS Phase 2

## 背景 Context

后端在 2026-06 已完成质量基建：全模块集成测试、容器化 CI、ESLint、分支保护、契约统一（见 TASKS TASK-001~008，Phase 1 已收尾）。

**前端则几乎零工程化**（实测当前状态）：
- `index.html` 用 `<script type="text/babel" src="app/*.jsx">` 加载 8 个文件，**Babel Standalone 浏览器内编译**，无打包、无构建步骤。
- 文件间靠**全局作用域拼接**共享符号（`api` / `smartApi` / `apiFetch` / `tokenStore` / `useRouter` / `useT` / 各 Context / 各组件均为全局），无 ESM `import/export`。
- **无类型检查、无 lint、无测试**；React/ReactDOM/Babel 走 unpkg CDN。

这种失衡已多次产生真实成本：
- React Hooks 顺序 bug（`DashboardPage`，靠肉眼 + 控制台才发现）。
- 前后端**枚举大小写**靠手工适配层转换（`app/services.jsx` 的 `_up`/`_lo`）。
- **分页信封 records/posts→items** 迁移要在前端适配层手工对齐（TASK-004，`_items`/`_page`）。
- CSS 单位缺失（`minmax(260,1fr)`）等只能运行时暴露。

根因：前端没有类型、没有测试、没有与后端共享的契约类型，所有错误都推迟到运行时/演示时才暴露。

## 决策 Decision

**为前端引入正式工具链，增量迁移（不重写），并把工作切成「工程化」与「UI 设计」两条正交的轨道。**

工具链选型：

1. **Vite + TypeScript**：用 Vite 做开发/构建，逐步把 `.jsx` 迁移为 `.tsx`（先开 `allowJs`，按文件迁移，不一次性重写）。移除 Babel-standalone 的浏览器内编译，React 走 npm 依赖而非 CDN。
2. **Vitest + Testing Library**：先为**逻辑层**（适配器、token 续期、router、i18n）加单元测试；UI 方向定了之后再为关键页加组件/集成测试。纳入 CI。
3. **`packages/shared` 共享类型**：把后端的契约类型（枚举、分页信封、响应信封、错误码、DTO）抽到共享包，前后端共同引用，**从根上消灭枚举大小写 / records-items 这类漂移**。这一步把仓库推向 pnpm workspace（monorepo）——属本 ADR 授权范围。
4. **CI 扩展**：前端 `tsc`/`vitest`/`eslint` 纳入 CI 门禁，与后端同等。

目标仓库布局（pnpm workspace）：

```
/                      ← workspace 根（pnpm-workspace.yaml）
  bestie-paw-backend/  ← 现状不动
  bestie-paw-frontend/ ← index.html + app/ 迁入此处 + Vite/TS/Vitest 配置
  packages/shared/     ← 前后端共享契约类型
```

## 关键拆分：UI 无关地基 (a) ／ UI 耦合迁移 (b)

**前端「工程化」与「UI 设计」是正交的，二者只在组件代码处相交。** 据此把 Phase 2 切成两段，避免在 UI 方向未定时做会被推翻的工作：

### (a) UI 无关地基 — **现在做，无悔，任何 UI 改版都留存**
对应 `app/services.jsx`（纯逻辑：API 客户端、`tokenStore`、401 自动续期、枚举/信封适配器 `_up`/`_lo`/`_items`/`_page`、`smartApi` demo 兜底、`resolveUpload`、router、i18n）+ 工具链 + 共享类型 + CI。这些**不含任何视觉/布局**，无论 UI 怎么重画都不变：

- Vite + TS + Vitest + ESLint 脚手架、pnpm workspace（现有 jsx 原样跑通，`allowJs`）。
- `packages/shared` 契约类型，前端 API 层改用共享类型，**删手工大小写/信封适配**。
- 逻辑层 `services.jsx → src/services/*.ts`（TS 化 + 单元测试：适配器、token 续期、router、i18n）。
- 前端 `tsc`/`vitest`/`eslint` 纳入 CI 门禁。

### (b) UI 耦合迁移 — **推迟到 UI 设计方向定了再做**
对应 6 个视图文件（`public/dashboard/health/social/settings/ui.jsx`：渲染组件 + 设计 token + 布局）：

- 逐文件 `.jsx → .tsx` + Testing Library 组件/页面测试。
- 设计 token 收敛（目前散在 `index.html` 的 `:root` CSS 变量里）。
- demo mode / DemoBanner 去留评估。

**为什么这样切是安全的**：可用的 `design:*` 技能产出的是规格/批评/设计 token（与工程化互补），**不是整页重写**；(a) 不碰任何被设计决定的东西，所以即便之后引入设计 skill/agent 重画 UI，(a) 的地基、类型、测试、CI 全部留存——工程化的投入不会浪费。(b) 等 UI 方向定了再逐页做，那时 `.tsx` 化与写测试是顺水推舟。

## 后果 Consequences

**正面**：
- 编译期类型安全，消灭一整类运行时 bug。
- 前端有自动化测试 + CI 门禁，与后端对齐。
- 共享类型消除前后端契约漂移（删掉手工适配层）。
- 生产可用的构建产物（打包/摇树/压缩），优于浏览器内编译。
- (a)/(b) 拆分让工程化可以**不等 UI 决策**先行，且零返工风险。

**代价/风险**：
- 引入构建步骤；贡献者需 Node + pnpm 工具链（不再是"开个 http server 就能跑"）。
- 迁移有工作量（虽增量）；演示模式（demo mode）与无构建即跑的便利会改变。
- workspace 化需调整目录与 CI（一次性成本）。
- 全局作用域 → ESM 的转换期：(a) 完成前，6 个视图 jsx 仍依赖全局符号，需保留 interop 垫片直到 (b) 逐页迁移。

## 实施任务（已拆分到 TASKS Phase 2）

**(a) UI 无关地基（现在派发）**：
- **TASK-009**：前端工程化脚手架（Vite + TS + Vitest + ESLint + pnpm workspace；现有 jsx 原样跑通；前端 CI job）。
- **TASK-010**：`packages/shared` 契约类型（枚举/信封/错误码/DTO，前后端共用）。
- **TASK-011**：逻辑层 TS 化（`services.jsx → src/services/*.ts`，用共享类型，删手工适配，加 Vitest 单测）。

**(b) UI 耦合迁移（待 UI 方向定后再拆卡）**：6 个视图 `.jsx → .tsx` + 组件测试 + 设计 token 收敛 + demo mode 去留。**未定 UI 前不动**。

## 备选方案 Alternatives

- **A. 维持 Babel-standalone（否决）**：零构建、迭代快，但无法规模化，质量风险持续累积。
- **B. 直接上 Next.js / 全量重写（否决）**：过重，当前不需要 SSR；重写风险高、收益不匹配。
- **C. 推迟到上线前再做（已不采纳）**：曾作为回退项；现 Owner 已批准启动 (a) 段。(b) 段本身即是"等触发点再做"的体现（触发点 = UI 设计方向确定）。
