import { HttpErrorResponse } from '@angular/common/http';

/** Error body returned by the backend. */
interface ApiErrorBody {
  error?: string;
  fields?: Record<string, string> | null;
}

/** Thrown when the direct upload to storage fails. */
export class UploadError extends Error {
  constructor(readonly status: number) {
    super(`Upload failed with status ${status}`);
  }
}

/**
 * Turns any error into a short, friendly message for the user.
 * `fallback` is used when nothing more specific can be said (for example on server errors).
 */
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof UploadError) {
    if (err.status === 403) {
      return 'The upload link expired. Please start the upload again.';
    }
    if (err.status === 0) {
      return "We couldn't reach the storage service. Check your connection and try again.";
    }
    return fallback;
  }

  if (!(err instanceof HttpErrorResponse)) {
    return fallback;
  }

  switch (err.status) {
    case 0:
      return "We couldn't reach the server. Check your connection and try again.";
    case 401:
      return 'Your session may have expired. Please sign out and sign in again.';
    case 403:
      return "You don't have permission to do this.";
    case 502:
      return 'Our storage service is temporarily unavailable. Please try again in a moment.';
  }

  // Client errors (400, 404...): the backend message explains what to fix
  if (err.status >= 400 && err.status < 500) {
    const body = err.error as ApiErrorBody | null;
    const fieldMessages = body?.fields ? Object.values(body.fields) : [];
    if (fieldMessages.length > 0) {
      return fieldMessages.join(' ');
    }
    if (body?.error) {
      return body.error;
    }
  }

  return fallback;
}