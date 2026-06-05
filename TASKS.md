# Bestie Paw 任务看板

> 架构师（Claude Code）维护，其他 agent 只读。格式见 `docs/COORDINATION.md §8`。
> 提醒：agent 非自治，本看板是**人读的**；状态由架构师在合并时更新。
> 更新：2026-06-05

## 🏁 Phase 1 — 后端工程基建（已收尾 2026-06-05）
TASK-001~008 全部闭环，外加安全修复（PR #16 IDOR）与鉴权收敛（PR #24）。**后端工程质量基建至此完整**：
- 8 模块全量集成测试，全局覆盖率 ≥70%，由 CI 强制
- 容器化 CI（`tsc` + `eslint` + `jest`）+ `main` 分支保护
- ESLint `no-explicit-any` = error、tsconfig 拆分
- 契约统一 `items`、迁移基线化（消除 P3018）、ts-jest 去噪
- 安全：reminders IDOR 修复、健康附件上限、宠物级 `assertPetOwnership` 收敛为唯一来源

**Phase 2（前端工程化）**：见 `docs/ADR/0001-frontend-build-tooling.md`（Proposed，待 Owner 批准后启动）。
**生产硬化**：见文末「Backlog」，**上线前按需另开 Phase**，当前不做。

## 看板状态
| 任务 | 标题 | 分配给 | 状态 |
|---|---|---|---|
| TASK-001 | 后端核心 API 集成测试套件 | Antigravity | ✅ DONE（PR #6 已合并 2026-06-02） |
| TASK-002 | CI 工作流 + ESLint 门禁 bootstrap | Antigravity（架构师 Review） | ✅ DONE（PR #11 已合并 2026-06-03；CI 绿，main 已开分支保护） |
| TASK-003 | 覆盖率阈值棘轮抬到 70% | Antigravity | ✅ DONE（PR #13 已合并 2026-06-03；实测 branch 71/func 98） |
| TASK-004 | 分页信封统一为 `items`（records/posts → items） | Codex | ✅ DONE（PR #9 已合并 2026-06-03，22 用例绿） |
| TASK-005 | 工具链债务清理（no-explicit-any→error、tsconfig 拆分） | Antigravity | ✅ DONE（PR #14 已合并 2026-06-03） |
| TASK-006 | 健康附件数量上限 + assertPetOwnership 抽公共 util | Codex | ✅ DONE（PR #20 已合并 2026-06-04） |
| TASK-007 | 后端剩余模块集成测试（community/users/weight/reminders/stats） | Antigravity | ✅ DONE（PR #19 已合并 2026-06-05；81 用例绿，全局覆盖 ≥70） |
| TASK-008 | CI 健壮性（迁移 P3018 + ts-jest isolatedModules 噪音） | Claude Code | ✅ DONE（PR #22） |

> 详细任务卡见下方各 `## [TASK-00X]` 区块；生产硬化 backlog 见文末。

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
- **状态**: ✅ DONE（PR #13 已合并 2026-06-03；CI 实测 stmts 95 / branch 71.6 / func 98 / lines 95，四项阈值=70）
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
- **状态**: ✅ DONE（PR #14 已合并 2026-06-03；`any` 在 #13 已修，本 PR 提规则为 error + 拆 tsconfig.eslint.json）
- **分配给**: Antigravity
- **分支**: `agent/antigravity/toolchain-cleanup`
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

