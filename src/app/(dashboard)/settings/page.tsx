import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const session = await auth()
  const users = await prisma.user.findMany()

  return <SettingsClient session={session} users={users} />
}
