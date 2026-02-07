import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/models/order.model';
import Session from '@/lib/models/session.model';
import Supplement from '@/lib/models/supplement.model';
import User from '@/lib/models/user.model';
import { handleError } from '@/lib/utils/error.util';
import { PAYMENT_STATUS } from '@/lib/constants/enums';
import { ROLES } from '@/lib/constants/roles';

const LOW_STOCK_THRESHOLD = 10;
const RECENT_ORDERS_LIMIT = 5;
const UPCOMING_DAYS = 7;

export interface OrderStats {
  total: number;
  byStatus: Record<string, number>;
  totalRevenue: number;
  recentOrders: unknown[];
}

export interface SessionStats {
  total: number;
  byStatus: Record<string, number>;
  upcomingCount: number;
  completedCount: number;
  upcomingSessions: unknown[];
}

export interface SupplementStats {
  total: number;
  activeCount: number;
  inactiveCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockItems: unknown[];
}

export interface UserStats {
  total: number;
  customers: number;
  admins: number;
}

export interface RevenueStats {
  total: number;
  thisMonth: number;
  lastMonth: number;
  growthPercent: number;
}

export interface DashboardStats {
  orders: OrderStats;
  sessions: SessionStats;
  supplements: SupplementStats;
  users: UserStats;
  revenue: RevenueStats;
}

export async function getOrderStats(): Promise<OrderStats> {
  await connectDB();
  try {
    const [total, byStatusAgg, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Order.find().populate('items.supplementId').sort({ createdAt: -1 }).limit(RECENT_ORDERS_LIMIT).lean(),
    ]);
    const byStatus: Record<string, number> = {};
    byStatusAgg.forEach((row: { _id: string; count: number }) => {
      byStatus[row._id] = row.count;
    });
    const paidOrders = await Order.aggregate([
      { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = paidOrders[0]?.total ?? 0;
    return { total, byStatus, totalRevenue, recentOrders };
  } catch (error) {
    throw handleError(error);
  }
}

export async function getSessionStats(): Promise<SessionStats> {
  await connectDB();
  try {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + UPCOMING_DAYS);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    const [total, byStatusAgg, upcomingSessions, completedCount] = await Promise.all([
      Session.countDocuments(),
      Session.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Session.find({
        status: { $in: ['pending', 'confirmed'] },
        date: { $gte: today, $lte: futureDateStr },
      })
        .populate('therapistId')
        .sort({ date: 1, startTime: 1 })
        .limit(10)
        .lean(),
      Session.countDocuments({ status: 'completed' }),
    ]);
    const byStatus: Record<string, number> = {};
    byStatusAgg.forEach((row: { _id: string; count: number }) => {
      byStatus[row._id] = row.count;
    });
    const upcomingCount = await Session.countDocuments({
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: today, $lte: futureDateStr },
    });
    return {
      total,
      byStatus,
      upcomingCount,
      completedCount,
      upcomingSessions,
    };
  } catch (error) {
    throw handleError(error);
  }
}

export async function getSupplementStats(): Promise<SupplementStats> {
  await connectDB();
  try {
    const [total, activeCount, inactiveCount, lowStockItems] = await Promise.all([
      Supplement.countDocuments(),
      Supplement.countDocuments({ isActive: true }),
      Supplement.countDocuments({ isActive: false }),
      Supplement.find({ stock: { $gt: 0, $lt: LOW_STOCK_THRESHOLD } })
        .select('name stock')
        .sort({ stock: 1 })
        .limit(10)
        .lean(),
    ]);
    const lowStockCount = await Supplement.countDocuments({
      stock: { $gt: 0, $lt: LOW_STOCK_THRESHOLD },
    });
    const outOfStockCount = await Supplement.countDocuments({ stock: 0 });
    return {
      total,
      activeCount,
      inactiveCount,
      lowStockCount,
      outOfStockCount,
      lowStockItems,
    };
  } catch (error) {
    throw handleError(error);
  }
}

export async function getUserStats(): Promise<UserStats> {
  await connectDB();
  try {
    const [total, customers, admins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: ROLES.CUSTOMER }),
      User.countDocuments({ role: ROLES.ADMIN }),
    ]);
    return { total, customers, admins };
  } catch (error) {
    throw handleError(error);
  }
}

export async function getRevenueStats(): Promise<RevenueStats> {
  await connectDB();
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const [totalAgg, thisMonthAgg, lastMonthAgg] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: PAYMENT_STATUS.PAID, createdAt: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        {
          $match: {
            paymentStatus: PAYMENT_STATUS.PAID,
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);
    const total = totalAgg[0]?.total ?? 0;
    const thisMonth = thisMonthAgg[0]?.total ?? 0;
    const lastMonth = lastMonthAgg[0]?.total ?? 0;
    const growthPercent =
      lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : thisMonth > 0 ? 100 : 0;
    return { total, thisMonth, lastMonth, growthPercent };
  } catch (error) {
    throw handleError(error);
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [orders, sessions, supplements, users, revenue] = await Promise.all([
    getOrderStats(),
    getSessionStats(),
    getSupplementStats(),
    getUserStats(),
    getRevenueStats(),
  ]);
  return { orders, sessions, supplements, users, revenue };
}
