export function successResponse(message: string, data?: any) {
    return {
        success: true,
        message,
        data,
    };
}

export function errorResponse(message: string, error?: string) {
    return {
        success: false,
        message,
        error,
    };
}
