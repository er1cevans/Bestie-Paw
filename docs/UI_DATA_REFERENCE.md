# Bestie Paw — 前后端接口与数据参考（UI 设计用）

> 维护者：架构师（Claude Code）｜更新：2026-06-06｜事实源：`bestie-paw-backend/API.md` + `packages/shared` 类型 + `prisma/schema.prisma`
>
> **这份文档给 UI/产品设计者看。** 它回答："每个界面背后有哪些数据、哪些状态、哪些约束和上限"，以便你设计布局、表单、空/错/载三态、文案与组件，而**不被后端实现细节绑架**。
> 这**不是**视觉规范——配色/排版/组件样式由设计自由决定。本文只锁定**数据契约**：字段、枚举值、长度上限、状态分支。UI 方向（信息架构、导航、视觉）可以推翻重做；这些数据约束在重做后依然成立。
> 现有界面仅作"已有功能盘点"参考（见 §8），不代表最终设计。

---

## 1. 全局约定（影响所有界面）

### 1.1 三态：每个数据界面都要设计 加载 / 空 / 错误
- **加载（loading）**：请求进行中。列表/详情/仪表盘都需要骨架屏或 loading 态。
- **空（empty）**：请求成功但无数据（如还没有宠物、没有健康记录、还没有收藏任何养宠好文）。**空态需要专门的插画 + 引导文案 + 主行动按钮**。
- **错误（error）**：见 §7 错误码→UI 映射。区分"字段级校验错误"（表单内联红字）与"整页/操作失败"（toast 或错误占位）。

### 1.2 鉴权与会话（影响导航与守卫）
- 双令牌：登录拿 `accessToken` + `refreshToken`。访问受保护界面需带令牌。
- 令牌过期会**自动续期**（对用户无感）；续期失败 → 跳登录页。**设计需要"会话失效后回登录"的过渡**。
- **改密码 / 注销会吊销所有会话**——其它设备会被登出。可在改密码成功提示里体现。
- **Demo 模式**：未连后端时前端可走演示数据（`demo@bestiepaw.com` / 任意密码）。当前有一个底部小角标提示"演示模式"。是否保留 demo 由设计决定。

### 1.3 分页（列表界面）
- 列表统一返回 `{ items, total, page, limit }`，参数 `page`、`limit`。
- 健康记录、养宠好文（列表 + 我的收藏）是分页列表 → 设计需考虑**翻页 / 无限滚动 / "加载更多"**其一，以及 `total` 计数展示。

### 1.4 时间
- 所有时间是 ISO-8601 UTC 字符串 → 前端按本地时区显示。设计需定"相对时间（3 天前）"还是"绝对日期"。
- **提醒 `dueDate` 必须是将来时间**（创建/编辑时过去时间会被拒）→ 日期选择器需禁用过去。

### 1.5 图片与上传
- 头像（用户、宠物）、健康记录附件涉及**用户上传**。养宠好文的封面图（`coverImageUrl`）由维护者在发布时提供，普通用户不上传。
- 健康记录**单条最多 20 个附件**（超出报错）→ 设计需有"已用 N/20"与达上限禁用态。
- 上传可能失败（类型不支持 / 体积过大）→ 需上传失败态。

---

## 2. 数据实体字典（字段 = 后端真实契约）

> 类型即 `packages/shared`。`?` = 可能为 null/缺省（设计需处理"未填"展示）。枚举值见 §6。

### User（用户）
| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | |
| `username` | string | 2–20 字符 |
| `email` | string | |
| `phone` | string? | 11 位数字，可空 |
| `avatarUrl` | string? | 头像，可空 → 需默认头像 |
| `role` | Role | `USER` / `ADMIN`；`ADMIN`=维护者，可发布/编辑/删除养宠好文。普通用户界面不应出现内容管理入口 |
| `emailVerified` | boolean | 未验证邮箱影响登录（见 §7） |

### Pet（宠物）
| 字段 | 类型 | 说明 |
|---|---|---|
| `id` / `ownerId` | string | |
| `name` | string | 必填 |
| `type` | PetType | 物种枚举，可"未知" |
| `breed` | string? | 品种 |
| `birthday` | string? (date) | 不可未来；用于算年龄 |
| `gender` | Gender | |
| `weightKg` | number? | 当前体重（与体重历史最新值同步） |
| `neutered` | NeuteredStatus | 绝育状态 |
| `allergies` | string? | ≤200 字 |
| `note` | string? | ≤300 字 |
| `avatarUrl` | string? | 宠物头像 |

