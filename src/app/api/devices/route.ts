import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deviceSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'
import { monitoring } from '@/lib/monitoring'
import { getRequestId, createErrorResponse } from '@/lib/request'
import { z } from 'zod'

export async function GET() {
  const requestId = await getRequestId()
  
  try {
    const session = await auth()
    if (!session) {
      logger.warn('Unauthorized devices access', { requestId })
      return NextResponse.json(
        createErrorResponse('Please sign in to continue', 401),
        { status: 401 }
      )
    }
    
    const devices = await monitoring.trackPerformance(
      'devices-fetch',
      async () => prisma.device.findMany({ 
        orderBy: { updatedAt: 'desc' }
      }),
      { requestId, userId: session.user.id }
    )
    
    return NextResponse.json(devices)
  } catch (error) {
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: '/api/devices', method: 'GET', requestId }
    )
    return NextResponse.json(
      createErrorResponse('Failed to fetch devices', 500),
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const requestId = await getRequestId()
  
  try {
    const session = await auth()
    if (!session) {
      logger.warn('Unauthorized device creation', { requestId })
      return NextResponse.json(
        createErrorResponse('Please sign in to continue', 401),
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validated = deviceSchema.parse(body)
    
    const device = await monitoring.trackPerformance(
      'device-create',
      async () => prisma.device.create({ data: validated }),
      { requestId, userId: session.user.id }
    )
    
    logger.info('Device created', { requestId, deviceId: device.id })
    return NextResponse.json(device, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid device data', { requestId, errors: error.issues })
      return NextResponse.json(
        createErrorResponse('Invalid device data', 400, error.issues),
        { status: 400 }
      )
    }
    
    monitoring.trackError(
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: '/api/devices', method: 'POST', requestId }
    )
    return NextResponse.json(
      createErrorResponse('Failed to create device', 500),
      { status: 500 }
    )
  }
}
