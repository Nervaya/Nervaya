import { NextRequest, NextResponse } from 'next/server';
import {
    getAllActiveQuestions,
    getAllQuestions,
    createQuestion,
} from '@/lib/services/sleepAssessmentQuestion.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';

export async function GET(req: NextRequest) {
    try {
        const authResult = await requireAuth(req, [ROLES.CUSTOMER, ROLES.ADMIN]);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { searchParams } = new URL(req.url);
        const includeInactive = searchParams.get('includeInactive') === 'true';

        const isAdmin = authResult.user.role === ROLES.ADMIN;
        const questions = isAdmin && includeInactive
            ? await getAllQuestions()
            : await getAllActiveQuestions();

        return NextResponse.json(
            successResponse('Questions fetched successfully', questions),
        );
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(
            errorResponse(message, errData, statusCode),
            { status: statusCode },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const authResult = await requireAuth(req, [ROLES.ADMIN]);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const body = await req.json();

        if (!body || typeof body !== 'object') {
            return NextResponse.json(
                errorResponse('Invalid request body', null, 400),
                { status: 400 },
            );
        }

        const { questionKey, questionText, questionType, options, order, isRequired, isActive, category } = body;

        if (!questionKey || !questionText || !questionType || !order) {
            return NextResponse.json(
                errorResponse(
                    'Missing required fields: questionKey, questionText, questionType, order',
                    null,
                    400,
                ),
                { status: 400 },
            );
        }

        const question = await createQuestion({
            questionKey,
            questionText,
            questionType,
            options: options || [],
            order,
            isRequired,
            isActive,
            category,
        });

        return NextResponse.json(
            successResponse('Question created successfully', question, 201),
            { status: 201 },
        );
    } catch (error) {
        const { message, statusCode, error: errData } = handleError(error);
        return NextResponse.json(
            errorResponse(message, errData, statusCode),
            { status: statusCode },
        );
    }
}
