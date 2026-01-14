export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string) {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Access denied') {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}

export function handleError(error: any): { message: string; statusCode: number; error: any } {
    if (error instanceof AppError) {
        return {
            message: error.message,
            statusCode: error.statusCode,
            error: null
        };
    }

    if (error.name === 'MongoServerError' && error.code === 11000) {
        return {
            message: 'User already exists',
            statusCode: 400,
            error: null
        };
    }

    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors)
            .map((err: any) => err.message)
            .join(', ');
        return {
            message,
            statusCode: 400,
            error: error.errors
        };
    }

    console.error('Unhandled error:', error);
    return {
        message: 'Internal server error',
        statusCode: 500,
        error: error.message || error
    };
}
