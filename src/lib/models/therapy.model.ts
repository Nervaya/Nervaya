import mongoose, { Schema, Model, Document, Types } from 'mongoose';
import { CURRENCY } from '@/utils/currencyConstants';

export interface ITherapy extends Document {
    doctorId: Types.ObjectId;
    title: string;
    durationMinutes: number;
    price: number;
    currency: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const therapySchema = new Schema<ITherapy>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    currency: {
      type: String,
      default: CURRENCY.CODE,
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

const Therapy: Model<ITherapy> = mongoose.models.Therapy || mongoose.model<ITherapy>('Therapy', therapySchema);

export default Therapy;
