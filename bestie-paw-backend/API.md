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
- GET /pets/:petId/health — List health records (type, page, limit). Returns { items, total, page, limit }.
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

## Articles 养宠好文 (Auth)
> Reading + liking + favoriting are open to any signed-in user. Creating / editing / deleting articles is **ADMIN only** (maintainer), enforced by `requireAdmin` (role read from DB). No comments.

### User (any signed-in USER/ADMIN)
- GET /articles — List **published** articles (`?category=&page=&limit=`), newest first. Returns { items, total, page, limit }; each item carries the current user's `liked` and `favorited` booleans.
- GET /articles/favorites — List the current user's favorited articles, newest favorite first (`?page=&limit=`). Same envelope; items carry `liked`/`favorited`.
- GET /articles/:id — Get a single article (published only; an unpublished draft is 404 for regular users). Carries `liked`/`favorited`.
- POST /articles/:id/like — Like an article (idempotent). Returns { liked: true, likes: <new count> }.
- DELETE /articles/:id/like — Unlike an article (idempotent). Returns { liked: false, likes: <new count> }.
- POST /articles/:id/favorite — Favorite an article (idempotent). Returns { favorited: true }.
- DELETE /articles/:id/favorite — Remove from favorites (idempotent). Returns { favorited: false }.

### Maintainer (ADMIN)
- GET /articles?includeUnpublished=true — List incl. unpublished drafts (the flag only takes effect for ADMIN; ignored otherwise).
- GET /articles/:id — ADMIN may fetch an unpublished draft by id.
- POST /articles — Create. Body: { title, content, summary?, coverImageUrl?, authorName, category?, published? }. Returns the Article.
- PATCH /articles/:id — Update (all of the above fields optional). Returns the Article.
- DELETE /articles/:id — Delete (cascades likes/favorites).
