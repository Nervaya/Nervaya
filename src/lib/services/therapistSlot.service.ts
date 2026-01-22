import TherapistSlot, { ITherapistSlot } from '@/lib/models/therapistSlot.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';

const TIME_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
];

function calculateEndTime(startTime: string): string {
    const timeSlotIndex = TIME_SLOTS.indexOf(startTime);
    if (timeSlotIndex === -1 || timeSlotIndex === TIME_SLOTS.length - 1) {
        return startTime;
    }
    return TIME_SLOTS[timeSlotIndex + 1];
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export async function generateDefaultSlots(
    therapistId: string,
    startDate: Date = new Date(),
    numberOfDays: number = 30,
) {
    await connectDB();
    try {
        if (!Types.ObjectId.isValid(therapistId)) {
            throw new ValidationError('Invalid Therapist ID');
        }

        const slots: Partial<ITherapistSlot>[] = [];

        for (let dayOffset = 0; dayOffset < numberOfDays; dayOffset++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + dayOffset);
            const dateString = formatDate(currentDate);

            for (const startTime of TIME_SLOTS) {
                const endTime = calculateEndTime(startTime);

                slots.push({
                    therapistId: new Types.ObjectId(therapistId),
                    date: dateString,
                    startTime,
                    endTime,
                    isAvailable: true,
                    isCustomized: false,
                });
            }
        }

        const createdSlots = await TherapistSlot.insertMany(slots);
        return createdSlots;
    } catch (error) {
        throw handleError(error);
    }
}

export async function getAvailableSlots(therapistId: string, date: string) {
    await connectDB();
    try {
        if (!Types.ObjectId.isValid(therapistId)) {
            throw new ValidationError('Invalid Therapist ID');
        }

        const slots = await TherapistSlot.find({
            therapistId,
            date,
        }).sort({ startTime: 1 });

        return slots;
    } catch (error) {
        throw handleError(error);
    }
}

export async function bookSlot(slotId: string, sessionId: string) {
    await connectDB();
    try {
        if (!Types.ObjectId.isValid(slotId) || !Types.ObjectId.isValid(sessionId)) {
            throw new ValidationError('Invalid Slot ID or Session ID');
        }

        const slot = await TherapistSlot.findById(slotId);

        if (!slot) {
            throw new ValidationError('Slot not found');
        }

        if (!slot.isAvailable) {
            throw new ValidationError('Slot is already booked');
        }

        slot.isAvailable = false;
        slot.sessionId = new Types.ObjectId(sessionId);
        await slot.save();

        return slot;
    } catch (error) {
        throw handleError(error);
    }
}

export async function releaseSlot(slotId: string) {
    await connectDB();
    try {
        if (!Types.ObjectId.isValid(slotId)) {
            throw new ValidationError('Invalid Slot ID');
        }

        const slot = await TherapistSlot.findById(slotId);

        if (!slot) {
            throw new ValidationError('Slot not found');
        }

        slot.isAvailable = true;
        slot.sessionId = undefined;
        await slot.save();

        return slot;
    } catch (error) {
        throw handleError(error);
    }
}

export async function updateSlot(
    slotId: string,
    updates: Partial<ITherapistSlot>,
) {
    await connectDB();
    try {
        if (!Types.ObjectId.isValid(slotId)) {
            throw new ValidationError('Invalid Slot ID');
        }

        const slot = await TherapistSlot.findByIdAndUpdate(
            slotId,
            { ...updates, isCustomized: true },
            { new: true, runValidators: true },
        );

        if (!slot) {
            throw new ValidationError('Slot not found');
        }

        return slot;
    } catch (error) {
        throw handleError(error);
    }
}
