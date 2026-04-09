import connectDB from '@/lib/db/mongodb';
import Feedback from '@/lib/models/feedback.model';
import User from '@/lib/models/user.model';

interface AdminFeedbackFilters {
  minScore?: number;
  maxScore?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export async function getAllFeedback(page = 1, limit = 10, filters?: AdminFeedbackFilters) {
  await connectDB();

  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const skip = (page - 1) * safeLimit;

  const query: Record<string, unknown> = {};

  if (filters?.minScore !== undefined || filters?.maxScore !== undefined) {
    query.score = {};
    if (filters.minScore !== undefined) (query.score as Record<string, unknown>).$gte = filters.minScore;
    if (filters.maxScore !== undefined) (query.score as Record<string, unknown>).$lte = filters.maxScore;
  }
  if (filters?.dateFrom || filters?.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) (query.createdAt as Record<string, unknown>).$gte = new Date(filters.dateFrom);
    if (filters.dateTo) (query.createdAt as Record<string, unknown>).$lte = new Date(filters.dateTo);
  }
  if (filters?.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    const matchingUsers = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
    })
      .select('_id')
      .lean();
    const userIds = matchingUsers.map((u) => u._id.toString());
    query.userId = { $in: userIds };
  }

  const [feedback, total] = await Promise.all([
    Feedback.find(query).populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    Feedback.countDocuments(query),
  ]);

  return {
    data: feedback,
    meta: { total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
  };
}
