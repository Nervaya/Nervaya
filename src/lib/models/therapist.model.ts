import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IConsultingHour {
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    startTime: string; // Format: "09:00 AM"
    endTime: string; // Format: "05:00 PM"
    isEnabled: boolean;
}

export interface ITherapist extends Document {
    name: string;
    qualifications: string[];
    experience: string;
    languages: string[];
    specializations: string[];
    image?: string;
    bio?: string;
    isAvailable: boolean;
    consultingHours?: IConsultingHour[];
    createdAt: Date;
    updatedAt: Date;
}

const therapistSchema = new Schema<ITherapist>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    qualifications: {
      type: [String],
      required: [true, 'Qualifications are required'],
    },
    experience: {
      type: String,
      required: [true, 'Experience is required'],
    },
    languages: {
      type: [String],
      required: [true, 'Languages are required'],
    },
    specializations: {
      type: [String],
      required: [true, 'Specializations are required'],
    },
    image: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    consultingHours: {
      type: [
        {
          dayOfWeek: {
            type: Number,
            required: true,
            min: 0,
            max: 6,
          },
          startTime: {
            type: String,
            required: true,
          },
          endTime: {
            type: String,
            required: true,
          },
          isEnabled: {
            type: Boolean,
            default: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Therapist: Model<ITherapist> = mongoose.models.Therapist || mongoose.model<ITherapist>('Therapist', therapistSchema);

export default Therapist;
