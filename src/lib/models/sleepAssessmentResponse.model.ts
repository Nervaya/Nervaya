import mongoose, { Schema, Model, Document } from "mongoose";

export interface IQuestionAnswer {
  questionId: mongoose.Types.ObjectId;
  questionKey: string;
  answer: string | string[];
}

export interface ISleepAssessmentResponse extends Document {
  userId: mongoose.Types.ObjectId;
  answers: IQuestionAnswer[];
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const questionAnswerSchema = new Schema<IQuestionAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "SleepAssessmentQuestion",
      required: [true, "Question ID is required"],
    },
    questionKey: {
      type: String,
      required: [true, "Question key is required"],
      trim: true,
    },
    answer: {
      type: Schema.Types.Mixed,
      required: [true, "Answer is required"],
    },
  },
  { _id: false },
);

const sleepAssessmentResponseSchema = new Schema<ISleepAssessmentResponse>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    answers: {
      type: [questionAnswerSchema],
      required: [true, "Answers are required"],
      validate: {
        validator: function (answers: IQuestionAnswer[]) {
          return answers.length > 0;
        },
        message: "At least one answer is required",
      },
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

sleepAssessmentResponseSchema.index({ userId: 1, createdAt: -1 });

const SleepAssessmentResponse: Model<ISleepAssessmentResponse> =
  mongoose.models.SleepAssessmentResponse ||
  mongoose.model<ISleepAssessmentResponse>(
    "SleepAssessmentResponse",
    sleepAssessmentResponseSchema,
  );

export default SleepAssessmentResponse;
