import SleepAssessmentResponse, { ISleepAssessmentResponse } from '@/lib/models/sleepAssessmentResponse.model';
import SleepAssessmentQuestion from '@/lib/models/sleepAssessmentQuestion.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError, NotFoundError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import type { SubmitAssessmentInput, IQuestionAnswer } from '@/types/sleepAssessment.types';

export async function submitAssessment(
  userId: string,
  input: SubmitAssessmentInput,
): Promise<ISleepAssessmentResponse> {
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new ValidationError('Invalid User ID');
    }

    if (!input.answers || input.answers.length === 0) {
      throw new ValidationError('At least one answer is required');
    }

    const questionIds = input.answers.map((a) => a.questionId);
    const questions = await SleepAssessmentQuestion.find({
      _id: { $in: questionIds },
      isActive: true,
    });

    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    const validatedAnswers: IQuestionAnswer[] = [];

    for (const answer of input.answers) {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        throw new ValidationError(`Invalid question ID: ${answer.questionId}`);
      }

      if (question.isRequired && !answer.answer) {
        throw new ValidationError(`Answer is required for: ${question.questionText}`);
      }

      if (question.questionType === 'single_choice' || question.questionType === 'scale') {
        if (typeof answer.answer !== 'string') {
          throw new ValidationError(`Single choice answer must be a string for: ${question.questionKey}`);
        }

        const validOption = question.options.some((opt) => opt.value === answer.answer);
        if (!validOption && answer.answer) {
          throw new ValidationError(`Invalid option selected for: ${question.questionKey}`);
        }
      }

      if (question.questionType === 'multiple_choice') {
        if (!Array.isArray(answer.answer)) {
          throw new ValidationError(`Multiple choice answer must be an array for: ${question.questionKey}`);
        }

        for (const selectedValue of answer.answer) {
          const validOption = question.options.some((opt) => opt.value === selectedValue);
          if (!validOption) {
            throw new ValidationError(`Invalid option selected for: ${question.questionKey}`);
          }
        }
      }

      validatedAnswers.push({
        questionId: answer.questionId,
        questionKey: question.questionKey,
        answer: answer.answer,
      });
    }

    const response = await SleepAssessmentResponse.create({
      userId: new Types.ObjectId(userId),
      answers: validatedAnswers,
      completedAt: new Date(),
    });

    return response.toObject() as ISleepAssessmentResponse;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getUserAssessments(userId: string): Promise<ISleepAssessmentResponse[]> {
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new ValidationError('Invalid User ID');
    }

    const assessments = await SleepAssessmentResponse.find({ userId }).sort({ createdAt: -1 }).lean();

    return assessments as ISleepAssessmentResponse[];
  } catch (error) {
    throw handleError(error);
  }
}

export async function getLatestUserAssessment(userId: string): Promise<ISleepAssessmentResponse | null> {
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new ValidationError('Invalid User ID');
    }

    const assessment = await SleepAssessmentResponse.findOne({ userId }).sort({ createdAt: -1 }).lean();

    return assessment as ISleepAssessmentResponse | null;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getAssessmentById(assessmentId: string): Promise<ISleepAssessmentResponse> {
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(assessmentId)) {
      throw new ValidationError('Invalid Assessment ID');
    }

    const assessment = await SleepAssessmentResponse.findById(assessmentId).lean();

    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }

    return assessment as ISleepAssessmentResponse;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getAllAssessments(): Promise<ISleepAssessmentResponse[]> {
  await connectDB();

  try {
    const assessments = await SleepAssessmentResponse.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    return assessments as ISleepAssessmentResponse[];
  } catch (error) {
    throw handleError(error);
  }
}

export async function deleteAssessment(assessmentId: string): Promise<void> {
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(assessmentId)) {
      throw new ValidationError('Invalid Assessment ID');
    }

    const assessment = await SleepAssessmentResponse.findByIdAndDelete(assessmentId);

    if (!assessment) {
      throw new NotFoundError('Assessment not found');
    }
  } catch (error) {
    throw handleError(error);
  }
}