### HealthRecord（健康记录）
| 字段 | 类型 | 说明 |
|---|---|---|
| `id` / `petId` | string | |
| `type` | HealthRecordType | 疫苗/体检/用药/手术/驱虫/其它 → 每类建议有图标+配色 |
| `title` | string | 必填 |
| `description` | string? | |
| `date` | string (date) | 发生日期 |
| `vetName` / `clinic` | string? | 兽医 / 诊所 |
| `attachments` | string[] | 0–20 个文件 URL |

### WeightRecord（体重历史）
| 字段 | 类型 | 说明 |
|---|---|---|
| `id` / `petId` | string | |
| `weightKg` | number | 0–200 |
| `recordedAt` | string (date) | 称重时间 → 体重趋势图 X 轴 |
| `note` | string? | ≤200 字 |

### Reminder（提醒）
| 字段 | 类型 | 说明 |
|---|---|---|
| `id` / `petId` | string | |
| `title` | string | |
| `description` | string? | |
| `type` | ReminderType | 疫苗/体检/用药/驱虫/其它 |
| `dueDate` | string (date) | 必须将来；用于排序与"即将到期" |
| `completedAt` | string? | 有值=已完成（默认列表隐藏） |
| `notified` | boolean | 是否已发提醒（系统用） |

### Article（养宠好文）
> 维护者（ADMIN）发布的科普文章；用户**只读 + 点赞 + 收藏**，不发帖、不评论。

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | |
| `title` | string | 标题，必填，≤200 字 |
| `summary` | string? | 摘要/导语，≤500 字，可空 |
| `content` | string | 正文，必填 |
| `coverImageUrl` | string? | 封面图 URL，可空 → 需默认占位 |
| `authorName` | string | 作者署名（文本，非账号），≤100 字 |
| `category` | string? | 分类标签（如"狗狗/猫咪/健康/营养"），≤50 字，可空 → 可做筛选 |
| `published` | boolean | 是否已发布（草稿对普通用户不可见） |
| `publishedAt` | string? (date) | 发布时间，可空 |
| `likes` | number | 点赞总数 |
| `liked` | boolean | **响应增强**：当前用户是否已点赞（列表/详情/收藏接口附带） |
| `favorited` | boolean | **响应增强**：当前用户是否已收藏（同上） |

---

## 3. 认证流程（界面与状态）

| 界面/动作 | 接口 | 设计要点 / 状态 |
|---|---|---|
| 注册 | `POST /auth/register` | 字段：username(2–20)、email、phone(11位,可选)、password(**≥8 且含字母+数字**)。需密码强度提示、字段级校验。 |
| 邮箱验证 | `POST /auth/verify-email`（6 位数字码）/ `resend-verification` | 注册后可能要求验证邮箱；未验证登录会被挡（`EMAIL_NOT_VERIFIED`）→ 需"去验证邮箱"引导页 + 重发码（有频率限制）。 |
| 登录 | `POST /auth/login` | 错误：密码错（`INVALID_CREDENTIALS`）、未验证（`EMAIL_NOT_VERIFIED`）、**多次失败锁定**（`ACCOUNT_LOCKED`）→ 需锁定提示。 |
| 忘记/重置密码 | `POST /auth/forgot-password` → `reset-password` | 邮件发链接/令牌；为防枚举，忘记密码**一律提示已发送**。需"检查邮箱"过渡页。 |
| 退出 | `POST /auth/logout` | |

> **AI 助手页**（现有 `/app/ai`）走第三方 AI（前端直连，无我们后端），属可选功能；设计可保留/弱化/移除。

---

## 4. 入驻引导（Onboarding）
新用户注册后通常：**创建第一只宠物 → 完成**。
- 创建宠物 `POST /pets`（仅 `name` 必填，其余可后补）→ 设计可做"最少必填、其余渐进补全"。
- 首次建档后端会发欢迎邮件（无需 UI）。
- 引导完成页可承接"去仪表盘 / 加首条健康记录 / 设第一个提醒"。

---

## 5. 主应用界面 × 数据（核心）

> 应用区是登录后的工作区，含侧边/底部导航。以下按"功能域"组织，UI 可自由重排。

