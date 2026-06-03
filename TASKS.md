# Bestie Paw 任务看板

> 架构师（Claude Code）维护，其他 agent 只读。格式见 `docs/COORDINATION.md §8`。
> 提醒：agent 非自治，本看板是**人读的**；状态由架构师在合并时更新。
> 更新：2026-06-03

## 看板状态
| 任务 | 标题 | 分配给 | 状态 |
|---|---|---|---|
| TASK-001 | 后端核心 API 集成测试套件 | Antigravity | ✅ DONE（PR #6 已合并 2026-06-02） |
| TASK-002 | CI 工作流 + ESLint 门禁 bootstrap | Antigravity（架构师 Review） | ✅ DONE（PR #11 已合并 2026-06-03；CI 绿，main 已开分支保护） |
| TASK-003 | 覆盖率阈值棘轮抬到 70% | Antigravity | 🚧 已派发（2026-06-03） |
| TASK-004 | 分页信封统一为 `items`（records/posts → items） | Codex | ✅ DONE（PR #9 已合并 2026-06-03，22 用例绿） |
| TASK-005 | 工具链债务清理（no-explicit-any→error、tsconfig 拆分） | 待分配 | PENDING（技术债） |

---

## [TASK-001] 后端核心 API 集成测试套件（auth + pets + health）
- **状态**: ✅ DONE（PR #6 已合并 2026-06-02；22 用例全过，门禁绿）
- **分配给**: Antigravity
- **分支**: `agent/antigravity/backend-api-tests`（已合并删除）
- **遗留/转交**: 覆盖率为达标临时降阈（branches 44 / functions 66）→ 转 TASK-003 棘轮抬到 70；测试暴露的 `records` 漂移 → 转 TASK-004。
- **涉及路径**:
  - 新增 `bestie-paw-backend/src/**/__tests__/*.test.ts`（或 `tests/` 目录）
  - 可新增 `bestie-paw-backend/tests/setup.ts`、`bestie-paw-backend/.env.test`（勿提交真实密钥，仅占位）
  - **不得改动** `src/modules/**` 业务逻辑、`prisma/schema.prisma`、`src/config/`（属他人/架构师 owner）。如测试暴露 bug，**只记录在 PR 描述**，由架构师另开修复任务。
- **依赖**: 无（jest / ts-jest / supertest / jest.config.js 均已就绪）
- **创建**: 2026-06-02　**截止**: 2026-06-13
- **背景**: 后端已装 jest+ts-jest+supertest 且配好 `jest.config.js`（`testMatch: **/?(*.)+(spec|test).ts`），但**零测试用例**。这是 CI 硬门禁（见 COORDINATION §4）的前置依赖。

- **目标 / 成功标准**: 为三个核心模块写**集成测试**（走真实 Express app + 测试数据库，经 supertest 打 HTTP），覆盖正常流 + 关键错误流。

- **验收标准**:
  - [ ] **测试数据库**：用独立 Postgres（本地 docker 或测试 schema），`NODE_ENV=test` 加载 `.env.test`；测试前 `prisma migrate deploy` 应用迁移，每个用例间清库（truncate 或事务回滚），互不污染。
  - [ ] **auth 流**：注册 → 登录 → 拿 access token → 用 token 访问受保护端点 → `POST /auth/refresh` 续期。覆盖错误流：重复邮箱注册(409)、错误密码登录(401)、无 token 访问受保护端点(401)。
  - [ ] **pets CRUD（鉴权下）**：`POST /pets` 创建 → `GET /pets` 列表 → `GET /pets/:id` 详情 → `PATCH` 更新 → `DELETE`。错误流：访问**他人宠物**返回 `FORBIDDEN`(403)、不存在宠物 `NOT_FOUND`(404)。
  - [ ] **health 记录**：`POST /pets/:petId/health` 创建 → `GET` 列表**断言分页信封** `{ items, total, page, limit }`（见 API_CONTRACTS §5）→ `DELETE`。
  - [ ] **契约断言**：所有响应断言 §2 信封——成功 `{success:true,data}`、失败 `{success:false,error:{code,message}}`；枚举字段断言为**大写**（API_CONTRACTS §4）。
  - [ ] **覆盖率**：`auth` / `pets` / `health` 三模块 service+controller 行覆盖 ≥ 70%；`npm test` 全绿。
  - [ ] PR 描述贴出 `npm test` 输出与覆盖率摘要（CI 就绪前的临时门禁，COORDINATION §4.1）。
  - [ ] 邮件 / 外部 SMTP 须 mock，测试不得真实发信。

- **实现提示**:
  - app 与 server 已分离（`src/app.ts` / `src/server.ts`）→ supertest 直接 import `app`，勿起监听端口。
  - 响应信封工具：`src/utils/response.ts`；错误类型：`AppError`（`middleware/errorHandler.ts`）。
  - 不要为了凑覆盖率测私有 helper；优先覆盖**对外行为与契约**。
  - 若 docker 不可用，可在 PR 里说明改用的方案（如 Neon 测试库 / pg-mem），但须保证 CI 中可复现。

- **参考**: `docs/API_CONTRACTS.md`、`bestie-paw-backend/API.md`、`docs/COORDINATION.md §4`