## [TASK-006] 健康附件数量上限 + assertPetOwnership 抽公共 util（安全/健壮性）
- **状态**: ✅ DONE（附件上限 PR #20 已合并 2026-06-04；assertPetOwnership 抽 util 的 dedup 部分由 PR #24 补完 2026-06-05）。
- **分配给**: Codex
- **分支**: `agent/codex/attachment-limit`
- **协调提醒**: 与 TASK-007（Antigravity）并行。TASK-006 主体是 health 附件上限（health 模块）；可选的 dedup 会动 reminders/pets service——为避免与 TASK-007 的 reminders 测试抢路径，**dedup 部分可暂缓**，先交付附件上限。
- **涉及路径**: `bestie-paw-backend/src/modules/health/*`（附件上传处）、（可选）新增 `bestie-paw-backend/src/utils/petOwnership.ts` + `health/pets/reminders` service 引用、对应 `tests/`
- **依赖**: 无（PR #16 已落地 IDOR 修复）
- **创建**: 2026-06-03　**截止**: 待定
- **来源**: 抢救自废弃分支 `claude/blissful-archimedes-252661`（提交 76d72f5）的剩余有效项；该分支安全核心（reminders IDOR）已由 PR #16 落地，此为剩余健壮性项。
- **背景**: 健康记录附件上传当前**无数量上限**，存在被滥用/DoS 的风险（单条记录可无限堆附件）。另：`assertPetOwnership` 在 health/pets/reminders 三处重复实现，可抽公共 util。
- **验收标准**:
  - [ ] 健康记录附件上传限制单条记录最多 **20** 个；超出返回 400（含已有 + 本次新增之和）
  - [ ] （可选）抽 `assertPetOwnership` 到 `utils/petOwnership.ts`，替换 health/pets/reminders 三处重复（**不改变行为**，仅去重）
  - [ ] 加测试覆盖"超上限被拒"；CI `build-and-test` 绿
  - [ ] 仅动相关模块，不改契约/`prisma/schema.prisma`
- **参考实现**: 见 blissful 分支 76d72f5（仅作参考，勿整分支合并——其多数内容已被 main 取代）

## [TASK-007] 后端剩余模块集成测试（community / users / weight / reminders / stats）
- **状态**: ✅ DONE（PR #19 已合并 2026-06-05；81 用例全过、全局覆盖率 ≥70；经 5 轮 Review 收敛）
- **分配给**: Antigravity
- **分支**: `agent/antigravity/remaining-module-tests`
- **涉及路径**: 新增 `bestie-paw-backend/tests/{community,users,weight,stats}.test.ts`、扩展 `tests/reminders.test.ts`、`bestie-paw-backend/jest.config.js`（扩 `collectCoverageFrom` + 阈值）
- **依赖**: 无（CI 容器化 Postgres 已就绪）
- **创建**: 2026-06-03　**截止**: 待定
- **背景**: 目前仅 auth/pets/health 有测试。这 5 个模块无/少测试（reminders 仅有 PR #16 的 IDOR 回归）。补齐后端测试盲区。
- **验收标准**:
  - [ ] **community**：帖子创建/列表（断言 `items` 分页信封）/详情/删除（作者权限 403）、评论增删、点赞/取消（幂等）
  - [ ] **users**：GET/PATCH /users/me（手机号唯一 409）、改密码（吊销会话后旧 token 失效）、软删除账号
  - [ ] **weight**：增/查/删；新增时 `pet.weightKg` 同步；他人宠物 403
  - [ ] **reminders**（扩展现有）：create 校验（过去日期 400）、complete、list 的 completed 过滤
  - [ ] **stats**：主要端点正常流
  - [ ] 扩展 `collectCoverageFrom` 纳入这 5 个模块；各模块行覆盖 **≥70**（确属不可达的分支按文档化方式列在 PR 描述，勿绕过/硬测）；`coverageThreshold` 维持 70；CI `build-and-test` 绿
  - [ ] **仅加测试 + 改 jest.config**；不改业务逻辑（测试若暴露 bug，只在 PR 描述记录，由架构师另开任务）
  - [ ] 邮件/SMTP 走 mock，不真实发信；不连真库（CI 容器化）
- **协调提醒**: 与 TASK-006（Codex）并行。本任务改 `jest.config.js` 的覆盖率范围；TASK-006 不动该文件，避免冲突。

