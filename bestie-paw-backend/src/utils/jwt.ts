import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type AccessTokenPayload = {
  userId: string;
  email: string;
};

export type RefreshTokenPayload = {
  userId: string;
};

export type ResetTokenPayload = {
  userId: string;
};

const durationRegex = /^(\d+)(ms|s|m|h|d)$/i;

const parseDurationMs = (value: string): number => {
  const match = durationRegex.exec(value);
  if (!match) {
    throw new Error(`Invalid duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'ms':
      return amount;
    case 's':
      return amount * 1000;
    case 'm':
      return amount * 60 * 1000;
    case 'h':
      return amount * 60 * 60 * 1000;
    case 'd':
      return amount * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported duration unit: ${unit}`);
  }
};

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  } as jwt.SignOptions);

export const signRefreshToken = (payload: RefreshTokenPayload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  } as jwt.SignOptions);

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;

export const signPasswordResetToken = (payload: ResetTokenPayload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '10m' });

export const verifyPasswordResetToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as ResetTokenPayload;

export const refreshTokenExpiresAt = () =>
  new Date(Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN));
