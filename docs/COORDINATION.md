# Bestie Paw 多 Agent 协调规范（修订版 v2）

> 维护者：Claude Code（系统架构师 / 协调者）
> 最后更新：2026-06-02
> 参与 agent：Claude Code（架构师）、Antigravity、Codex、VS Code Copilot
> 本文件取代初版规范。修订动机见文末「修订说明」。

---

## 0. 现实定位（最重要的一条）

Antigravity / Codex / Copilot **不是自治进程**，它们没有自己的调度循环，不会主动轮询任务、开分支、提 PR。它们是**由人在各自工具里驱动的执行器**。

因此本规范的真实运作模型是：

```
架构师(Claude Code) ──写任务──▶ TASKS.md（人读的看板）
                                      │
                          人 拿着任务去驱动 ▼
                          Antigravity / Codex / Copilot ──产出──▶ PR
                                      │
架构师 ◀──Review / 合并──────────────┘
```

- **TASKS.md 是给人看的看板**，不是 agent 自动消费的队列。状态流转由架构师在合并 PR 时更新，或由驱动该 agent 的人更新。
- 任何「agent 自己会读 TASKS、自己改状态」的假设都不成立，规范不依赖它。

---

## 1. 角色与职责边界

**架构师（Claude Code）负责：**
- 架构决策（`docs/ARCHITECTURE.md`）与架构决策记录（`docs/ADR/`）
- 接口契约（`bestie-paw-backend/API.md` 为端点清单事实源 + `docs/API_CONTRACTS.md` 为跨端约定）
- 任务分解与分配（`TASKS.md`）
- PR Review、合并、里程碑发布
- 质量门禁基础设施（CI、lint、CODEOWNERS）—— 属架构层，归架构师

**架构师不负责：**
- 具体业务功能实现（除架构层/基础设施代码）
- 已分配给其他 agent 的模块内部实现

---

## 2. 真实项目结构（以现状为准）

> ⚠️ 初版规范描述的 `apps/mobile`、`apps/backend`、`packages/shared` monorepo **当前并不存在**。下面是仓库的真实结构，所有 agent 以此为准。迁移到 monorepo 需先写 ADR，不得擅自创建顶层目录。

```
bestie-paw/
├── index.html                # 前端入口（React 18 + Babel Standalone 浏览器内编译，无构建工具）
├── app/                       # 前端模块（.jsx，按页面拆分）
│   ├── main.jsx  services.jsx  ui.jsx  public.jsx
│   ├── dashboard.jsx  health.jsx  social.jsx  settings.jsx
├── bestie-paw-backend/        # 后端：Express + Prisma + PostgreSQL(Neon) + TypeScript
│   ├── src/modules/{auth,users,pets,health,weight,reminders,community,stats}/
│   ├── src/{middleware,utils,config,types}/
│   ├── prisma/{schema.prisma,migrations,seed.ts}
│   └── API.md                 # 端点清单（契约事实源之一）
├── docs/                      # 治理文档（架构师维护）
│   ├── COORDINATION.md  ARCHITECTURE.md  API_CONTRACTS.md
│   └── ADR/
├── .github/
│   ├── CODEOWNERS             # 路径归属（事前冲突预防）
│   ├── agents/                # 自定义 agent 定义
│   └── workflows/             # CI（待建，见 TASKS）
├── TASKS.md                   # 任务看板（架构师写，其他只读）
└── CHANGELOG.md
```

**未来目标（需 ADR）**：若引入 monorepo / `packages/shared` 共享类型，必须先在 `docs/ADR/` 立项，再迁移。

---

## 3. 分支与 PR 规范

### 分支命名
- `agent/claudecode/<任务>` — 架构师
- `agent/antigravity/<任务>` — Antigravity
- `agent/codex/<任务>` — Codex
- `agent/copilot/<任务>` — Copilot

> 现状说明：仓库历史使用 `claude/*` 前缀（Claude Code worktree 自动分支）。新任务一律采用上面的 `agent/<name>/<task>` 命名，便于一眼区分责任方。

### 工作隔离：每个 agent 用独立 worktree（强制）
- 每个 agent 在**自己的 git worktree** 里工作，**不得直接占用仓库主目录** `/Users/ye/Documents/Bestie Paw` 编辑。
  ```bash
  # 开任务时
  git worktree add ../bp-<agent>-<task> -b agent/<name>/<task>
  # 例：git worktree add ../bp-antigravity-api-tests -b agent/antigravity/backend-api-tests
  ```
- 理由：主目录一次只能挂一条分支。若某 agent 占着主目录改代码，架构师就无法在主目录切回 `main` 做合并，其他人看到的也是该 agent 的分支状态（看不到尚未合并的治理文件）。各用各的 worktree → 主目录始终干净可随时切 `main`，物理隔离、互不覆盖工作树。
- 任务完成且 PR 合并后回收：`git worktree remove ../bp-<agent>-<task>`。

### 一个任务 = 一条分支 = 一个 PR（整改在原 PR 上滚动）
- Review 给出 REQUEST_CHANGES 后，**在同一条分支上新增 commit 并 push**，对应 PR 自动更新，架构师在**同一个 PR** 上复审。
- **不要为整改另开 PR**，也不要关闭重开。只有切换到**新任务/新分支**时才会产生新 PR。
- 合并后**不复用旧分支**：下个任务开 `agent/<name>/<新任务>` 新分支。

### 集成分支
- **当前**：PR 直接合入 `main`（仓库现状，无 `dev`）。
- **决策**：引入 `dev` 作为集成分支前，需先建分支 + 配置分支保护（CI 必过 + 1 review）。在 CI 落地（见 TASK-002）之前，**暂不强制 `dev`**，避免空规范。过渡期 PR 仍合 `main`，但必须满足下方门禁。

