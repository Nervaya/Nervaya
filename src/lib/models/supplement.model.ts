import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupplement extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  ingredients: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplementSchema = new Schema<ISupplement>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
    },
    image: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock must be non-negative'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Supplement: Model<ISupplement> =
  mongoose.models.Supplement || mongoose.model<ISupplement>('Supplement', supplementSchema);

export default Supplement;
