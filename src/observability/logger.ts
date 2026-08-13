export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  [key: string]: any;
}

const SENSITIVE_KEYS = [
  'client_secret',
  'refresh_token',
  'access_token',
  'authorization',
  'password',
  'secret',
];

function redactSensitiveData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk));
    if (isSensitive) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const safeContext = context ? redactSensitiveData(context) : undefined;
  const contextString = safeContext ? ` | ${JSON.stringify(safeContext)}` : '';
  return `[${timestamp}] [${level}] ${message}${contextString}`;
}

export const logger = {
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog(LogLevel.DEBUG, message, context));
    }
  },
  info: (message: string, context?: LogContext) => {
    console.log(formatLog(LogLevel.INFO, message, context));
  },
  warn: (message: string, context?: LogContext) => {
    console.warn(formatLog(LogLevel.WARN, message, context));
  },
  error: (message: string, context?: LogContext) => {
    console.error(formatLog(LogLevel.ERROR, message, context));
  },
};
