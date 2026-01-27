import { NextRequest, NextResponse } from "next/server";
import {
  createQuestion,
  getAllQuestions,
} from "@/lib/services/sleepAssessmentQuestion.service";
import { defaultSleepAssessmentQuestions } from "@/utils/sleepAssessmentQuestions";
import { successResponse, errorResponse } from "@/lib/utils/response.util";
import { handleError } from "@/lib/utils/error.util";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { ROLES } from "@/lib/constants/roles";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, [ROLES.ADMIN]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const shouldReset = searchParams.get("reset") === "true";

    if (shouldReset) {
      const { deleteAllQuestions } =
        await import("@/lib/services/sleepAssessmentQuestion.service");
      await deleteAllQuestions();
    } else {
      const existingQuestions = await getAllQuestions();
      if (existingQuestions.length > 0) {
        return NextResponse.json(
          errorResponse(
            "Questions already exist. Use ?reset=true to wipe and re-seed.",
            null,
            400,
          ),
          { status: 400 },
        );
      }
    }

    const createdQuestions = [];

    for (const questionData of defaultSleepAssessmentQuestions) {
      try {
        const question = await createQuestion(questionData);
        createdQuestions.push(question);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          `Failed to create question: ${questionData.questionKey}`,
          error,
        );
      }
    }

    return NextResponse.json(
      successResponse(
        `Successfully seeded ${createdQuestions.length} questions`,
        { count: createdQuestions.length, questions: createdQuestions },
        201,
      ),
      { status: 201 },
    );
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}
