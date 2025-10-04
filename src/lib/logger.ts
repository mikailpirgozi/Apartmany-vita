/**
 * Centralized Logging System
 * Replaces console.log/error with structured logging
 * Automatically sends errors to monitoring in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  environment: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private isTest = process.env.NODE_ENV === 'test';

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    const { level, message, context, timestamp } = entry;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Send log to monitoring service (Sentry, DataDog, etc.)
   */
  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    // Only send errors and warnings to monitoring in production
    if (!this.isDevelopment && (entry.level === 'error' || entry.level === 'warn')) {
      try {
        // Send to Sentry if available
        if (typeof window !== 'undefined' && window.Sentry) {
          if (entry.level === 'error') {
            window.Sentry.captureException(new Error(entry.message), {
              contexts: { custom: entry.context }
            });
          } else {
            window.Sentry.captureMessage(entry.message, {
              level: 'warning',
              contexts: { custom: entry.context }
            });
          }
        }

        // Send to custom analytics endpoint
        await fetch('/api/analytics/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        }).catch(() => {
          // Silently fail - don't break app if logging fails
        });
      } catch (error) {
        // Silently fail - don't break app if logging fails
        console.error('Failed to send log to monitoring:', error);
      }
    }
  }

  /**
   * Create log entry
   */
  private createEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Debug log - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment && !this.isTest) {
      const entry = this.createEntry('debug', message, context);
      console.log(this.formatLog(entry));
    }
  }

  /**
   * Info log - important events
   */
  info(message: string, context?: LogContext): void {
    const entry = this.createEntry('info', message, context);
    
    if (this.isDevelopment) {
      console.log(this.formatLog(entry));
    }
    
    // Don't send info logs to monitoring (too noisy)
  }

  /**
   * Warning log - potential issues
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.createEntry('warn', message, context);
    
    console.warn(this.formatLog(entry));
    this.sendToMonitoring(entry);
  }

  /**
   * Error log - critical issues
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    };
    
    const entry = this.createEntry('error', message, errorContext);
    
    console.error(this.formatLog(entry));
    this.sendToMonitoring(entry);
  }

  /**
   * Log API request
   */
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.debug(`API ${method} ${path}`, context);
  }

  /**
   * Log API response
   */
  apiResponse(method: string, path: string, status: number, duration?: number): void {
    const message = `API ${method} ${path} → ${status}`;
    const context = duration ? { duration: `${duration}ms` } : undefined;
    
    if (status >= 500) {
      this.error(message, undefined, context);
    } else if (status >= 400) {
      this.warn(message, context);
    } else {
      this.debug(message, context);
    }
  }

  /**
   * Log database query
   */
  dbQuery(query: string, duration?: number): void {
    this.debug('DB Query', { query, duration: duration ? `${duration}ms` : undefined });
  }

  /**
   * Log cache operation
   */
  cache(operation: 'hit' | 'miss' | 'set' | 'invalidate', key: string): void {
    const emoji = {
      hit: '✅',
      miss: '❌',
      set: '💾',
      invalidate: '🗑️'
    }[operation];
    
    this.debug(`${emoji} Cache ${operation}: ${key}`);
  }

  /**
   * Log external API call
   */
  externalApi(service: string, endpoint: string, status?: number): void {
    this.debug(`External API: ${service} ${endpoint}`, { status });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error | unknown, context?: LogContext) => logger.error(message, error, context),
  
  // Specialized loggers
  api: {
    request: (method: string, path: string, context?: LogContext) => logger.apiRequest(method, path, context),
    response: (method: string, path: string, status: number, duration?: number) => logger.apiResponse(method, path, status, duration)
  },
  
  db: {
    query: (query: string, duration?: number) => logger.dbQuery(query, duration)
  },
  
  cache: {
    hit: (key: string) => logger.cache('hit', key),
    miss: (key: string) => logger.cache('miss', key),
    set: (key: string) => logger.cache('set', key),
    invalidate: (key: string) => logger.cache('invalidate', key)
  },
  
  external: {
    api: (service: string, endpoint: string, status?: number) => logger.externalApi(service, endpoint, status)
  }
};

// Type augmentation for window.Sentry
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, options?: { contexts?: { custom?: unknown } }) => void;
      captureMessage: (message: string, options?: { level?: string; contexts?: { custom?: unknown } }) => void;
    };
  }
}