### 5.1 仪表盘 Dashboard（`/app`）
聚合首页。数据来源：`GET /pets`（我的宠物）、`GET /pets/:id`（含最近 3 条健康记录 + 最近 3 条未来提醒）。
- 状态：**无宠物**（强空态 → 引导建档）、有宠物（宠物切换/卡片 + 概览）。
- 适合展示：宠物卡、即将到期提醒、最近健康动态、体重趋势缩略。

### 5.2 宠物档案 Pet Profile
- 列表 `GET /pets`；详情 `GET /pets/:id`；增 `POST /pets`；改 `PATCH`；删 `DELETE`；换头像 `POST /pets/:id/avatar`。
- 设计：宠物切换器（多宠）、档案编辑表单（字段见 §2 Pet，含枚举选择、体重、绝育、过敏/备注字数上限）、删除二次确认。

### 5.3 健康记录 Health（`/app/health`）
- 列表 `GET /pets/:petId/health?type=&page=&limit=`（**分页**，可按 `type` 过滤）；增删改查 + 附件增删。
- 设计：按类型筛选（6 类，建议图标+色），时间线/列表，记录详情含附件画廊，**附件 0–20 上限**，空态。
- 附件：`POST .../attachments` 上传、`DELETE .../attachments`（body `{ url }`）删除。

### 5.4 体重历史 Weight
- `GET /pets/:petId/weight?limit=`（默认 50，最新在前）；`POST` 新增（同步宠物当前体重）；`DELETE` 删除。
- 设计：**体重趋势折线图**（X=`recordedAt`，Y=`weightKg` 0–200）、添加体重的轻量录入、空态（无数据时的引导）。

### 5.5 提醒 Reminders（`/app/reminders`）
- `GET /pets/:petId/reminders?upcoming=&includeCompleted=`（默认隐藏已完成）；`POST` 新增（**dueDate 必须将来**）；`PATCH` 改；`.../complete` 完成；`DELETE` 删。
- 设计：即将到期/已完成分组、完成勾选交互、按类型图标、日期选择器禁用过去、空态。

### 5.6 养宠好文 Articles（`/app/articles`）
> 内容由维护者（ADMIN）发布，普通用户**只读 + 点赞 + 收藏**，**无发帖、无评论**。

- 列表 `GET /articles?category=&page=&limit=`（**分页**，仅已发布，按时间倒序，可按 `category` 筛选）；详情 `GET /articles/:id`。列表/详情每条附 `liked`/`favorited`（当前用户状态）。
- 点赞/取消 `POST|DELETE /articles/:id/like`（**幂等**，返回 `{ liked, likes }`）→ 设计需乐观更新的点赞态与点赞数。
- 收藏/取消 `POST|DELETE /articles/:id/favorite`（**幂等**，返回 `{ favorited }`）；我的收藏 `GET /articles/favorites`（**分页**，按收藏时间倒序）。
- 设计：文章信息流卡片（封面图 + 标题 + 摘要 + 分类标签 + 点赞/收藏）、阅读详情页（正文 + 作者署名 + 发布时间）、按分类筛选、点赞/收藏动效、"我的收藏"列表、空态。
- **维护者视角（ADMIN）**：发布/编辑/删除文章（`POST/PATCH/DELETE /articles`，字段见 §2 Article），可查看未发布草稿（列表 `?includeUnpublished=true`、按 id 直达）。普通用户界面**不出现**任何内容管理入口（按 `user.role` 区分）。

### 5.7 个人资料 Profile（`/app/profile`）
- `GET /users/me`；`PATCH /users/me`（改用户名/手机号，手机号唯一→冲突 `409`）；`POST /users/me/avatar`；`POST /users/me/password`（改密码→登出所有会话）；`DELETE /users/me`（**软删除账号**，需强二次确认）。

### 5.8 落地页（公开，`/`）
未登录可见的营销首页。可用公开数据 `GET /stats` → `{ registeredUsers, petProfiles }` 做"已有 N 位用户 / N 份档案"动态数字（缓存 60s）。

---

## 6. 枚举值清单（每个枚举都需设计标签/图标/配色）

> 线缆传输为**大写英文**；面向用户的中文标签/图标由设计定。下面给参考中文。

