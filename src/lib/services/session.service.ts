import Session from '@/lib/models/session.model';
import { bookSlot, releaseSlot } from '@/lib/services/therapistSchedule.service';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import mongoose, { Types } from 'mongoose';
import { SESSION_STATUS, SessionStatus } from '@/lib/constants/enums';
import User from '@/lib/models/user.model';
import Therapist from '@/lib/models/therapist.model';
import { generateMeetLink, deleteMeeting } from './googleCalendar.service';
import { sendSessionConfirmationEmail } from './email/session-confirmation.service';

export async function createSession(
  userId: string,
  therapistId: string,
  date: string,
  startTime: string,
  mongooseSession?: mongoose.ClientSession,
) {
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(therapistId)) {
      throw new ValidationError('Invalid User ID or Therapist ID');
    }

    const startHour = parseInt(startTime.split(':')[0]);
    const isPM = startTime.includes('PM');
    const hour24 = isPM && startHour !== 12 ? startHour + 12 : !isPM && startHour === 12 ? 0 : startHour;
    const endTime = `${hour24 + 1 > 12 ? hour24 + 1 - 12 : hour24 + 1}:00 ${hour24 + 1 >= 12 ? 'PM' : 'AM'}`;

    const existingSession = await Session.findOne({
      therapistId,
      date,
      startTime,
      status: { $ne: SESSION_STATUS.CANCELLED },
    }).session(mongooseSession || null);

    if (existingSession) {
      throw new ValidationError('Slot is already booked');
    }

    const sessionRes = await Session.create(
      [
        {
          userId,
          therapistId,
          date,
          startTime,
          endTime,
          status: SESSION_STATUS.PENDING,
        },
      ],
      { session: mongooseSession },
    );

    const session = Array.isArray(sessionRes) ? sessionRes[0] : sessionRes;

    // --- Google Meet & Email Integration ---
    (async () => {
      try {
        const [user, therapist] = await Promise.all([
          User.findById(userId).select('email name'),
          Therapist.findById(therapistId).select('name email'),
        ]);

        if (user) {
          const { meetLink, eventId } = await generateMeetLink(
            date,
            startTime,
            `Therapy Session: ${user.name} & ${therapist?.name || 'Therapist'}`,
            `Your scheduled therapy session on Nervaya.\nCustomer: ${user.name}\nTherapist: ${therapist?.name || 'N/A'}`,
          );

          if (meetLink) {
            await Session.findByIdAndUpdate(session._id, { meetLink, googleEventId: eventId });
          }

          await sendSessionConfirmationEmail({
            email: user.email,
            name: user.name,
            therapistName: therapist?.name || 'your Therapist',
            date,
            startTime,
            meetLink: meetLink || '',
          });
        }
      } catch (integrationError) {
        console.error('Error in post-booking integration:', integrationError);
      }
    })();

    try {
      await bookSlot(therapistId, date, startTime, session._id.toString());
    } catch (bookSlotError) {
      console.error('Failed to mark slot as booked:', bookSlotError);
    }

    return session;
  } catch (error) {
    throw handleError(error);
  }
}

export async function cancelSession(sessionId: string, userId: string) {
  await connectDB();
  try {
    const session = await Session.findById(sessionId);
    if (!session) throw new ValidationError('Session not found');
    if (session.userId.toString() !== userId) throw new ValidationError('Unauthorized');

    // Allow cancelling PENDING or CONFIRMED sessions
    if (session.status !== SESSION_STATUS.PENDING && session.status !== SESSION_STATUS.CONFIRMED) {
      throw new ValidationError('Only pending or confirmed sessions can be cancelled');
    }

    const oldEventId = session.googleEventId;
    session.status = SESSION_STATUS.CANCELLED;
    await session.save();

    await releaseSlot(session.therapistId.toString(), session.date, session.startTime);

    if (oldEventId) {
      await deleteMeeting(oldEventId);
    }

    return session;
  } catch (error) {
    throw handleError(error);
  }
}

