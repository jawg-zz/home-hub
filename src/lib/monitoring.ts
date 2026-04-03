import { logger } from "./logger";

interface PerformanceMetric {
  name: string;
  duration: number;
  metadata?: Record<string, unknown>;
}

class Monitoring {
  private startTime = Date.now();

  /**
   * Track performance of an operation
   */
  async trackPerformance<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>,
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;

      this.recordMetric({ name, duration, metadata });

      if (duration > 1000) {
        logger.warn(`Slow operation: ${name}`, { duration, ...metadata });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`Operation failed: ${name}`, {
        duration,
        error: error instanceof Error ? error.message : String(error),
        ...metadata,
      });
      throw error;
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric) {
    // TODO: Send to APM service (New Relic/DataDog)
    // Example:
    // newrelic.recordMetric(metric.name, metric.duration)

    if (process.env.NODE_ENV === "development") {
      logger.debug(`Performance: ${metric.name}`, {
        duration: `${metric.duration.toFixed(2)}ms`,
        ...metric.metadata,
      });
    }
  }

  /**
   * Track an error with context
   */
  trackError(error: Error, context?: Record<string, unknown>) {
    logger.error(error.message, {
      stack: error.stack,
      ...context,
    });

    // TODO: Send to error tracking service (Sentry)
    // Sentry.captureException(error, { extra: context })
  }

  /**
   * Get application uptime in seconds
   */
  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Record a custom event
   */
  recordEvent(name: string, properties?: Record<string, unknown>) {
    logger.info(`Event: ${name}`, properties);

    // TODO: Send to analytics service
    // analytics.track(name, properties)
  }
}

export const monitoring = new Monitoring();
