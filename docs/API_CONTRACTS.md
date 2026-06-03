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
- 校验错误可带 `fields`（字段级错误），前端应透传。

## 3. 鉴权
- 受保护端点需 `Authorization: Bearer <accessToken>`。
- access/refresh 双令牌；401 时用 `POST /auth/refresh` 续期。
- 改密码 / 注销会**吊销所有会话**。

## 4. 枚举大小写（历史踩坑点）
- 后端 Prisma 枚举为**大写**：`PetType`、`Gender`、`NeuteredStatus`、`HealthRecordType`、`ReminderType`。
- 约定：**线缆上传输大写**。前端适配层发送时转大写、接收时转小写。新端点的枚举字段一律遵循此约定。

## 5. 分页信封
- **唯一字段名为 `items`**：所有列表端点统一返回 `{ items, total, page, limit }`。
- 查询参数 `page`、`limit`。
- **架构裁定（2026-06-02，决策 B）**：历史端点中 health 曾返回 `records`、community 曾返回 `posts`，属契约漂移，已统一收敛为 `items`。
- **迁移完成 ✅（2026-06-03，PR #9 / TASK-004）**：后端 health/community service、前端 `services.jsx` 适配层（含 demo 模式）、`API.md`、`health.test.ts` 已全部翻转为 `items`。现已无 `records`/`posts` 信封；所有列表端点（含未来新端点）一律用 `items`。

## 6. 错误码约定
- 复用 `AppError(code, message, httpStatus)`。常见：`NOT_FOUND`(404)、`FORBIDDEN`(403)、`CONFLICT`(409)、`UNAUTHORIZED`(401)、`VALIDATION`(400)。
- 资源归属校验失败统一 `FORBIDDEN`；资源不存在 `NOT_FOUND`。

## 7. 时间与时区
- 时间戳为 ISO-8601 UTC 字符串。
- 提醒 `dueDate` 创建/更新必须为**将来**时间，否则 400。

## 8. 校验
- 入参一律 zod 校验（`*.schema.ts`）；校验失败返回 §2 失败信封 + §4 字段错误。
