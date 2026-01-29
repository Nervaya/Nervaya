import TherapistSchedule, { ITimeSlot } from '@/lib/models/therapistSchedule.model';
import Therapist from '@/lib/models/therapist.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import {
  formatDate,
  timeToMinutes,
  minutesToTime,
  generateTimeSlotsBetween,
} from '@/lib/utils/scheduleTime.util';
import { Types } from 'mongoose';

export async function generateSlotsFromConsultingHours(
  therapistId: string,
  startDate: Date = new Date(),
  numberOfDays: number = 30,
): Promise<{ insertedCount: number; modifiedCount: number }> {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(therapistId)) {
      throw new ValidationError('Invalid Therapist ID');
    }
    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      throw new ValidationError('Therapist not found');
    }
    const consultingHours = therapist.consultingHours || [];
    if (consultingHours.length === 0) {
      return { insertedCount: 0, modifiedCount: 0 };
    }
    const schedules: Array<{
      therapistId: Types.ObjectId;
      date: string;
      slots: ITimeSlot[];
    }> = [];

    for (let dayOffset = 0; dayOffset < numberOfDays; dayOffset++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + dayOffset);
      const dayOfWeek = currentDate.getDay();
      const dateString = formatDate(currentDate);
      const dayHours = consultingHours.find((ch) => ch.dayOfWeek === dayOfWeek && ch.isEnabled);

      if (dayHours) {
        const timeSlots = generateTimeSlotsBetween(dayHours.startTime, dayHours.endTime);
        const slots: ITimeSlot[] = [];
        for (let i = 0; i < timeSlots.length; i++) {
          const startTime = timeSlots[i];
          const startMinutes = timeToMinutes(startTime);
          const endMinutes = startMinutes + 60;
          const endTime = minutesToTime(endMinutes);
          slots.push({
            startTime,
            endTime,
            isAvailable: true,
            isCustomized: false,
          });
        }
        if (slots.length > 0) {
          schedules.push({
            therapistId: new Types.ObjectId(therapistId),
            date: dateString,
            slots,
          });
        }
      }
    }

    if (schedules.length > 0) {
      const dateStrings = schedules.map((s) => s.date);
      await TherapistSchedule.deleteMany({
        therapistId: new Types.ObjectId(therapistId),
        date: { $in: dateStrings },
      });
      const bulkOps = schedules.map((schedule) => ({
        updateOne: {
          filter: { therapistId: schedule.therapistId, date: schedule.date },
          update: {
            $set: {
              therapistId: schedule.therapistId,
              date: schedule.date,
              slots: schedule.slots,
            },
          },
          upsert: true,
        },
      }));
      if (bulkOps.length > 0) {
        const result = await TherapistSchedule.bulkWrite(bulkOps);
        return {
          insertedCount: result.insertedCount || 0,
          modifiedCount: result.modifiedCount || bulkOps.length,
        };
      }
    }
    return { insertedCount: 0, modifiedCount: 0 };
  } catch (error) {
    throw handleError(error);
  }
}
