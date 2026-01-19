import Therapy, { ITherapy } from '@/lib/models/therapy.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';

export async function createTherapy(data: Partial<ITherapy>) {
  await connectDB();
  try {
    const therapy = await Therapy.create(data);
    return therapy;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getAllTherapies(filter: Record<string, unknown> = {}) {
  await connectDB();
  try {
    // Populate doctor details for display
    const therapies = await Therapy.find(filter)
      .populate('doctorId', 'name qualifications image')
      .sort({ createdAt: -1 });
    return therapies;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getTherapyById(id: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid Therapy ID');
    }
    const therapy = await Therapy.findById(id).populate('doctorId', 'name qualifications image');
    if (!therapy) {
      throw new ValidationError('Therapy not found');
    }
    return therapy;
  } catch (error) {
    throw handleError(error);
  }
}

export async function updateTherapy(id: string, data: Partial<ITherapy>) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid Therapy ID');
    }

    const therapy = await Therapy.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('doctorId', 'name qualifications image');

    if (!therapy) {
      throw new ValidationError('Therapy not found');
    }
    return therapy;
  } catch (error) {
    throw handleError(error);
  }
}

export async function deleteTherapy(id: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid Therapy ID');
    }
    const therapy = await Therapy.findByIdAndDelete(id);
    if (!therapy) {
      throw new ValidationError('Therapy not found');
    }
    return { message: 'Therapy deleted successfully' };
  } catch (error) {
    throw handleError(error);
  }
}
