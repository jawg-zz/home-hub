import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { status } = await request.json()

  try {
    const device = await prisma.device.update({
      where: { id },
      data: { status },
    })
    return NextResponse.json(device)
  } catch {
    return NextResponse.json({ error: 'Failed to update device' }, { status: 500 })
  }
}
