import { ApiResponse } from './response.util';

/**
 * Extracts a user-friendly error message from API/axios error responses.
 * Handles both ApiResponse format and generic Error instances.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as ApiResponse<null>).message;
    if (typeof msg === 'string' && msg.trim()) {
      return msg;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
