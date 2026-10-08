import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/current-user'
import KDSClient from './kds-client'

export default async function KDSPage() {
  const actor = await getCurrentUser()
  if (!actor) redirect('/auth/login')
  if (actor.role === 'cashier') redirect('/dashboard')
  return <KDSClient />
}
