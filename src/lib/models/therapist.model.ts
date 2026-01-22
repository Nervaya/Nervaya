import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ITherapist extends Document {
    name: string;
    qualifications: string[];
    experience: string;
    languages: string[];
    specializations: string[];
    image?: string;
    bio?: string;
    isAvailable: boolean;
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
  },
  {
    timestamps: true,
  },
);

const Therapist: Model<ITherapist> = mongoose.models.Therapist || mongoose.model<ITherapist>('Therapist', therapistSchema);

export default Therapist;
