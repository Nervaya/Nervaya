import TherapistSchedule from '@/lib/models/therapistSchedule.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';

export async function getScheduleByDate(therapistId: string, date: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(therapistId)) {
      throw new ValidationError('Invalid Therapist ID');
    }
    const schedule = await TherapistSchedule.findOne({
      therapistId,
      date,
    });
    if (!schedule) {
      return { date, slots: [] };
    }
    return schedule;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getSchedulesByDateRange(
  therapistId: string,
  startDate: string,
  endDate: string,
  includeBooked: boolean = true,
) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(therapistId)) {
      throw new ValidationError('Invalid Therapist ID');
    }
    const filter: Record<string, unknown> = {
      therapistId,
      date: { $gte: startDate, $lte: endDate },
    };
    const schedules = await TherapistSchedule.find(filter).sort({ date: 1 });
    if (!includeBooked) {
      schedules.forEach((schedule) => {
        schedule.slots = schedule.slots.filter((slot) => slot.isAvailable);
      });
    }
    return schedules;
  } catch (error) {
    throw handleError(error);
  }
}
