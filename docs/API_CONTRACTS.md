# API 跨端约定（契约）

> 维护者：Claude Code（架构师）｜更新：2026-06-02
> **端点清单**见 `bestie-paw-backend/API.md`（事实源）。本文件定义所有端点共享的**跨端约定**。
> 任何 agent 不得单方面修改；变更须经架构师更新本文件。

## 1. 基址
- 所有接口前缀 `/api`。

## 2. 响应信封
成功与失败统一信封（`src/utils/response.ts`）：
```jsonc
// 成功
{ "success": true, "data": <T> }
// 失败
{ "success": false, "error": { "code": "STRING_CODE", "message": "..." , "fields"?: {...} } }
```
- 前端必须读 `data.error.code` / `data.error.message`，**不是** `data.code`。
- 校验错误可带 `fields`（字段级错误，形状为 `Record<string, string[]>`，来自 Zod `flatten().fieldErrors`），前端应透传。
- 部分 `AppError` 可带 `action`（前端可据此提示用户下一步）；`errorHandler` 会透传。
- **类型事实源**：`packages/shared` 的 `ApiSuccess<T>` / `ApiError` / `Paginated<T>`，前后端共用。

## 3. 鉴权
- 受保护端点需 `Authorization: Bearer <accessToken>`。
- access/refresh 双令牌；401 时用 `POST /auth/refresh` 续期。
- 改密码 / 注销会**吊销所有会话**。

## 4. 枚举大小写（历史踩坑点）
- 后端 Prisma 枚举为**大写**：`Role`、`PetType`、`Gender`、`NeuteredStatus`、`HealthRecordType`、`ReminderType`。
- 约定：**线缆上传输大写**。前端适配层发送时转大写、接收时转小写。新端点的枚举字段一律遵循此约定。
- `Role`（`USER` / `ADMIN`）：随 `User` DTO 下发（登录/注册/`GET /users/me`），前端据此识别"维护者"。养宠好文（articles）的增删改走 ADMIN 门禁（`requireAdmin`，403 复用 `FORBIDDEN`，无新增错误码）。

## 5. 分页信封
- **唯一字段名为 `items`**：所有列表端点统一返回 `{ items, total, page, limit }`。
- 查询参数 `page`、`limit`。
- **架构裁定（2026-06-02，决策 B）**：历史端点中 health 曾返回 `records`、community 曾返回 `posts`，属契约漂移，已统一收敛为 `items`。
- **迁移完成 ✅（2026-06-03，PR #9 / TASK-004）**：后端 health/community service、前端 `services.jsx` 适配层（含 demo 模式）、`API.md`、`health.test.ts` 已全部翻转为 `items`。现已无 `records`/`posts` 信封；所有列表端点（含未来新端点）一律用 `items`。

## 6. 错误码约定
> **事实源 = `packages/shared` 的 `ErrorCode` 联合类型**（逐项核对 `src/middleware/errorHandler.ts` + 全量 `new AppError(...)`）。下表为 2026-06-05 校准结果（修正了本节旧版把校验码误写成 `VALIDATION`、把 500 误写成 `INTERNAL_SERVER_ERROR` 的漂移）。

| code | HTTP | 来源 |
|---|---|---|
| `VALIDATION_ERROR` | 400 | `errorHandler` ZodError（**不是** `VALIDATION`） |
| `NOT_FOUND` | 404 | 各模块；资源不存在 |
| `FORBIDDEN` | 403 | 各模块；资源归属校验失败统一用它 |
| `UNAUTHORIZED` | 401 | JWT 无效 / 未认证 |
| `CONFLICT` | 409 | Prisma P2002 / 显式抛出（唯一约束冲突） |
| `INVALID_CREDENTIALS` | 401 | 登录密码错误 |
| `INVALID_REFRESH_TOKEN` | 401 | refresh 续期失败 |
| `INVALID_CODE` / `CODE_EXPIRED` | 400 | 邮箱验证码 |
| `EMAIL_NOT_VERIFIED` | 403 | 邮箱未验证 |
| `ACCOUNT_LOCKED` | 423/403 | 登录失败次数过多 |
| `PHONE_TAKEN` | 409 | 手机号已被占用 |
| `ATTACHMENT_LIMIT` | 400 | 健康记录附件超 20 |
| `UPLOAD_ERROR` / `UNSUPPORTED_FILE_TYPE` | 400 | multer / 文件类型 |
| `INTERNAL_ERROR` | 500 | 兜底（**不是** `INTERNAL_SERVER_ERROR`） |

- 前端合成码（非后端返回）：`NETWORK_ERROR`（无法连服务器）、`ERROR`（兜底）——亦在 `shared/ErrorCode` 内，因该包同时服务前端。
- 新增错误码须**同时**更新后端 + `packages/shared/ErrorCode` + 本表。

## 7. 时间与时区
- 时间戳为 ISO-8601 UTC 字符串。
- 提醒 `dueDate` 创建/更新必须为**将来**时间，否则 400。

## 8. 校验
- 入参一律 zod 校验（`*.schema.ts`）；校验失败返回 §2 失败信封 + §4 字段错误。
