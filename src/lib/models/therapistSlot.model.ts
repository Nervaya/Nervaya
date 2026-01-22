import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ITherapistSlot extends Document {
    therapistId: mongoose.Types.ObjectId;
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    isCustomized: boolean;
    sessionId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const therapistSlotSchema = new Schema<ITherapistSlot>(
    {
        therapistId: {
            type: Schema.Types.ObjectId,
            ref: 'Therapist',
            required: [true, 'Therapist ID is required'],
            index: true,
        },
        date: {
            type: String,
            required: [true, 'Date is required'],
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
            index: true,
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
        },
        isAvailable: {
            type: Boolean,
            default: true,
            required: true,
        },
        isCustomized: {
            type: Boolean,
            default: false,
            required: true,
        },
        sessionId: {
            type: Schema.Types.ObjectId,
            ref: 'Session',
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

therapistSlotSchema.index({ therapistId: 1, date: 1 });
therapistSlotSchema.index({ therapistId: 1, date: 1, isAvailable: 1 });

const TherapistSlot: Model<ITherapistSlot> =
    mongoose.models.TherapistSlot ||
    mongoose.model<ITherapistSlot>('TherapistSlot', therapistSlotSchema);

export default TherapistSlot;
