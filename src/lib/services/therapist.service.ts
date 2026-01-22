import Therapist, { ITherapist } from '@/lib/models/therapist.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';

export async function createTherapist(data: Partial<ITherapist>) {
  await connectDB();
  try {
    const therapist = await Therapist.create(data);
    return therapist;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getAllTherapists(filter: Record<string, unknown> = {}) {
  await connectDB();
  try {
    const therapists = await Therapist.find(filter).sort({ createdAt: -1 });
    return therapists;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getTherapistById(id: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid Therapist ID');
    }
    const therapist = await Therapist.findById(id);
    if (!therapist) {
      throw new ValidationError('Therapist not found');
    }
    return therapist;
  } catch (error) {
    throw handleError(error);
  }
}

export async function updateTherapist(id: string, data: Partial<ITherapist>) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid Therapist ID');
    }

    // Ensure image URL is just updated if provided, previous one is not deleted automatically as per requirement
    const therapist = await Therapist.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!therapist) {
      throw new ValidationError('Therapist not found');
    }
    return therapist;
  } catch (error) {
    throw handleError(error);
  }
}

export async function deleteTherapist(id: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid Therapist ID');
    }
    const therapist = await Therapist.findByIdAndDelete(id);
    if (!therapist) {
      throw new ValidationError('Therapist not found');
    }
    return { message: 'Therapist deleted successfully' };
  } catch (error) {
    throw handleError(error);
  }
}
