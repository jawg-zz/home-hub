"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Page error boundary caught error", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p className="error-message">
          {error.message || "An unexpected error occurred"}
        </p>
        {error.digest && (
          <p className="error-digest">Error ID: {error.digest}</p>
        )}
        <button onClick={reset} className="btn btn-primary">
          Try again
        </button>
      </div>
      <style jsx>{`
        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          padding: 2rem;
        }
        .error-content {
          text-align: center;
          max-width: 400px;
        }
        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .error-message {
          color: var(--muted);
          margin-bottom: 1rem;
        }
        .error-digest {
          font-size: 0.75rem;
          color: var(--muted);
          font-family: monospace;
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}