- **Review 关注点（架构师）**: 测试是否**真打 HTTP 走真实 app**（而非只调 service）、清库隔离是否可靠、契约断言是否到位、是否误改业务代码。

---

## [TASK-002] CI 工作流 + ESLint 门禁 bootstrap
- **状态**: ✅ DONE（PR #11 已合并 2026-06-03；`build-and-test` CI 绿；`main` 已开分支保护强制该检查）
- **分配给**: Antigravity（实现）／Claude Code（架构师 Review + 分支保护）
- **分支**: `agent/antigravity/ci-bootstrap`（已合并）
- **创建**: 2026-06-02　**截止**: 2026-06-13
- **达成**:
  - [x] CI 在 PR 上跑 `tsc --noEmit` + `eslint` + `npm test`
  - [x] ESLint 启用 `@typescript-eslint/no-explicit-any`（暂为 `warn`，1 处违规 `oauth.strategy.ts:55` → 转 TASK-005 改 `error`）
  - [x] **容器化 Postgres**（postgres:16 service）跑测试，不连 Neon、不需 Secrets
  - [x] `main` 分支保护已启用：必须 `build-and-test` 通过 + 禁 force push/删除；暂不要求人工 approval（单 owner 防死锁）
- **遗留/转交**: `tsconfig include tests` 致 build 把测试编进 dist → 转 TASK-005 拆分。

---

## [TASK-003] 覆盖率阈值棘轮抬到 70%（技术债）
- **状态**: 🚧 已派发（2026-06-03）
- **分配给**: Antigravity（续作）
- **分支**: `agent/antigravity/coverage-ratchet`
- **涉及路径**: `bestie-paw-backend/tests/**`、`jest.config.js`
- **依赖**: TASK-001/002 均已合并 ✅；CI 已就绪，PR 会自动跑同一阈值
- **创建**: 2026-06-02　**截止**: 待定
- **背景**: TASK-001 为让门禁变绿，把 `coverageThreshold` 临时设为 branches 44 / functions 66（statements·lines 70）。branches 44% 偏低。
- **验收标准**:
  - [ ] 补错误/边界用例，把 auth·pets·health 的 branches/functions 抬到 ≥ 70
  - [ ] `jest.config.js` 阈值四项统一回 70，`npm test` 仍绿
  - [ ] CI 的 `build-and-test` 仍绿（阈值即 CI 门禁）

## [TASK-005] 工具链债务清理（技术债）
- **状态**: PENDING
- **分配给**: 待分配
- **分支**: `agent/<name>/toolchain-cleanup`
- **涉及路径**: `bestie-paw-backend/.eslintrc.json`、`bestie-paw-backend/tsconfig*.json`、`src/modules/auth/oauth.strategy.ts`、`package.json`
- **依赖**: TASK-002 已合并 ✅
- **创建**: 2026-06-03　**截止**: 待定
- **背景**: TASK-002 为不阻塞合并，留了两处工具链债务。
- **验收标准**:
  - [ ] 修掉 `oauth.strategy.ts:55` 的 `any`，把 `no-explicit-any` 从 `warn` 提到 `error`
  - [ ] 拆出 `tsconfig.eslint.json`（含 `tests`）供 typecheck/lint 用；`build` 的 tsconfig 仅含 `src`，避免测试被编进 `dist`
  - [ ] `npm run lint` / `typecheck` / `build` / `test` 均通过，CI `build-and-test` 绿

## [TASK-004] 分页信封统一为 `items`（契约对齐，决策 = B）
- **状态**: ✅ DONE（PR #9 已合并 2026-06-03；架构师实跑 22 用例全过、覆盖率达标）
- **分配给**: Codex
- **分支**: `agent/codex/pagination-items`（已合并；worktree 待统一回收）
- **涉及路径（跨端，破坏性变更）**:
  - 后端：`src/modules/health/health.controller.ts`、`src/modules/community/community.controller.ts`（及对应 service/返回处）→ `records`/`posts` 改为 `items`
  - 前端：`app/services.jsx` 适配层（移除对 `records`/`posts` 的拆封，改读 `items`）
  - 文档：`bestie-paw-backend/API.md`、`docs/API_CONTRACTS.md §5`
  - 测试：`bestie-paw-backend/tests/health.test.ts` 把断言从 `records` 改回 `items`
- **依赖**: TASK-001 已合并 ✅（health.test.ts 已在 main，可直接改其断言）；本任务统一翻转后端+前端+测试
- **创建**: 2026-06-02　**截止**: 待定
- **决策来源**: 架构师裁定 `items` 为分页信封唯一字段名（见 `docs/API_CONTRACTS.md §5`）
- **验收标准**:
  - [ ] 所有列表端点（health、community，及未来新端点）返回 `{ items, total, page, limit }`
  - [ ] 前端适配层与之对齐，demo 模式同步
  - [ ] `API.md` / `API_CONTRACTS.md` 更新，去掉 records/posts 历史差异说明
  - [ ] health.test.ts 断言改为 `items` 且 `npm test` 绿
  - [ ] 属**破坏性变更**：合并前确认前端已同步，避免线上联调断裂
