import SleepAssessmentQuestion, { ISleepAssessmentQuestion } from '@/lib/models/sleepAssessmentQuestion.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError, NotFoundError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import type { CreateQuestionInput, UpdateQuestionInput } from '@/types/sleepAssessment.types';

export async function getAllActiveQuestions(): Promise<ISleepAssessmentQuestion[]> {
    await connectDB();

    try {
        const questions = await SleepAssessmentQuestion.find({ isActive: true })
            .sort({ order: 1 })
            .lean();

        return questions as ISleepAssessmentQuestion[];
    } catch (error) {
        throw handleError(error);
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
        throw handleError(error);
    }
}

export async function getQuestionById(questionId: string): Promise<ISleepAssessmentQuestion> {
    await connectDB();

    try {
        if (!Types.ObjectId.isValid(questionId)) {
            throw new ValidationError('Invalid Question ID');
        }

        const question = await SleepAssessmentQuestion.findById(questionId).lean();

        if (!question) {
            throw new NotFoundError('Question not found');
        }

        return question as ISleepAssessmentQuestion;
    } catch (error) {
        throw handleError(error);
    }
}

export async function getQuestionByKey(questionKey: string): Promise<ISleepAssessmentQuestion> {
    await connectDB();

    try {
        const question = await SleepAssessmentQuestion.findOne({ questionKey }).lean();

        if (!question) {
            throw new NotFoundError('Question not found');
        }

        return question as ISleepAssessmentQuestion;
    } catch (error) {
        throw handleError(error);
    }
}

export async function createQuestion(input: CreateQuestionInput): Promise<ISleepAssessmentQuestion> {
    await connectDB();

    try {
        const existingQuestion = await SleepAssessmentQuestion.findOne({
            questionKey: input.questionKey.toLowerCase(),
        });

        if (existingQuestion) {
            throw new ValidationError('Question with this key already exists');
        }

        const question = await SleepAssessmentQuestion.create({
            questionKey: input.questionKey.toLowerCase(),
            questionText: input.questionText,
            questionType: input.questionType,
            options: input.options,
            order: input.order,
            isRequired: input.isRequired ?? true,
            isActive: input.isActive ?? true,
            category: input.category ?? 'general',
        });

        return question.toObject() as ISleepAssessmentQuestion;
    } catch (error) {
        throw handleError(error);
    }
}

export async function updateQuestion(
    questionId: string,
    input: UpdateQuestionInput,
): Promise<ISleepAssessmentQuestion> {
    await connectDB();

    try {
        if (!Types.ObjectId.isValid(questionId)) {
            throw new ValidationError('Invalid Question ID');
        }

        const question = await SleepAssessmentQuestion.findByIdAndUpdate(
            questionId,
            { $set: input },
            { new: true, runValidators: true },
        );

        if (!question) {
            throw new NotFoundError('Question not found');
        }

        return question.toObject() as ISleepAssessmentQuestion;
    } catch (error) {
        throw handleError(error);
    }
}

export async function deleteQuestion(questionId: string): Promise<void> {
    await connectDB();

    try {
        if (!Types.ObjectId.isValid(questionId)) {
            throw new ValidationError('Invalid Question ID');
        }

        const question = await SleepAssessmentQuestion.findByIdAndDelete(questionId);

        if (!question) {
            throw new NotFoundError('Question not found');
        }
    } catch (error) {
        throw handleError(error);
    }
}

export async function reorderQuestions(
    questionOrders: { questionId: string; order: number }[],
): Promise<void> {
    await connectDB();

    try {
        const bulkOps = questionOrders.map(({ questionId, order }) => ({
            updateOne: {
                filter: { _id: new Types.ObjectId(questionId) },
                update: { $set: { order } },
            },
        }));

        await SleepAssessmentQuestion.bulkWrite(bulkOps);
    } catch (error) {
        throw handleError(error);
    }
}

export async function toggleQuestionActive(
    questionId: string,
    isActive: boolean,
): Promise<ISleepAssessmentQuestion> {
    await connectDB();

    try {
        if (!Types.ObjectId.isValid(questionId)) {
            throw new ValidationError('Invalid Question ID');
        }

        const question = await SleepAssessmentQuestion.findByIdAndUpdate(
            questionId,
            { $set: { isActive } },
            { new: true },
        );

        if (!question) {
            throw new NotFoundError('Question not found');
        }

        return question.toObject() as ISleepAssessmentQuestion;
    } catch (error) {
        throw handleError(error);
    }
}
