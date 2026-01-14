import Doctor, { IDoctor } from '@/lib/models/doctor.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';

export async function createDoctor(data: Partial<IDoctor>) {
    await connectDB();
    try {
        const doctor = await Doctor.create(data);
        return doctor;
    } catch (error) {
        throw handleError(error);
    }
}

export async function getAllDoctors(filter: Record<string, any> = {}) {
    await connectDB();
    try {
        const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
        return doctors;
    } catch (error) {
        throw handleError(error);
    }
}

export async function getDoctorById(id: string) {
    await connectDB();
    try {
        if (!Types.ObjectId.isValid(id)) {
            throw new ValidationError('Invalid Doctor ID');
        }
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            throw new ValidationError('Doctor not found');
        }
        return doctor;
    } catch (error) {
        throw handleError(error);
    }
}

export async function updateDoctor(id: string, data: Partial<IDoctor>) {
    await connectDB();
    try {
        if (!Types.ObjectId.isValid(id)) {
            throw new ValidationError('Invalid Doctor ID');
        }

        // Ensure image URL is just updated if provided, previous one is not deleted automatically as per requirement
        const doctor = await Doctor.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });

        if (!doctor) {
            throw new ValidationError('Doctor not found');
        }
        return doctor;
    } catch (error) {
        throw handleError(error);
    }
}

export async function deleteDoctor(id: string) {
    await connectDB();
    try {
        if (!Types.ObjectId.isValid(id)) {
            throw new ValidationError('Invalid Doctor ID');
        }
        const doctor = await Doctor.findByIdAndDelete(id);
        if (!doctor) {
            throw new ValidationError('Doctor not found');
        }
        return { message: 'Doctor deleted successfully' };
    } catch (error) {
        throw handleError(error);
    }
}
