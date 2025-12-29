/**
 * Centralized logger to wrap console methods.
 * Useful for plugging in external logging services (like Sentry, LogRocket) later.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
    message: string;
    context?: Record<string, any>;
    error?: unknown;
}

const isProduction = process.env.NODE_ENV === 'production';

function formatError(error: unknown): any {
    if (error instanceof Error) {
        return {
            message: error.message,
            stack: error.stack,
            name: error.name,
        };
    }
    return String(error);
}

class Logger {
    private log(level: LogLevel, payload: LogPayload) {
        const { message, context, error } = payload;

        // In production, we might want to filter debug logs
        if (level === 'debug' && isProduction) return;

        const logMessage = `[${level.toUpperCase()}] ${message}`;
        const logData = {
            ...(context ? { context } : {}),
            ...(error ? { error: formatError(error) } : {}),
            timestamp: new Date().toISOString(),
        };

        // This is where you'd send to Sentry/Datadog/etc.
        switch (level) {
            case 'info':
                console.log(logMessage, logData);
                break;
            case 'warn':
                console.warn(logMessage, logData);
                break;
            case 'error':
                console.error(logMessage, logData);
                break;
            case 'debug':
                console.debug(logMessage, logData);
                break;
        }
    }

    info(message: string, context?: Record<string, any>) {
        this.log('info', { message, context });
    }

    warn(message: string, context?: Record<string, any>) {
        this.log('warn', { message, context });
    }

    error(message: string, error?: unknown, context?: Record<string, any>) {
        this.log('error', { message, error, context });
    }

    debug(message: string, context?: Record<string, any>) {
        this.log('debug', { message, context });
    }
}

export const logger = new Logger();
