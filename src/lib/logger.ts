type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogContext {
  timestamp: string
  level: LogLevel
  message: string
  metadata?: Record<string, unknown>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
    const logEntry: LogContext = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(metadata && { metadata }),
    }

    if (this.isDevelopment) {
      // Pretty console logging for development
      const emoji = {
        error: '❌',
        warn: '⚠️',
        info: 'ℹ️',
        debug: '🔍',
      }[level]

      console[level === 'debug' ? 'log' : level](
        `${emoji} [${level.toUpperCase()}] ${message}`,
        metadata || ''
      )
    } else {
      // Structured JSON logging for production
      console.log(JSON.stringify(logEntry))
    }

    // TODO: Send to external logging service (Sentry/LogRocket)
    // if (level === 'error' && !this.isDevelopment) {
    //   Sentry.captureException(new Error(message), { extra: metadata })
    // }
  }

  error(message: string, metadata?: Record<string, unknown>) {
    this.log('error', message, metadata)
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log('warn', message, metadata)
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log('info', message, metadata)
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    this.log('debug', message, metadata)
  }
}

export const logger = new Logger()