export async function rescheduleSession(sessionId: string, userId: string, newDate: string, newStartTime: string) {
  await connectDB();
  try {
    const session = await Session.findById(sessionId);
    if (!session) throw new ValidationError('Session not found');
    if (session.userId.toString() !== userId) throw new ValidationError('Unauthorized');

    if (session.status !== SESSION_STATUS.PENDING && session.status !== SESSION_STATUS.CONFIRMED) {
      throw new ValidationError('Only pending or confirmed sessions can be rescheduled');
    }

    // 1. Check if new slot is available
    const existingAtNewTime = await Session.findOne({
      therapistId: session.therapistId,
      date: newDate,
      startTime: newStartTime,
      status: { $ne: SESSION_STATUS.CANCELLED },
      _id: { $ne: session._id },
    });

    if (existingAtNewTime) throw new ValidationError('The new slot is already booked');

    const oldDate = session.date;
    const oldStartTime = session.startTime;
    const oldEventId = session.googleEventId;

    // 2. Update session details
    const startHour = parseInt(newStartTime.split(':')[0]);
    const isPM = newStartTime.includes('PM');
    const hour24 = isPM && startHour !== 12 ? startHour + 12 : !isPM && startHour === 12 ? 0 : startHour;
    const newEndTime = `${hour24 + 1 > 12 ? hour24 + 1 - 12 : hour24 + 1}:00 ${hour24 + 1 >= 12 ? 'PM' : 'AM'}`;

    session.date = newDate;
    session.startTime = newStartTime;
    session.endTime = newEndTime;
    await session.save();

    // 3. Re-mark slots in therapist schedule
    await releaseSlot(session.therapistId.toString(), oldDate, oldStartTime);
    await bookSlot(session.therapistId.toString(), newDate, newStartTime, session._id.toString());

    // 4. Update Google Calendar
    (async () => {
      try {
        if (oldEventId) await deleteMeeting(oldEventId);

        const [user, therapist] = await Promise.all([
          User.findById(userId).select('email name'),
          Therapist.findById(session.therapistId).select('name'),
        ]);

        if (user) {
          const { meetLink, eventId } = await generateMeetLink(
            newDate,
            newStartTime,
            `Rescheduled: ${user.name} & ${therapist?.name || 'Therapist'}`,
            `Your rescheduled therapy session on Nervaya.\nCustomer: ${user.name}\nTherapist: ${therapist?.name || 'N/A'}`,
          );

          await Session.findByIdAndUpdate(session._id, { meetLink, googleEventId: eventId });

          // Send rescheduled email (can reuse template or add special flag)
          await sendSessionConfirmationEmail({
            email: user.email,
            name: user.name,
            therapistName: therapist?.name || 'your Therapist',
            date: newDate,
            startTime: newStartTime,
            meetLink: meetLink || '',
          });
        }
      } catch (err) {
        console.error('Error updating Google Meet during reschedule:', err);
      }
    })();

    return session;
  } catch (error) {
    throw handleError(error);
  }
}

export async function updateSessionStatus(sessionId: string, status: SessionStatus) {
  await connectDB();
  try {
    const session = await Session.findById(sessionId);
    if (!session) throw new ValidationError('Session not found');

    const VALID_TRANSITIONS: Record<string, string[]> = {
      [SESSION_STATUS.PENDING]: [SESSION_STATUS.CONFIRMED, SESSION_STATUS.CANCELLED],
      [SESSION_STATUS.CONFIRMED]: [SESSION_STATUS.COMPLETED, SESSION_STATUS.CANCELLED],
      [SESSION_STATUS.COMPLETED]: [],
      [SESSION_STATUS.CANCELLED]: [],
    };

    if (!VALID_TRANSITIONS[session.status]?.includes(status)) {
      throw new ValidationError(`Cannot move from ${session.status} to ${status}`);
    }

    const oldEventId = session.googleEventId;
    session.status = status;
    await session.save();

    if (status === SESSION_STATUS.CANCELLED) {
      await releaseSlot(session.therapistId.toString(), session.date, session.startTime);
      if (oldEventId) await deleteMeeting(oldEventId);
    }

    return session;
  } catch (error) {
    throw handleError(error);
  }
}

// Keep existing query functions
export async function getAllSessions(
  page: number = 1,
  limit: number = 10,
  filters?: { status?: string; userId?: string; therapistId?: string } | string,
) {
  await connectDB();
  try {
    const filter: Record<string, unknown> = {};
    if (typeof filters === 'string') {
      if (filters) filter.status = filters;
    } else if (filters) {
      if (filters.status) filter.status = filters.status;
      if (filters.userId) filter.userId = filters.userId;
      if (filters.therapistId) filter.therapistId = new Types.ObjectId(filters.therapistId);
    }
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Session.find(filter).populate('therapistId').sort({ date: -1, startTime: -1 }).skip(skip).limit(limit),
      Session.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  } catch (_error) {
    throw handleError(_error);
  }
}

export async function getUserSessions(userId: string, statusFilter?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { userId };
  if (statusFilter) filter.status = statusFilter;
  return Session.find(filter).populate('therapistId').sort({ date: -1, startTime: -1 });
}

export async function getSessionById(sessionId: string) {
  await connectDB();
  return Session.findById(sessionId).populate('therapistId');
}
