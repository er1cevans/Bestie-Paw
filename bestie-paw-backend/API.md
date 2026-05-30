# Bestie Paw API

Base URL: /api

## Auth
- POST /auth/register — Register a new user.
- POST /auth/login — Login with email and password.
- POST /auth/refresh — Refresh access token.
- POST /auth/logout — Logout and revoke refresh tokens. (Auth)
- POST /auth/verify-email — Verify email with code.
- POST /auth/resend-verification — Resend the email verification code (rate-limited; always 200 to avoid email enumeration).
- POST /auth/forgot-password — Send password reset email.
- POST /auth/reset-password — Reset password with token.

## Users (Auth)
- GET /users/me — Get current user profile.
- PATCH /users/me — Update username or phone (phone uniqueness enforced → 409 CONFLICT).
- POST /users/me/avatar — Upload user avatar (old avatar file is deleted).
- POST /users/me/password — Change password. Body: { currentPassword, newPassword }. Revokes all sessions.
- DELETE /users/me — Soft delete account.

## Pets (Auth)
- GET /pets — List pets for current user.
- POST /pets — Create a pet profile.
- GET /pets/:petId — Get pet detail with recent health/reminders.
- PATCH /pets/:petId — Update pet profile.
- DELETE /pets/:petId — Delete pet profile.
- POST /pets/:petId/avatar — Upload pet avatar.

## Health Records (Auth)
- GET /pets/:petId/health — List health records (type, page, limit). Returns { records, total, page, limit }.
- POST /pets/:petId/health — Create health record.
- GET /pets/:petId/health/:recordId — Get health record.
- PATCH /pets/:petId/health/:recordId — Update health record.
- DELETE /pets/:petId/health/:recordId — Delete health record.
- POST /pets/:petId/health/:recordId/attachments — Upload attachments.
- DELETE /pets/:petId/health/:recordId/attachments — Remove one attachment. Body: { url }. Deletes the file too.

## Weight History (Auth)
- GET /pets/:petId/weight — List weight records, newest first (optional ?limit=N, default 50).
- POST /pets/:petId/weight — Add a weight record. Body: { weightKg, recordedAt, note? }. Also syncs pet.weightKg.
- DELETE /pets/:petId/weight/:recordId — Delete a weight record (does not recompute pet.weightKg).

## Reminders (Auth)
- GET /pets/:petId/reminders — List reminders (upcoming=true; includeCompleted=true to include resolved). Completed reminders are hidden by default.
- POST /pets/:petId/reminders — Create reminder (dueDate must be in the future).
- PATCH /pets/:petId/reminders/:reminderId — Update reminder (dueDate, if provided, must be in the future).
- POST /pets/:petId/reminders/:reminderId/complete — Mark reminder as completed.
- DELETE /pets/:petId/reminders/:reminderId — Delete reminder.

## Community (Auth)
- GET /community/posts — List posts (page, limit). Returns { posts, total, page, limit }.
- POST /community/posts — Create post with images (content ≤ 2000 chars).
- GET /community/posts/:postId — Get post with comments (oldest first, each with author info).
- DELETE /community/posts/:postId — Delete post (author only).
- POST /community/posts/:postId/like — Like a post (idempotent).
- DELETE /community/posts/:postId/like — Unlike a post (idempotent).
- POST /community/posts/:postId/comments — Add comment (content ≤ 500 chars).
- DELETE /community/posts/:postId/comments/:commentId — Delete comment (author only).
