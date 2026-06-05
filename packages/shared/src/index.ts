// Enums
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

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'UNAUTHORIZED'
  | 'CONFLICT'
  | 'NETWORK_ERROR'
  | 'INTERNAL_SERVER_ERROR';

export type ApiError = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    fields?: Record<string, string>;
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

export type Post = {
  id: string;
  authorId: string;
  content: string;
  images: string[];
  likes: number;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
};
