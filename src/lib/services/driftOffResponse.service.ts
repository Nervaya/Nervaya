import connectDB from '@/lib/db/mongodb';
import DriftOffResponse, { IDriftOffResponse } from '@/lib/models/driftOffResponse.model';
import DriftOffOrder from '@/lib/models/driftOffOrder.model';
import { ValidationError, NotFoundError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import type { SaveDriftOffAnswerInput } from '@/types/driftOff.types';

export async function createDriftOffResponse(userId: string, driftOffOrderId: string): Promise<IDriftOffResponse> {
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
): Promise<IDriftOffResponse> {
  await connectDB();
  let response = await DriftOffResponse.findOne({ userId, driftOffOrderId });
  if (!response) {
    response = (await createDriftOffResponse(userId, driftOffOrderId)) as Awaited<
      ReturnType<typeof DriftOffResponse.findOne>
    >;
  }
  if (!response) throw new Error('Failed to create or find drift off response');
  const idx = response.answers.findIndex((a) => a.questionId === input.questionId);
  if (idx >= 0) {
    response.answers[idx].answer = input.answer;
  } else {
    response.answers.push({ questionId: input.questionId, answer: input.answer });
  }
  return response.save();
}

export async function completeDriftOffResponse(userId: string, driftOffOrderId: string): Promise<IDriftOffResponse> {
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

export async function getDriftOffResponsesByUser(userId: string): Promise<IDriftOffResponse[]> {
  await connectDB();
  return DriftOffResponse.find({ userId }).sort({ createdAt: -1 });
}

export async function getLatestDriftOffResponse(userId: string): Promise<IDriftOffResponse | null> {
  await connectDB();
  return DriftOffResponse.findOne({ userId, completedAt: { $ne: null } }).sort({ completedAt: -1 });
}

export async function getDriftOffResponseById(responseId: string): Promise<IDriftOffResponse> {
  await connectDB();
  if (!Types.ObjectId.isValid(responseId)) {
    throw new ValidationError('Invalid response ID');
  }
  const response = await DriftOffResponse.findById(responseId);
  if (!response) throw new NotFoundError('Drift Off response not found');
  return response;
}

export async function getAllDriftOffResponses(): Promise<IDriftOffResponse[]> {
  await connectDB();
  return DriftOffResponse.find().populate('userId', 'name email').sort({ createdAt: -1 });
}

export async function assignVideo(responseId: string, videoUrl: string): Promise<IDriftOffResponse> {
  await connectDB();
  if (!Types.ObjectId.isValid(responseId)) {
    throw new ValidationError('Invalid response ID');
  }
  const response = await DriftOffResponse.findByIdAndUpdate(
    responseId,
    { assignedVideoUrl: videoUrl, assignedAt: new Date() },
    { new: true },
  );
  if (!response) throw new NotFoundError('Drift Off response not found');
  return response;
}
