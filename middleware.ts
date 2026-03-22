import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 100
const WINDOW_MS = 60 * 1000 // 1 minute

export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()

  const rateLimitData = rateLimitMap.get(ip)

  if (!rateLimitData || now > rateLimitData.resetTime) {
    // New window or expired window
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return NextResponse.next()
  }

  if (rateLimitData.count >= RATE_LIMIT) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  // Increment count
  rateLimitData.count++
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
