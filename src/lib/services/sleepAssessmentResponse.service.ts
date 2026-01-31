import SleepAssessmentResponse, { ISleepAssessmentResponse } from '@/lib/models/sleepAssessmentResponse.model';
import SleepAssessmentQuestion from '@/lib/models/sleepAssessmentQuestion.model';
import connectDB from '@/lib/db/mongodb';
import { handleError, ValidationError, NotFoundError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';
import type { SubmitAssessmentInput, SaveAnswerInput, IQuestionAnswer } from '@/types/sleepAssessment.types';

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

      const optionBasedTypes = ['single_choice', 'multiple_choice', 'scale'];
      if (question.questionType === 'text' || !optionBasedTypes.includes(question.questionType)) {
        throw new ValidationError('Only option-based questions are accepted. Unsupported question type.');
      }

      if (question.questionType === 'single_choice' || question.questionType === 'scale') {
        if (typeof answer.answer !== 'string') {
          throw new ValidationError(`Single choice answer must be a string for: ${question.questionText}`);
        }

        const validOption = question.options.some((opt) => opt.value === answer.answer);
        if (!validOption && answer.answer) {
          throw new ValidationError(`Invalid option selected for: ${question.questionText}`);
        }
      }

      if (question.questionType === 'multiple_choice') {
        if (!Array.isArray(answer.answer)) {
          throw new ValidationError(`Multiple choice answer must be an array for: ${question.questionText}`);
        }

        for (const selectedValue of answer.answer) {
          const validOption = question.options.some((opt) => opt.value === selectedValue);
          if (!validOption) {
            throw new ValidationError(`Invalid option selected for: ${question.questionText}`);
          }
        }
      }

      validatedAnswers.push({
        questionId: answer.questionId,
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

export async function getInProgressAssessment(userId: string): Promise<ISleepAssessmentResponse | null> {
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new ValidationError('Invalid User ID');
    }

    const assessment = await SleepAssessmentResponse.findOne({
      userId: new Types.ObjectId(userId),
      completedAt: null,
    })
      .sort({ updatedAt: -1 })
      .lean();

    return assessment as ISleepAssessmentResponse | null;
  } catch (error) {
    throw handleError(error);
  }
}

function validateSingleAnswer(
  question: { questionType: string; questionText: string; isRequired: boolean; options: { value: string }[] },
  answer: string | string[],
): void {
  if (question.isRequired && (answer === undefined || answer === null || answer === '')) {
    throw new ValidationError(`Answer is required for: ${question.questionText}`);
  }
  if (!answer) return;

  const optionBasedTypes = ['single_choice', 'multiple_choice', 'scale'];
  if (question.questionType === 'text' || !optionBasedTypes.includes(question.questionType)) {
    throw new ValidationError('Only option-based questions are accepted. Unsupported question type.');
  }

  if (question.questionType === 'single_choice' || question.questionType === 'scale') {
    if (typeof answer !== 'string') {
      throw new ValidationError(`Single choice answer must be a string for: ${question.questionText}`);
    }
    const validOption = question.options.some((opt) => opt.value === answer);
    if (!validOption) {
      throw new ValidationError(`Invalid option selected for: ${question.questionText}`);
    }
  }

  if (question.questionType === 'multiple_choice') {
    if (!Array.isArray(answer)) {
      throw new ValidationError(`Multiple choice answer must be an array for: ${question.questionText}`);
    }
    for (const selectedValue of answer) {
      const validOption = question.options.some((opt) => opt.value === selectedValue);
      if (!validOption) {
        throw new ValidationError(`Invalid option selected for: ${question.questionText}`);
      }
    }
  }
}

export async function saveAnswer(userId: string, input: SaveAnswerInput): Promise<ISleepAssessmentResponse> {
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new ValidationError('Invalid User ID');
    }
    if (!Types.ObjectId.isValid(input.questionId)) {
      throw new ValidationError('Invalid Question ID');
    }

    const question = await SleepAssessmentQuestion.findOne({
      _id: input.questionId,
      isActive: true,
    });

    if (!question) {
      throw new ValidationError(`Invalid question ID: ${input.questionId}`);
    }

    validateSingleAnswer(
      {
        questionType: question.questionType,
        questionText: question.questionText,
        isRequired: question.isRequired,
        options: question.options,
      },
      input.answer,
    );

    let assessment = await SleepAssessmentResponse.findOne({
      userId: new Types.ObjectId(userId),
      completedAt: null,
    }).sort({ updatedAt: -1 });

    if (!assessment) {
      assessment = await SleepAssessmentResponse.create({
        userId: new Types.ObjectId(userId),
        answers: [],
        completedAt: null,
      });
    }

    const answers = [...(assessment.answers || [])];
    const existingIndex = answers.findIndex(
      (a) => (typeof a.questionId === 'object' ? a.questionId.toString() : a.questionId) === input.questionId,
    );

    const newAnswerEntry = {
      questionId: new Types.ObjectId(input.questionId),
      answer: input.answer,
    };

    if (existingIndex >= 0) {
      answers[existingIndex] = newAnswerEntry;
    } else {
      answers.push(newAnswerEntry);
    }

    assessment.answers = answers;
    await assessment.save();

    return assessment.toObject() as ISleepAssessmentResponse;
  } catch (error) {
    throw handleError(error);
  }
}

export async function completeAssessment(userId: string): Promise<ISleepAssessmentResponse> {
  await connectDB();

  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new ValidationError('Invalid User ID');
    }

    const assessment = await SleepAssessmentResponse.findOne({
      userId: new Types.ObjectId(userId),
      completedAt: null,
    }).sort({ updatedAt: -1 });

    if (!assessment) {
      throw new NotFoundError('No in-progress assessment found for this user');
    }

    if (!assessment.answers || assessment.answers.length === 0) {
      throw new ValidationError('At least one answer is required to complete the assessment');
    }

    assessment.completedAt = new Date();
    await assessment.save();

    return assessment.toObject() as ISleepAssessmentResponse;
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

export async function deleteAllResponses(): Promise<void> {
  await connectDB();

  try {
    await SleepAssessmentResponse.deleteMany({});
  } catch (error) {
    throw error;
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
