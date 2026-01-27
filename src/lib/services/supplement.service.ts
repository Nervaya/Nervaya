import Supplement, { ISupplement } from "@/lib/models/supplement.model";
import connectDB from "@/lib/db/mongodb";
import { handleError, ValidationError } from "@/lib/utils/error.util";
import { Types } from "mongoose";

export async function createSupplement(data: Partial<ISupplement>) {
  await connectDB();
  try {
    if (!data.name || !data.description || data.price === undefined) {
      throw new ValidationError("Name, description, and price are required");
    }

    if (data.price < 0) {
      throw new ValidationError("Price must be non-negative");
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new ValidationError("Stock must be non-negative");
    }

    const supplement = await Supplement.create(data);
    return supplement;
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

export async function getActiveSupplements(category?: string) {
  await connectDB();
  try {
    const filter: Record<string, unknown> = { isActive: true };
    if (category) {
      filter.category = category;
    }
    const supplements = await Supplement.find(filter).sort({ createdAt: -1 });
    return supplements;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getSupplementById(id: string) {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid Supplement ID");
    }
    const supplement = await Supplement.findById(id);
    if (!supplement) {
      throw new ValidationError("Supplement not found");
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
      throw new ValidationError("Invalid Supplement ID");
    }

    if (data.price !== undefined && data.price < 0) {
      throw new ValidationError("Price must be non-negative");
    }

    if (data.stock !== undefined && data.stock < 0) {
      throw new ValidationError("Stock must be non-negative");
    }

    const supplement = await Supplement.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!supplement) {
      throw new ValidationError("Supplement not found");
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
      throw new ValidationError("Invalid Supplement ID");
    }
    const supplement = await Supplement.findByIdAndDelete(id);
    if (!supplement) {
      throw new ValidationError("Supplement not found");
    }
    return { message: "Supplement deleted successfully" };
  } catch (error) {
    throw handleError(error);
  }
}

export async function getSupplementsByCategory(category: string) {
  await connectDB();
  try {
    const supplements = await Supplement.find({
      category,
      isActive: true,
    }).sort({ createdAt: -1 });
    return supplements;
  } catch (error) {
    throw handleError(error);
  }
}
