import { randomUUID } from 'crypto'
import { headers } from 'next/headers'

/**
 * Generate or retrieve request ID for tracking
 */
export async function getRequestId(): Promise<string> {
  const headersList = await headers()
  return headersList.get('x-request-id') || randomUUID()
}

/**
 * Create a standardized API error response
 */
export function createErrorResponse(
  message: string,
  status: number,
  details?: unknown
) {
  const response: { error: string; status: number; details?: unknown } = {
    error: message,
    status,
  }
  if (details) {
    response.details = details
  }
  return response
}
