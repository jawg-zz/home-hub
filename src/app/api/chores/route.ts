import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
  const { title, assignedTo } = await request.json()
  const chore = await prisma.chore.create({
    data: { title, assignedTo },
  })
  return NextResponse.json(chore)
}