| 枚举 | 取值（英文=契约） | 参考中文 |
|---|---|---|
| **Role** | USER / ADMIN | 普通用户 / 维护者（可发布养宠好文） |
| **PetType** | DOG / CAT / RABBIT / BIRD / FISH / OTHER | 狗 / 猫 / 兔 / 鸟 / 鱼 / 其它 |
| **Gender** | MALE / FEMALE / UNKNOWN | 公 / 母 / 未知 |
| **NeuteredStatus** | YES / NO / UNKNOWN | 已绝育 / 未绝育 / 未知 |
| **HealthRecordType** | VACCINE / CHECKUP / MEDICATION / SURGERY / DEWORMING / OTHER | 疫苗 / 体检 / 用药 / 手术 / 驱虫 / 其它 |
| **ReminderType** | VACCINE / CHECKUP / MEDICATION / DEWORMING / OTHER | 疫苗 / 体检 / 用药 / 驱虫 / 其它 |

---

## 7. 错误码 → UI 状态映射（设计错误/边界态的依据）

> 失败响应：`{ success:false, error:{ code, message, fields? } }`。`fields` 为字段级错误（`Record<string,string[]>`），用于表单内联提示。

| code | 典型场景 | 建议 UI |
|---|---|---|
| `VALIDATION_ERROR` | 表单字段不合法 | 字段内联红字（用 `fields`），不弹整页错误 |
| `INVALID_CREDENTIALS` | 登录密码错 | 登录表单内提示，不指明是邮箱还是密码错 |
| `EMAIL_NOT_VERIFIED` | 未验证邮箱登录 | 引导到"验证邮箱"页 + 重发码 |
| `ACCOUNT_LOCKED` | 登录失败过多 | 锁定提示 + 稍后重试/找回密码 |
| `CONFLICT` / `PHONE_TAKEN` | 邮箱/用户名/手机号重复 | 对应字段内联"已被占用" |
| `INVALID_CODE` / `CODE_EXPIRED` | 验证码错/过期 | 验证码输入框提示 + 重发 |
| `FORBIDDEN` | 无权操作（如普通用户尝试发布/编辑/删除养宠好文，属维护者 ADMIN 权限） | 隐藏入口为主；兜底 toast |
| `NOT_FOUND` | 资源不存在/已删 | 详情页"内容不存在"占位 |
| `ATTACHMENT_LIMIT` | 附件超 20 | 达上限禁用上传 + 提示 |
| `UPLOAD_ERROR` / `UNSUPPORTED_FILE_TYPE` | 上传失败/类型不支持 | 上传组件错误态 |
| `NETWORK_ERROR` | 连不上服务器 | 全局"网络异常/离线"态 + 重试 |
| `INTERNAL_ERROR` | 服务端异常 | 友好兜底错误页/ toast |

---

## 8. 现有信息架构（仅盘点，UI 可重塑）

当前前端路由（说明已实现的功能边界，**不是**最终导航设计）：
- 公开：`/`（落地）、`/login`、`/register`、`/pet-profile`（建档）、`/complete`（完成）
- 应用（登录后，带导航壳）：`/app`（仪表盘）、`/app/health`、`/app/reminders`、`/app/articles`（养宠好文，原社区位置）、`/app/profile`、`/app/ai`（第三方 AI，可选）
- 响应式：现有实现桌面侧边栏 + 移动底部导航。

---

## 9. 给设计者的落点清单（建议交付物）
为推进前端 Phase 2 的 (b) 段（UI 耦合迁移），设计侧理想产出：
1. 信息架构 / 导航 与关键流程（注册→建档→仪表盘、加健康记录、设提醒、浏览养宠好文+点赞收藏；维护者侧的文章发布/编辑）。
2. 设计 token（色板、字体阶、间距、圆角、阴影）——会取代现有散落在 `index.html` `:root` 的变量。
3. 每个枚举的标签/图标/配色（§6）。
4. 三态规范（§1.1）：空态插画+文案、错误态、加载骨架。
5. 关键界面高保真：仪表盘、宠物档案、健康记录（列表+详情+附件）、体重趋势、提醒、养宠好文（列表+详情+收藏，维护者侧发布/编辑）、个人资料、认证组。

> 设计确定后，工程侧按 ADR 0001 的 (b) 段把 6 个视图 `.jsx→.tsx`、补组件测试、落地设计 token。本数据契约在 UI 重做后依然有效。
