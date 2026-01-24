import TherapistSchedule, { ITimeSlot } from '@/lib/models/therapistSchedule.model';
import Therapist, { IConsultingHour } from '@/lib/models/therapist.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function timeToMinutes(time12: string): number {
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;

    let hour = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();

    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    return hour * 60 + minutes;
}

function minutesToTime(minutes: number): string {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${String(min).padStart(2, '0')} ${period}`;
}

function generateTimeSlotsBetween(startTime: string, endTime: string): string[] {
    const slots: string[] = [];
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const lunchStart = timeToMinutes('12:00 PM');
    const lunchEnd = timeToMinutes('02:00 PM');
    const slotDuration = 60;

    let minutes = startMinutes;
    while (minutes < endMinutes) {
        const slotEnd = minutes + slotDuration;

        if (slotEnd <= lunchStart) {
            slots.push(minutesToTime(minutes));
            minutes += slotDuration;
        } else if (minutes >= lunchEnd) {
            slots.push(minutesToTime(minutes));
            minutes += slotDuration;
        } else {
            minutes = lunchEnd;
        }
    }

    return slots;
}

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

        const schedules: Array<{ therapistId: Types.ObjectId; date: string; slots: ITimeSlot[] }> = [];
        const endDate = new Date(startDate.getTime() + numberOfDays * 24 * 60 * 60 * 1000);

        for (let dayOffset = 0; dayOffset < numberOfDays; dayOffset++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + dayOffset);
            const dayOfWeek = currentDate.getDay();
            const dateString = formatDate(currentDate);

            const dayHours = consultingHours.find(
                (ch) => ch.dayOfWeek === dayOfWeek && ch.isEnabled
            );

            if (dayHours) {
                const timeSlots = generateTimeSlotsBetween(
                    dayHours.startTime,
                    dayHours.endTime
                );

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
            const dateStrings = schedules.map(s => s.date);

            await TherapistSchedule.deleteMany({
                therapistId: new Types.ObjectId(therapistId),
                date: { $in: dateStrings },
            });

            const bulkOps = schedules.map((schedule) => ({
                updateOne: {
                    filter: {
                        therapistId: schedule.therapistId,
                        date: schedule.date,
                    },
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
            date: {
                $gte: startDate,
                $lte: endDate,
            },
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

export async function bookSlot(
    therapistId: string,
    date: string,
    startTime: string,
    sessionId: string,
) {
    await connectDB();
    try {
        if (!Types.ObjectId.isValid(therapistId) || !Types.ObjectId.isValid(sessionId)) {
            throw new ValidationError('Invalid Therapist ID or Session ID');
        }

        const schedule = await TherapistSchedule.findOne({
            therapistId,
            date,
        });

        if (!schedule) {
            throw new ValidationError('Schedule not found for this date');
        }

        const slot = schedule.slots.find((s) => s.startTime === startTime);
        if (!slot) {
            throw new ValidationError('Slot not found');
        }

        if (!slot.isAvailable) {
            throw new ValidationError('Slot is already booked');
        }

        slot.isAvailable = false;
        slot.sessionId = new Types.ObjectId(sessionId);
        schedule.markModified('slots');
        await schedule.save();

        return slot;
    } catch (error) {
        throw handleError(error);
    }
}

export async function releaseSlot(
    therapistId: string,
    date: string,
    startTime: string,
) {
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
            throw new ValidationError('Schedule not found for this date');
        }

        const slot = schedule.slots.find((s) => s.startTime === startTime);
        if (!slot) {
            throw new ValidationError('Slot not found');
        }

        slot.isAvailable = true;
        slot.sessionId = undefined;
        schedule.markModified('slots');
        await schedule.save();

        return slot;
    } catch (error) {
        throw handleError(error);
    }
}

export async function updateSlot(
    therapistId: string,
    date: string,
    startTime: string,
    updates: Partial<ITimeSlot>,
) {
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
            throw new ValidationError('Schedule not found for this date');
        }

        const slot = schedule.slots.find((s) => s.startTime === startTime);
        if (!slot) {
            throw new ValidationError('Slot not found');
        }

        Object.assign(slot, updates, { isCustomized: true });
        schedule.markModified('slots');
        await schedule.save();

        return slot;
    } catch (error) {
        throw handleError(error);
    }
}

export async function createCustomSlot(
    therapistId: string,
    date: string,
    startTime: string,
    endTime: string,
    isAvailable: boolean = true,
) {
    await connectDB();
    try {
        if (!Types.ObjectId.isValid(therapistId)) {
            throw new ValidationError('Invalid Therapist ID');
        }

        const schedule = await TherapistSchedule.findOne({
            therapistId,
            date,
        });

        const newSlot: ITimeSlot = {
            startTime,
            endTime,
            isAvailable,
            isCustomized: true,
        };

        if (schedule) {
            const existingSlot = schedule.slots.find((s) => s.startTime === startTime);
            if (existingSlot) {
                throw new ValidationError('Slot already exists for this date and time');
            }
            schedule.slots.push(newSlot);
            schedule.markModified('slots');
            await schedule.save();
            return newSlot;
        } else {
            const newSchedule = await TherapistSchedule.create({
                therapistId: new Types.ObjectId(therapistId),
                date,
                slots: [newSlot],
            });
            return newSchedule.slots[0];
        }
    } catch (error) {
        throw handleError(error);
    }
}

export async function deleteSlot(
    therapistId: string,
    date: string,
    startTime: string,
) {
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
            throw new ValidationError('Schedule not found for this date');
        }

        const slotIndex = schedule.slots.findIndex((s) => s.startTime === startTime);
        if (slotIndex === -1) {
            throw new ValidationError('Slot not found');
        }

        schedule.slots.splice(slotIndex, 1);
        schedule.markModified('slots');
        await schedule.save();
        return { message: 'Slot deleted successfully' };
    } catch (error) {
        throw handleError(error);
    }
}
