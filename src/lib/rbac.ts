import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { logger } from './logger'
import { getRequestId, createErrorResponse } from './request'

export type UserRole = 'admin' | 'member' | 'viewer'

export async function requireAuth() {
  const session = await auth()
  if (!session) {
    return null
  }
  return session
}

export async function requireRole(requiredRole: UserRole) {
  const session = await auth()
  
  if (!session) {
    return { session: null, authorized: false }
  }
  
  const userRole = (session.user.role as UserRole) || 'member'
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    member: 2,
    viewer: 1,
  }
  
  const hasPermission = roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  
  return { session, authorized: hasPermission }
}

export async function requireAdmin() {
  const requestId = await getRequestId()
  const session = await auth()
  
  if (!session) {
    logger.warn('Unauthorized access attempt', { requestId })
    return { session: null, authorized: false, error: createErrorResponse('Please sign in to continue', 401) }
  }
  
  const userRole = (session.user.role as UserRole) || 'member'
  
  if (userRole !== 'admin') {
    logger.warn('Insufficient permissions', { requestId, userRole, requiredRole: 'admin' })
    return { session, authorized: false, error: createErrorResponse('Admin access required', 403) }
  }
  
  return { session, authorized: true, error: null }
}
