import { Role } from '@prisma/client';

/**
 * Projects a User row to the public shape returned by the API
 * (login/register responses + GET /users/me). Never exposes `passwordHash`
 * or other sensitive columns. Single source of truth for the user envelope —
 * mirror any change in `packages/shared` `User` DTO.
 */
export const sanitizeUser = (user: {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  emailVerified: boolean;
}) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  role: user.role,
  emailVerified: user.emailVerified
});