## [TASK-008] CI 健壮性清理（技术债）
- **状态**: ✅ DONE（PR #22 已合并 2026-06-05；`build-and-test` CI 绿）
- **分配给**: Claude Code（架构师）
- **分支**: `agent/claudecode/ci-robustness`（已合并）
- **涉及路径**: `bestie-paw-backend/tests/globalSetup.ts`、`bestie-paw-backend/jest.config.js`（ts-jest 配置）、必要时 `bestie-paw-backend/tsconfig*.json`、`prisma/migrations/*`
- **依赖**: 无
- **创建**: 2026-06-05　**截止**: 待定
- **背景**: 多轮 Review 中暴露两处 CI 隐患（不影响功能，但会掩盖真问题）：
  - **P3018**：全新容器里 `prisma migrate deploy` 报 `relation "Reminder" does not exist`，靠 `globalSetup` 的 `db push` 兜底才建表。迁移本身可能有顺序/基线问题，被兜底掩盖。
  - **ts-jest 噪音**：`module: Node16` 下未设 `isolatedModules: true`，CI 日志被 `TS151002` 警告刷几十行，掩盖真实失败输出。
- **验收标准**:
  - [x] 排查并修复 `migrate deploy` 在干净库上失败的根因（迁移顺序/基线），使 globalSetup 不再依赖 db-push 兜底（或明确该兜底为有意设计并消除报错噪音）
  - [x] 消除 ts-jest `TS151002` 警告（设 `isolatedModules: true` 或 `diagnostics.ignoreCodes`），CI 日志干净
  - [x] CI `build-and-test` 仍绿；不改业务逻辑/测试断言
- **达成**:
  - 根因：`prisma/migrations` 缺创建基表的初始迁移（早期 db push 建库，只留两个 `*_add_*` 迁移）→ 干净库先跑 add 迁移引用未建表 → P3018。
  - 新增基线迁移 `20260529000000_init`（`migrate diff --from-empty → 旧态schema` 生成），排在两个 add 迁移之前；离线证明 `init + mig1 + mig2 == schema.prisma` 零漂移。CI 日志确认干净库 `migrate deploy` 三迁移依序应用、无 P3018、不再触发 db-push 兜底。
  - `tsconfig.json` 设 `isolatedModules: true` 消除 TS151002；typecheck / build / lint 仍绿。
- **遗留/转交**: 现有 db-push 建的 dev/prod 库需 Owner 手动 `prisma migrate resolve --applied <三个迁移>` 标记基线（详见 PR #22 描述）。全新库无需操作。

---

# Backlog — 生产硬化（Phase 3 候选，上线前按需启动，当前不做）

> 这些**不属于工程基建**，是上线/运维前的硬化项。多数需 Owner 提供凭证/基础设施或对真库操作，故不在 Phase 1 范围。需要上线时再正式拆任务、开 Phase。

| 编号 | 项 | 触发点 | 备注 |
|---|---|---|---|
| BL-1 | **文件存储改对象存储**（S3/R2） | 准备生产部署时 | 当前 multer 落本地磁盘，多实例/重启会丢文件；需 Owner 开桶+凭证 |
| BL-2 | **OAuth(Google/Apple) 端到端验证** | 上线前 | 仅配置位、未实测；需 Owner 提供真实凭证 + 人工走流程 |
| BL-3 | **可观测性**（指标/错误追踪/告警） | 准备生产部署时 | 现仅 winston 日志；需选型（Sentry/Datadog）+ 接基础设施 |
| BL-4 | **reminders cron 健壮性**（并行发信/批量更新/并发锁） | 提醒量上规模或出现问题时 | 优化非正确性；参考废弃分支 blissful 76d72f5 |
| BL-5 | **存量库迁移基线化** `migrate resolve` | 首次对现有 dev/Neon 库跑 `migrate deploy` 前 | 一次性运维步骤，仅 Owner 对真库执行；操作见 PR #22 |
| BL-6 | **上传/输入硬限制审计**（大小、类型、速率） | 上线前安全审计 | 附件数量上限已做（TASK-006）；其余输入边界待统一审计 |

