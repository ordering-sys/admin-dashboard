import { getCurrentUser } from '@/lib/current-user'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')
  return <AdminShell role={user.role} siteUrl={process.env.NEXT_PUBLIC_SITE_URL || '/'}>{children}</AdminShell>
}
