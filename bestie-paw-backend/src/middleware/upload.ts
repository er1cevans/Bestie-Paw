import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { env } from '../config/env';

const uploadRoot = path.resolve(env.UPLOAD_DIR);
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${crypto.randomUUID()}${ext}`;
    cb(null, name);
  }
});

const createUpload = (allowedMimeTypes: string[], maxFileSizeMb: number) =>
  multer({
    storage,
    limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Unsupported file type'));
      }
      return cb(null, true);
    }
  });

export const avatarUpload = createUpload(
  ['image/jpeg', 'image/png', 'image/webp'],
  5
);

export const attachmentUpload = createUpload(
  ['image/jpeg', 'image/png', 'application/pdf'],
  10
);

export const postImageUpload = createUpload(
  ['image/jpeg', 'image/png', 'image/webp'],
  env.MAX_FILE_SIZE_MB
);

export const resolveFileUrl = (filename: string) => {
  if (env.UPLOAD_PUBLIC_BASE_URL) {
    return `${env.UPLOAD_PUBLIC_BASE_URL.replace(/\/$/, '')}/${filename}`;
  }

  return `/uploads/${filename}`;
};

/**
 * Best-effort removal of a previously uploaded file given its public URL.
 * Fire-and-forget: never throws, so callers can use it without awaiting.
 */
export const deleteUploadedFile = (fileUrl: string): void => {
  try {
    const base = env.UPLOAD_PUBLIC_BASE_URL
      ? `${env.UPLOAD_PUBLIC_BASE_URL.replace(/\/$/, '')}/`
      : '/uploads/';
    const filename = fileUrl.startsWith(base) ? fileUrl.slice(base.length) : null;
    if (!filename) return;
    const fullPath = path.resolve(uploadRoot, filename);
    // Guard against path traversal: only delete files inside the upload root.
    if (!fullPath.startsWith(uploadRoot)) return;
    fs.unlink(fullPath, () => {});
  } catch {
    /* ignore */
  }
};
