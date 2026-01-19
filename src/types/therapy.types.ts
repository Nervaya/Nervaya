import { Doctor } from './doctor.types';

export interface Therapy {
    _id: string;
    doctorId: string | Doctor;
    title: string;
    durationMinutes: number;
    price: number;
    currency: string;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
