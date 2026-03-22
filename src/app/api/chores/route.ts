import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { choreSchema } from '@/lib/validations'
import { z } from 'zod'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const chores = await prisma.chore.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(chores)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const validated = choreSchema.parse(body)
    const chore = await prisma.chore.create({
      data: validated,
    })
    return NextResponse.json(chore)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    throw error
  }
}
