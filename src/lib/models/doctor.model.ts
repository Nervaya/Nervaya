import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IDoctor extends Document {
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

const doctorSchema = new Schema<IDoctor>(
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

const Doctor: Model<IDoctor> = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', doctorSchema);

export default Doctor;
