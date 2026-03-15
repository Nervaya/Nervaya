import connectDB from '@/lib/db/mongodb';
import DriftOffResponse, { IDriftOffResponse as DriftOffResponseDocument } from '@/lib/models/driftOffResponse.model';
import DriftOffOrder from '@/lib/models/driftOffOrder.model';
import { ValidationError, NotFoundError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import type { IDriftOffResponse as DriftOffResponseDto, SaveDriftOffAnswerInput } from '@/types/driftOff.types';

type PopulatedDriftOffUser = {
  _id: Types.ObjectId;
  name: string;
  email: string;
};

type LeanDriftOffResponse = Omit<DriftOffResponseDto, 'userId' | 'user'> & {
  userId: Types.ObjectId | PopulatedDriftOffUser;
};

export async function createDriftOffResponse(
  userId: string,
  driftOffOrderId: string,
): Promise<DriftOffResponseDocument> {
  await connectDB();
  if (!Types.ObjectId.isValid(driftOffOrderId)) {
    throw new ValidationError('Invalid order ID');
  }
  const order = await DriftOffOrder.findOne({ _id: driftOffOrderId, userId, paymentStatus: 'paid' });
  if (!order) {
    throw new ValidationError('No paid Drift Off order found for this user');
  }
  const existing = await DriftOffResponse.findOne({ userId, driftOffOrderId });
  if (existing) return existing;
  return DriftOffResponse.create({ userId, driftOffOrderId, answers: [] });
}

export async function saveAnswer(
  userId: string,
  driftOffOrderId: string,
  input: SaveDriftOffAnswerInput,
): Promise<DriftOffResponseDocument> {
  await connectDB();
  let response = await DriftOffResponse.findOne({ userId, driftOffOrderId });
  if (!response) {
    response = (await createDriftOffResponse(userId, driftOffOrderId)) as Awaited<
      ReturnType<typeof DriftOffResponse.findOne>
    >;
  }
  if (!response) throw new Error('Failed to create or find drift off response');
  const idx = response.answers.findIndex((a) => String(a.questionId) === input.questionId);
  if (idx >= 0) {
    response.answers[idx].answer = input.answer;
  } else {
    response.answers.push({ questionId: input.questionId, answer: input.answer });
  }
  return response.save();
}

export async function completeDriftOffResponse(
  userId: string,
  driftOffOrderId: string,
): Promise<DriftOffResponseDocument> {
  await connectDB();
  const response = await DriftOffResponse.findOne({ userId, driftOffOrderId });
  if (!response) {
    throw new NotFoundError('Drift Off response not found');
  }
  if (response.answers.length === 0) {
    throw new ValidationError('At least one answer is required');
  }
  response.completedAt = new Date();
  return response.save();
}

export async function getDriftOffResponsesByUser(userId: string): Promise<DriftOffResponseDocument[]> {
  await connectDB();
  return DriftOffResponse.find({ userId }).sort({ createdAt: -1 });
}

export async function getLatestDriftOffResponse(userId: string): Promise<DriftOffResponseDocument | null> {
  await connectDB();
  return DriftOffResponse.findOne({ userId, completedAt: { $ne: null } }).sort({ completedAt: -1 });
}

export async function getDriftOffResponseById(responseId: string): Promise<DriftOffResponseDocument> {
  await connectDB();
  if (!Types.ObjectId.isValid(responseId)) {
    throw new ValidationError('Invalid response ID');
  }
  const response = await DriftOffResponse.findById(responseId);
  if (!response) throw new NotFoundError('Drift Off response not found');
  return response;
}

export async function getAllDriftOffResponses(): Promise<DriftOffResponseDto[]> {
  await connectDB();
  const responses = await DriftOffResponse.find().populate('userId', 'name email').sort({ createdAt: -1 }).lean();

  return (responses as unknown as LeanDriftOffResponse[]).map((response) => {
    const userRef = response.userId;
    const isPopulatedUser = typeof userRef === 'object' && userRef != null && 'name' in userRef && 'email' in userRef;

    return {
      ...response,
      user: isPopulatedUser
        ? {
            ...userRef,
            _id: String(userRef._id),
          }
        : undefined,
      userId: String(isPopulatedUser ? userRef._id : userRef),
    };
  });
}

export async function assignVideo(responseId: string, videoUrl: string): Promise<DriftOffResponseDocument> {
  await connectDB();
  if (!Types.ObjectId.isValid(responseId)) {
    throw new ValidationError('Invalid response ID');
  }
  const response = await DriftOffResponse.findById(responseId);
  if (!response) throw new NotFoundError('Drift Off response not found');

  response.assignedVideoUrl = videoUrl;
  response.assignedAt = new Date();

  if (response.reSessionRequestedAt && !response.reSessionResolvedAt) {
    response.reSessionResolvedAt = new Date();
  }

  return response.save();
}

export async function requestReSession(userId: string, responseId: string): Promise<DriftOffResponseDocument> {
  await connectDB();
  if (!Types.ObjectId.isValid(responseId)) {
    throw new ValidationError('Invalid response ID');
  }

  const response = await DriftOffResponse.findOne({ _id: responseId, userId });
  if (!response) {
    throw new NotFoundError('Drift Off response not found');
  }

  if (!response.completedAt) {
    throw new ValidationError('Complete the assessment before requesting a re-session');
  }

  if (!response.assignedVideoUrl) {
    throw new ValidationError('A video must be assigned before requesting a re-session');
  }

  if (response.reSessionRequestedAt) {
    throw new ValidationError('You can request a re-session only once for this session');
  }

  response.reSessionRequestedAt = new Date();
  response.reSessionResolvedAt = null;
  return response.save();
}
