// Enums
export type Role = 'USER' | 'ADMIN';
export type PetType = 'DOG' | 'CAT' | 'RABBIT' | 'BIRD' | 'FISH' | 'OTHER';
export type Gender = 'MALE' | 'FEMALE' | 'UNKNOWN';
export type NeuteredStatus = 'YES' | 'NO' | 'UNKNOWN';
export type HealthRecordType = 'VACCINE' | 'CHECKUP' | 'MEDICATION' | 'SURGERY' | 'DEWORMING' | 'OTHER';
export type ReminderType = 'VACCINE' | 'CHECKUP' | 'MEDICATION' | 'DEWORMING' | 'OTHER';

// Envelopes
export type ApiSuccess<T> = {
  success: true;
  data: T;
};

// ErrorCode — verified against the real backend, not API_CONTRACTS.md §6 (which is stale).
// Sources: src/middleware/errorHandler.ts (Zod/Prisma/JWT/multer/fallback) + every
// `new AppError('CODE', ...)` across src/modules/** + frontend-synthetic codes in app/services.jsx.
export type ErrorCode =
  // errorHandler.ts non-AppError branches
  | 'VALIDATION_ERROR' // ZodError (the real validation code; NOT 'VALIDATION')
  | 'CONFLICT' // Prisma P2002 (also thrown explicitly)
  | 'UNAUTHORIZED' // JsonWebTokenError (also thrown explicitly)
  | 'UPLOAD_ERROR' // multer.MulterError
  | 'UNSUPPORTED_FILE_TYPE'
  | 'INTERNAL_ERROR' // 500 fallback (NOT 'INTERNAL_SERVER_ERROR')
  // AppError codes thrown in src/modules/**
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'INVALID_CREDENTIALS'
  | 'INVALID_REFRESH_TOKEN'
  | 'INVALID_CODE'
  | 'CODE_EXPIRED'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_LOCKED'
  | 'PHONE_TAKEN'
  | 'ATTACHMENT_LIMIT'
  // frontend-synthetic (app/services.jsx) — shared package also serves the frontend
  | 'NETWORK_ERROR'
  | 'ERROR';

export type ApiError = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    // some AppErrors carry an `action` hint (errorHandler.ts passes it through)
    action?: string;
    // present on validation errors (ZodError flatten().fieldErrors)
    fields?: Record<string, string[]>;
  };
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

// DTOs
export type User = {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  emailVerified: boolean;
};

export type Pet = {
  id: string;
  ownerId: string;
  name: string;
  type: PetType;
  breed: string | null;
  birthday: string | null;
  gender: Gender;
  weightKg: number | null;
  neutered: NeuteredStatus;
  allergies: string | null;
  note: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HealthRecord = {
  id: string;
  petId: string;
  type: HealthRecordType;
  title: string;
  description: string | null;
  date: string;
  vetName: string | null;
  clinic: string | null;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
};

export type WeightRecord = {
  id: string;
  petId: string;
  weightKg: number;
  note: string | null;
  recordedAt: string;
  createdAt: string;
};

export type Reminder = {
  id: string;
  petId: string;
  title: string;
  description: string | null;
  type: ReminderType;
  dueDate: string;
  notified: boolean;
  completedAt: string | null;
  createdAt: string;
};

export type Article = {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  coverImageUrl: string | null;
  authorName: string;
  category: string | null;
  published: boolean;
  publishedAt: string | null;
  likes: number;
  createdAt: string;
  updatedAt: string;
  // Response enhancements: present on the user-facing read endpoints
  // (list / detail / favorites), reflecting the current user's state.
  liked?: boolean;
  favorited?: boolean;
};
