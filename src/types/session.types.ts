import { Therapist } from './therapist.types';
import { SessionStatus } from '@/lib/constants/enums';

export interface Session {
  _id: string;
  userId: string;
  therapistId: string | Therapist;
  therapist?: Therapist;
  date: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TherapistSlot {
  _id: string;
  therapistId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isCustomized: boolean;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

// SessionStatus is now imported from @/lib/constants/enums

export interface CreateSessionDTO {
  therapistId: string;
  date: string;
  startTime: string;
}

export interface UpdateSessionDTO {
  status?: SessionStatus;
  date?: string;
  startTime?: string;
}
