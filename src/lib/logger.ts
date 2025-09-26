/**
 * Production-ready logging utility for CloneForge
 */

import { isProduction, isDevelopment } from './env';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = isProduction ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const errorDetails = error ? ` | Error: ${error.message} | Stack: ${error.stack}` : '';
    const fullMessage = this.formatMessage('ERROR', message, context) + errorDetails;
    
    console.error(fullMessage);
    
    // In production, you might want to send errors to an external service
    if (isProduction && error) {
      this.reportError(error, message, context);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    console.warn(this.formatMessage('WARN', message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    console.info(this.formatMessage('INFO', message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.debug(this.formatMessage('DEBUG', message, context));
  }

  // API request logging
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${path}`, context);
  }

  apiResponse(method: string, path: string, status: number, duration: number, context?: LogContext): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `API Response: ${method} ${path} - ${status} (${duration}ms)`;
    
    if (level === LogLevel.ERROR) {
      this.error(message, undefined, context);
    } else {
      this.info(message, context);
    }
  }

  // Payment specific logging
  paymentAttempt(userId: string, plan: string, amount: number): void {
    this.info('Payment attempt initiated', {
      userId,
      action: 'payment_attempt',
      metadata: { plan, amount }
    });
  }

  paymentSuccess(userId: string, transactionId: string, plan: string, amount: number): void {
    this.info('Payment completed successfully', {
      userId,
      action: 'payment_success',
      metadata: { transactionId, plan, amount }
    });
  }

  paymentFailure(userId: string, reason: string, plan: string): void {
    this.error('Payment failed', undefined, {
      userId,
      action: 'payment_failure',
      metadata: { reason, plan }
    });
  }

  private reportError(error: Error, message: string, context?: LogContext): void {
    // In production, send errors to monitoring service (e.g., Sentry, LogRocket)
    // For now, we'll just ensure they're properly logged
    try {
      // Example: Sentry.captureException(error, { extra: { message, context } });
      // Example: LogRocket.captureException(error);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}

// Export singleton logger instance
export const logger = new Logger();

// Middleware helper for API routes
export function withRequestLogging<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  operation: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    
    try {
      logger.info(`Starting ${operation}`);
      const result = await handler(...args);
      const duration = Date.now() - startTime;
      logger.info(`Completed ${operation} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Failed ${operation} (${duration}ms)`, error as Error);
      throw error;
    }
  };
}

export default logger;