import Session, { ISession } from '@/lib/models/session.model';
import TherapistSlot from '@/lib/models/therapistSlot.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

export async function createSession(
    userId: string,
    therapistId: string,
    date: string,
    startTime: string,
) {
    await connectDB();
    
    try {
        if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(therapistId)) {
            throw new ValidationError('Invalid User ID or Therapist ID');
        }

        // Use transaction to ensure atomicity
        const dbSession = await mongoose.startSession();
        let createdSession: ISession;

        try {
            await dbSession.withTransaction(async () => {
                // Double-check slot availability within transaction
                const slot = await TherapistSlot.findOne({
                    therapistId,
                    date,
                    startTime,
                    isAvailable: true,
                }).session(dbSession);

                if (!slot) {
                    throw new ValidationError('Slot not available for booking');
                }

                const endTime = slot.endTime;

                // Create session
                const [sessionDoc] = await Session.create(
                    [{
                        userId,
                        therapistId,
                        date,
                        startTime,
                        endTime,
                        status: 'pending',
                    }],
                    { session: dbSession }
                );

                createdSession = sessionDoc;

                // Mark slot as unavailable
                slot.isAvailable = false;
                slot.sessionId = sessionDoc._id as Types.ObjectId;
                await slot.save({ session: dbSession });
            });

            return createdSession!;
        } finally {
            await dbSession.endSession();
        }
    } catch (error) {
        throw handleError(error);
    }
}

export async function getUserSessions(
    userId: string,
    statusFilter?: string,
) {
    await connectDB();
    try {
        if (!Types.ObjectId.isValid(userId)) {
            throw new ValidationError('Invalid User ID');
        }

        const filter: Record<string, unknown> = { userId };
        if (statusFilter) {
            filter.status = statusFilter;
        }

        const sessions = await Session.find(filter)
            .populate('therapistId')
            .sort({ date: -1, startTime: -1 });

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

        if (session.status !== 'pending') {
            throw new ValidationError('Only pending sessions can be cancelled');
        }

        session.status = 'cancelled';
        await session.save();

        const slot = await TherapistSlot.findOne({
            therapistId: session.therapistId,
            date: session.date,
            startTime: session.startTime,
        });

        if (slot) {
            slot.isAvailable = true;
            slot.sessionId = undefined;
            await slot.save();
        }

        return session;
    } catch (error) {
        throw handleError(error);
    }
}

export async function updateSessionStatus(
    sessionId: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
) {
    await connectDB();
    try {
        if (!Types.ObjectId.isValid(sessionId)) {
            throw new ValidationError('Invalid Session ID');
        }

        const session = await Session.findByIdAndUpdate(
            sessionId,
            { status },
            { new: true, runValidators: true },
        );

        if (!session) {
            throw new ValidationError('Session not found');
        }

        return session;
    } catch (error) {
        throw handleError(error);
    }
}
