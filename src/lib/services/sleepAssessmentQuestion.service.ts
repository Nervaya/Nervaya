import SleepAssessmentQuestion, { ISleepAssessmentQuestion } from '@/lib/models/sleepAssessmentQuestion.model';
import connectDB from '@/lib/db/mongodb';
import { NotFoundError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import { validate as validateUUID } from 'uuid';
import type { CreateQuestionInput, UpdateQuestionInput } from '@/types/sleepAssessment.types';

const OPTION_BASED_TYPES = ['single_choice', 'multiple_choice', 'scale'] as const;

export async function getAllActiveQuestions(): Promise<ISleepAssessmentQuestion[]> {
  await connectDB();

  try {
    const questions = await SleepAssessmentQuestion.find({ isActive: true }).sort({ order: 1 }).lean();

    return questions as ISleepAssessmentQuestion[];
  } catch (error) {
    throw error;
  }
}

export async function getActiveOptionBasedQuestions(): Promise<ISleepAssessmentQuestion[]> {
  await connectDB();

  try {
    const questions = await SleepAssessmentQuestion.find({
      isActive: true,
      questionType: { $in: OPTION_BASED_TYPES },
      'options.0': { $exists: true },
    })
      .sort({ order: 1 })
      .lean();

    return questions as ISleepAssessmentQuestion[];
  } catch (error) {
    throw error;
  }
}

export async function getAllQuestions(): Promise<ISleepAssessmentQuestion[]> {
  await connectDB();

  try {
    const questions = await SleepAssessmentQuestion.find().sort({ order: 1 }).lean();

    return questions as ISleepAssessmentQuestion[];
  } catch (error) {
    throw error;
  }
}

async function findQuestion(identifier: string) {
  if (Types.ObjectId.isValid(identifier)) {
    return await SleepAssessmentQuestion.findById(identifier);
  }

  if (validateUUID(identifier)) {
    return await SleepAssessmentQuestion.findOne({ questionId: identifier });
  }

  return null;
}

export async function getQuestionById(identifier: string): Promise<ISleepAssessmentQuestion> {
  await connectDB();

  try {
    const question = await findQuestion(identifier);

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    return question.toObject() as ISleepAssessmentQuestion;
  } catch (error) {
    throw error;
  }
}

export async function createQuestion(input: CreateQuestionInput): Promise<ISleepAssessmentQuestion> {
  await connectDB();

  try {
    const question = await SleepAssessmentQuestion.create({
      ...input,
      isRequired: input.isRequired ?? true,
      isActive: input.isActive ?? true,
    });

    return question.toObject() as ISleepAssessmentQuestion;
  } catch (error) {
    throw error;
  }
}

export async function updateQuestion(
  identifier: string,
  input: UpdateQuestionInput,
): Promise<ISleepAssessmentQuestion> {
  await connectDB();

  try {
    const query = Types.ObjectId.isValid(identifier) ? { _id: identifier } : { questionId: identifier };

    const question = await SleepAssessmentQuestion.findOneAndUpdate(
      query,
      { $set: input },
      { new: true, runValidators: true },
    );

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    return question.toObject() as ISleepAssessmentQuestion;
  } catch (error) {
    throw error;
  }
}

export async function deleteQuestion(identifier: string): Promise<void> {
  await connectDB();

  try {
    const query = Types.ObjectId.isValid(identifier) ? { _id: identifier } : { questionId: identifier };

    const question = await SleepAssessmentQuestion.findOneAndDelete(query);

    if (!question) {
      throw new NotFoundError('Question not found');
    }
  } catch (error) {
    throw error;
  }
}

export async function reorderQuestions(questionOrders: { questionId: string; order: number }[]): Promise<void> {
  await connectDB();

  try {
    const bulkOps = questionOrders.map(({ questionId, order }) => {
      const filter = Types.ObjectId.isValid(questionId) ? { _id: new Types.ObjectId(questionId) } : { questionId };

      return {
        updateOne: {
          filter,
          update: { $set: { order } },
        },
      };
    });

    await SleepAssessmentQuestion.bulkWrite(bulkOps);
  } catch (error) {
    throw error;
  }
}

export async function toggleQuestionActive(identifier: string, isActive: boolean): Promise<ISleepAssessmentQuestion> {
  await connectDB();

  try {
    const query = Types.ObjectId.isValid(identifier) ? { _id: identifier } : { questionId: identifier };

    const question = await SleepAssessmentQuestion.findOneAndUpdate(query, { $set: { isActive } }, { new: true });

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    return question.toObject() as ISleepAssessmentQuestion;
  } catch (error) {
    throw error;
  }
}

export async function deleteAllQuestions(): Promise<void> {
  await connectDB();

  try {
    await SleepAssessmentQuestion.deleteMany({});
  } catch (error) {
    throw error;
  }
}