---

## 4. 质量门禁：能自动化的不靠人眼

> 核心修订：初版把「类型安全 / try-catch / 测试覆盖」压给架构师人肉 Review，不可靠也不可扩展。这些下沉为 **CI 硬门禁**；人只审机器审不了的。

### 4.1 CI 硬门禁（机器判定，不绿不进入人工 Review）
| 检查 | 命令 | 现状 |
|---|---|---|
| 类型安全 | `tsc --noEmit` | ✅ 后端已零报错 |
| Lint（禁 `any` 等） | `eslint .`（规则含 `@typescript-eslint/no-explicit-any`） | ❌ 待建 |
| 单元/集成测试 | `npm test`（jest） | ❌ 框架已装，零用例 |
| 测试覆盖率阈值 | jest `coverageThreshold` | ❌ 待建 |

> CI 工作流与 lint 配置属架构层，由架构师 bootstrap（TASK-002）。在 CI 就绪前，PR 作者须在 PR 描述中**贴出本地 `tsc --noEmit` 与 `npm test` 的结果**作为临时门禁。

### 4.2 人工 Review 只看这些（机器看不了的）
1. **接口合规**：是否违反 `docs/API_CONTRACTS.md` 与 `API.md`
2. **结构合规**：文件位置/命名是否符合第 2 节
3. **设计与语义**：抽象是否合理、边界情况是否真的被覆盖、有无更简方案
4. **冲突风险**：是否触碰他人 owner 的路径（见 CODEOWNERS）

---

## 5. Review 结果（三态）

> 修订：初版二态（APPROVE / REQUEST_CHANGES）会因一个命名小 nit 逼整轮重审。

- **APPROVE** — CI 全绿且无问题，立即合并。
- **APPROVE WITH COMMENTS** — CI 全绿、仅非阻塞建议（命名、注释、可读性）。**立即合并**，建议留待后续；作者可选择本 PR 顺手改或下次改。
- **REQUEST_CHANGES** — 存在阻塞问题（破坏契约 / 安全 / 逻辑错误 / CI 红）。在 PR comment 中给出**编号修改清单**，作者改后重审。

---

## 6. 事前冲突预防（不靠事后发现）

> 修订：初版「发现文件重叠后再在 PR 注明」是事后补救。改为事前划界。

- `.github/CODEOWNERS` 声明路径归属，高风险路径（`docs/`、`prisma/schema.prisma`、`src/config/`、CI 配置）强制架构师审。
- 每个 `TASKS.md` 任务标注 **owner** 与 **涉及路径**；分配新任务时主动避开正在进行任务的路径。
- 一旦发现两任务路径重叠：在两个 PR 中互相 @ 注明，**后者暂停合并**直到前者落地。

---

## 7. 接口契约变更流程

- 端点清单事实源：`bestie-paw-backend/API.md`。
- 跨端约定（响应信封、枚举大小写、分页、错误结构、鉴权头）事实源：`docs/API_CONTRACTS.md`。
- **任何 agent 不得单方面改契约。** 需变更：先提 issue 或告知架构师 → 架构师更新契约文档（必要时写 ADR）→ 通知各方跟进。

---

## 8. TASKS.md 任务格式

```markdown
## [TASK-00X] 标题
- 状态: PENDING | IN_PROGRESS | IN_REVIEW | DONE | BLOCKED
- 分配给: <agent 名>
- 分支: agent/<name>/<task>
- 涉及路径: <用于冲突预防的路径列表>
- 依赖: TASK-00Y / 无
- 创建: YYYY-MM-DD   截止: YYYY-MM-DD   ← 绝对日期，不写「本 sprint」
- 验收标准:
  - [ ] 客观、可被 CI 或 Review 验证的条目
- 参考: docs/API_CONTRACTS.md#... 等
```

> 修订：截止一律写**绝对日期**；验收标准须客观可验证，尽量能被 CI 自动判定。

---

## 9. 启动 / 例行流程（审计而非从零）

> 修订：项目已处「飞行途中」（前后端联调、UI 已成型），不是绿地。例行流程是**审计补缺**，不是从零创建。

1. 读 `TASKS.md` 看状态
2. 读 `docs/ARCHITECTURE.md` 与契约文档
3. `gh pr list`（集成分支就绪后加 `--base dev`）查待审 PR
4. 先处理 Review，再分配新任务
5. 架构变更：先 ADR → 再更新契约 → 最后通知

---

## 10. 修订说明（相对初版的变更）

| # | 初版问题 | 本版修订 |
|---|---|---|
| 1 | 假设 agent 自治、自动维护看板 | 明确「人驱动工具」，TASKS.md = 人读看板（§0） |
| 2 | 类型/测试/错误处理靠人肉 Review | 下沉为 CI 硬门禁，人只审设计与契约（§4） |
| 3 | 结构是不存在的 monorepo | 以真实结构为准，monorepo 列为需 ADR 的未来目标（§2） |
| 4 | 依赖不存在的 `dev` 分支 | 过渡合 `main`，`dev` 待 CI 就绪再启用（§3） |
| 5 | 冲突事后发现 | CODEOWNERS + 任务标注路径，事前划界（§6） |
| 6 | Review 二态过刚 | 三态，增「附带非阻塞建议的通过」（§5） |
| 7 | 截止「本 sprint」含糊 | 绝对日期 + 客观验收（§8） |
| 8 | 启动流程假设绿地 | 改为审计补缺（§9） |
