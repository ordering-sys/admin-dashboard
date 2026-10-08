import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/current-user'
import TablesClient from './tables-client'

export default async function TablesPage() {
  const actor = await getCurrentUser()
  if (!actor) redirect('/auth/login')
  if (actor.role === 'chef') redirect('/kds')
  return <TablesClient />
}
