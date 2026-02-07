import Supplement, { ISupplement } from '@/lib/models/supplement.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';

export async function createSupplement(data: Partial<ISupplement>) {
  await connectDB();
  try {
    if (!data.name || !data.description || data.price === undefined) {
      throw new ValidationError('Name, description, and price are required');
    }

    if (data.price < 0) {
      throw new ValidationError('Price must be non-negative');
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new ValidationError('Stock must be non-negative');
    }

    const supplement = await Supplement.create(data);
    return supplement;
  } catch (error) {
    throw handleError(error);
  }
}

export interface SupplementFilters {
  isActive?: boolean;
  search?: string;
  minStock?: number;
  maxStock?: number;
}

export interface PaginatedSupplementsResult {
  data: ISupplement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getAllSupplementsPaginated(
  page: number = 1,
  limit: number = 10,
  filters?: SupplementFilters,
): Promise<PaginatedSupplementsResult> {
  await connectDB();
  try {
    const filter: Record<string, unknown> = {};
    if (filters?.isActive !== undefined) {
      filter.isActive = filters.isActive;
    }
    if (filters?.search && filters.search.trim()) {
      filter.$or = [
        { name: { $regex: filters.search.trim(), $options: 'i' } },
        { description: { $regex: filters.search.trim(), $options: 'i' } },
      ];
    }
    if (filters?.minStock !== undefined && filters.minStock !== null) {
      const stockCond = (filter.stock as Record<string, number>) ?? {};
      filter.stock = { ...stockCond, $gte: filters.minStock };
    }
    if (filters?.maxStock !== undefined && filters.maxStock !== null) {
      const stockCond = (filter.stock as Record<string, number>) ?? {};
      filter.stock = { ...stockCond, $lte: filters.maxStock };
    }
    const skip = (Math.max(1, page) - 1) * Math.max(1, Math.min(limit, 100));
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const [data, total] = await Promise.all([
      Supplement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      Supplement.countDocuments(filter),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));
    return { data, total, page: Math.max(1, page), limit: safeLimit, totalPages };
  } catch (error) {
    throw handleError(error);
  }
}

export async function getAllSupplements(filter: Record<string, unknown> = {}) {
  await connectDB();
  try {
    const supplements = await Supplement.find(filter).sort({ createdAt: -1 });
    return supplements;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getActiveSupplements() {
  await connectDB();
  try {
    const supplements = await Supplement.find({ isActive: true }).sort({
      createdAt: -1,
    });
    return supplements;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getSupplementById(id: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid Supplement ID');
    }
    const supplement = await Supplement.findById(id);
    if (!supplement) {
      throw new ValidationError('Supplement not found');
    }
    return supplement;
  } catch (error) {
    throw handleError(error);
  }
}

export async function updateSupplement(id: string, data: Partial<ISupplement>) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid Supplement ID');
    }

    if (data.price !== undefined && data.price < 0) {
      throw new ValidationError('Price must be non-negative');
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new ValidationError('Stock must be non-negative');
    }

    const supplement = await Supplement.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!supplement) {
      throw new ValidationError('Supplement not found');
    }
    return supplement;
  } catch (error) {
    throw handleError(error);
  }
}

export async function deleteSupplement(id: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid Supplement ID');
    }
    const supplement = await Supplement.findByIdAndDelete(id);
    if (!supplement) {
      throw new ValidationError('Supplement not found');
    }
    return { message: 'Supplement deleted successfully' };
  } catch (error) {
    throw handleError(error);
  }
}
