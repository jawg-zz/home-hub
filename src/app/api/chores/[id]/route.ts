import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { choreUpdateSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'
import { monitoring } from '@/lib/monitoring'
import { getRequestId, createErrorResponse } from '@/lib/request'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = await getRequestId()
  const session = await auth()
  
  if (!session) {
    logger.warn('Unauthorized chore update attempt', { requestId })
    return NextResponse.json(
      createErrorResponse('Please sign in to continue', 401),
      { status: 401 }
    )
  }
  
  try {
    const { id } = await params
    const body = await request.json()
    const validated = choreUpdateSchema.parse(body)
    
    const chore = await monitoring.trackPerformance(
      'chore-update',
      async () => prisma.chore.update({
        where: { id },
        data: validated,
      }),
      { requestId, userId: session.user.id, choreId: id }
    )
    
    logger.info('Chore updated', { requestId, choreId: id })
    return NextResponse.json(chore)
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid chore update data', { requestId, errors: error.issues })
      return NextResponse.json(
        createErrorResponse('Invalid chore data', 400, error.issues),
        { status: 400 }
      )
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        createErrorResponse('Chore not found', 404),
        { status: 404 }
      )
    }
    
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: '/api/chores/:id', method: 'PATCH', requestId }
    )
    return NextResponse.json(
      createErrorResponse('Failed to update chore', 500),
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = await getRequestId()
  const session = await auth()
  
  if (!session) {
    logger.warn('Unauthorized chore delete attempt', { requestId })
    return NextResponse.json(
      createErrorResponse('Please sign in to continue', 401),
      { status: 401 }
    )
  }
  
  try {
    const { id } = await params
    
    await monitoring.trackPerformance(
      'chore-delete',
      async () => prisma.chore.delete({ where: { id } }),
      { requestId, userId: session.user.id, choreId: id }
    )
    
    logger.info('Chore deleted', { requestId, choreId: id })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        createErrorResponse('Chore not found', 404),
        { status: 404 }
      )
    }
    
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: '/api/chores/:id', method: 'DELETE', requestId }
    )
    return NextResponse.json(
      createErrorResponse('Failed to delete chore', 500),
      { status: 500 }
    )
  }
}
