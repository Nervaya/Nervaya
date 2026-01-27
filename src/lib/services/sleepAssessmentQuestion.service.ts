import SleepAssessmentQuestion, {
  ISleepAssessmentQuestion,
} from '@/lib/models/sleepAssessmentQuestion.model';
import connectDB from '@/lib/db/mongodb';
import { ValidationError, NotFoundError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import { validate as validateUUID } from 'uuid';
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
} from '@/types/sleepAssessment.types';

export async function getAllActiveQuestions(): Promise<
  ISleepAssessmentQuestion[]
  > {
  await connectDB();

  try {
    const questions = await SleepAssessmentQuestion.find({ isActive: true })
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
    const questions = await SleepAssessmentQuestion.find()
      .sort({ order: 1 })
      .lean();

    return questions as ISleepAssessmentQuestion[];
  } catch (error) {
    throw error;
  }
}

async function findQuestion(identifier: string) {
  if (validateUUID(identifier)) {
    return await SleepAssessmentQuestion.findOne({ questionId: identifier });
  }

  if (Types.ObjectId.isValid(identifier)) {
    return await SleepAssessmentQuestion.findById(identifier);
  }

  return await SleepAssessmentQuestion.findOne({ questionKey: identifier });
}

export async function getQuestionById(
  identifier: string,
): Promise<ISleepAssessmentQuestion> {
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

export async function getQuestionByKey(
  questionKey: string,
): Promise<ISleepAssessmentQuestion> {
  return getQuestionById(questionKey);
}

export async function createQuestion(
  input: CreateQuestionInput,
): Promise<ISleepAssessmentQuestion> {
  await connectDB();

  try {
    const existingQuestion = await SleepAssessmentQuestion.findOne({
      questionKey: input.questionKey.toLowerCase(),
    });

    if (existingQuestion) {
      throw new ValidationError('Question with this key already exists');
    }

    const question = await SleepAssessmentQuestion.create({
      ...input,
      questionKey: input.questionKey.toLowerCase(),
      isRequired: input.isRequired ?? true,
      isActive: input.isActive ?? true,
      category: input.category ?? 'general',
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
    const query = Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { questionKey: identifier };

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
    const query = Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { questionKey: identifier };

    const question = await SleepAssessmentQuestion.findOneAndDelete(query);

    if (!question) {
      throw new NotFoundError('Question not found');
    }
  } catch (error) {
    throw error;
  }
}

export async function reorderQuestions(
  questionOrders: { questionId: string; order: number }[],
): Promise<void> {
  await connectDB();

  try {
    const bulkOps = questionOrders.map(({ questionId, order }) => {
      const filter = Types.ObjectId.isValid(questionId)
        ? { _id: new Types.ObjectId(questionId) }
        : { questionKey: questionId };

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

export async function toggleQuestionActive(
  identifier: string,
  isActive: boolean,
): Promise<ISleepAssessmentQuestion> {
  await connectDB();

  try {
    const query = Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { questionKey: identifier };

    const question = await SleepAssessmentQuestion.findOneAndUpdate(
      query,
      { $set: { isActive } },
      { new: true },
    );

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
