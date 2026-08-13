import { CrmSyncStatus } from '@prisma/client';

export interface ClassifiedError {
  status: CrmSyncStatus;
  isTransient: boolean;
  requiresManualReview: boolean;
  errorCode: string;
  errorMessage: string;
}

export class ZohoRecordError extends Error {
  constructor(
    public code: string,
    message: string,
    public rawDetails?: any
  ) {
    super(message);
    this.name = 'ZohoRecordError';
  }
}

export function classifyZohoError(error: any, httpStatus?: number): ClassifiedError {
  const message = error?.message || 'Unknown error occurred during Zoho API operation';
  const code = error?.code || (httpStatus ? `HTTP_${httpStatus}` : 'UNKNOWN_ERROR');

  // Handle specific Zoho record error codes
  if (error instanceof ZohoRecordError || error?.code) {
    const errCode = (error.code || '').toUpperCase();

    if (errCode.includes('DUPLICATE') || errCode === 'DUPLICATE_DATA' || errCode === 'ALREADY_MODIFIED') {
      return {
        status: CrmSyncStatus.MANUAL_REVIEW,
        isTransient: false,
        requiresManualReview: true,
        errorCode: errCode,
        errorMessage: message,
      };
    }

    if (errCode === 'INVALID_DATA' || errCode === 'MANDATORY_NOT_FOUND') {
      return {
        status: CrmSyncStatus.FAILED,
        isTransient: false,
        requiresManualReview: false,
        errorCode: errCode,
        errorMessage: message,
      };
    }
  }

  // Handle HTTP status code classifications
  if (httpStatus) {
    switch (httpStatus) {
      case 400:
        return {
          status: CrmSyncStatus.FAILED,
          isTransient: false,
          requiresManualReview: false,
          errorCode: code,
          errorMessage: message,
        };
      case 401:
      case 403:
      case 404:
        return {
          status: CrmSyncStatus.FAILED,
          isTransient: false,
          requiresManualReview: false,
          errorCode: `AUTH_OR_CONFIG_ERROR_${httpStatus}`,
          errorMessage: message,
        };
      case 412:
        return {
          status: CrmSyncStatus.MANUAL_REVIEW,
          isTransient: false,
          requiresManualReview: true,
          errorCode: 'HTTP_412_ALREADY_MODIFIED',
          errorMessage: message,
        };
      case 429:
        return {
          status: CrmSyncStatus.RETRY_SCHEDULED,
          isTransient: true,
          requiresManualReview: false,
          errorCode: 'HTTP_429_TOO_MANY_REQUESTS',
          errorMessage: message,
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          status: CrmSyncStatus.RETRY_SCHEDULED,
          isTransient: true,
          requiresManualReview: false,
          errorCode: `HTTP_${httpStatus}_SERVER_ERROR`,
          errorMessage: message,
        };
    }
  }

  // Network timeouts, socket hangup, or connection refused
  const lowerMsg = message.toLowerCase();
  if (
    lowerMsg.includes('timeout') ||
    lowerMsg.includes('econnreset') ||
    lowerMsg.includes('econnrefused') ||
    lowerMsg.includes('fetch failed')
  ) {
    return {
      status: CrmSyncStatus.RETRY_SCHEDULED,
      isTransient: true,
      requiresManualReview: false,
      errorCode: 'NETWORK_TRANSIENT_ERROR',
      errorMessage: message,
    };
  }

  // Default fallback for unknown errors
  return {
    status: CrmSyncStatus.FAILED,
    isTransient: false,
    requiresManualReview: false,
    errorCode: code,
    errorMessage: message,
  };
}
