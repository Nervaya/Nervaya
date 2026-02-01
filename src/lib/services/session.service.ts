import Session from '@/lib/models/session.model';
import { releaseSlot } from '@/lib/services/therapistSchedule.service';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import { SESSION_STATUS, SessionStatus } from '@/lib/constants/enums';

export async function createSession(userId: string, therapistId: string, date: string, startTime: string) {
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(therapistId)) {
      throw new ValidationError('Invalid User ID or Therapist ID');
    }

    const startHour = parseInt(startTime.split(':')[0]);
    const isPM = startTime.includes('PM');
    const hour24 = isPM && startHour !== 12 ? startHour + 12 : !isPM && startHour === 12 ? 0 : startHour;

    const endHour = hour24 + 1;
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    const displayEndHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour === 12 ? 12 : endHour;

    const endTime = `${displayEndHour}:00 ${endPeriod}`;

    const existingSession = await Session.findOne({
      therapistId,
      date,
      startTime,
      status: { $ne: SESSION_STATUS.CANCELLED },
    });

    if (existingSession) {
      throw new ValidationError('Slot is already booked');
    }

    const session = await Session.create({
      userId,
      therapistId,
      date,
      startTime,
      endTime,
      status: SESSION_STATUS.PENDING,
    });

    return session;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getUserSessions(userId: string, statusFilter?: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new ValidationError('Invalid User ID');
    }

    const filter: Record<string, unknown> = { userId };
    if (statusFilter) {
      filter.status = statusFilter;
    }

    const sessions = await Session.find(filter).populate('therapistId').sort({ date: -1, startTime: -1 });

    return sessions;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getSessionById(sessionId: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(sessionId)) {
      throw new ValidationError('Invalid Session ID');
    }

    const session = await Session.findById(sessionId).populate('therapistId');

    if (!session) {
      throw new ValidationError('Session not found');
    }

    return session;
  } catch (error) {
    throw handleError(error);
  }
}

export async function cancelSession(sessionId: string, userId: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(sessionId) || !Types.ObjectId.isValid(userId)) {
      throw new ValidationError('Invalid Session ID or User ID');
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      throw new ValidationError('Session not found');
    }

    if (session.userId.toString() !== userId) {
      throw new ValidationError('Unauthorized to cancel this session');
    }

    if (session.status !== SESSION_STATUS.PENDING) {
      throw new ValidationError('Only pending sessions can be cancelled');
    }

    session.status = SESSION_STATUS.CANCELLED;
    await session.save();

    await releaseSlot(session.therapistId.toString(), session.date, session.startTime);

    return session;
  } catch (error) {
    throw handleError(error);
  }
}

export async function updateSessionStatus(sessionId: string, status: SessionStatus) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(sessionId)) {
      throw new ValidationError('Invalid Session ID');
    }

    const session = await Session.findByIdAndUpdate(sessionId, { status }, { new: true, runValidators: true });

    if (!session) {
      throw new ValidationError('Session not found');
    }

    return session;
  } catch (error) {
    throw handleError(error);
  }
}
