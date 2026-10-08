import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { isRole, type Role } from '@/lib/roles'

export async function getCurrentUser(): Promise<{ id: string; role: Role } | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('admin_users').select('id, role').eq('id', session.user.id).maybeSingle()
  if (error || !data || !isRole(data.role)) return null
  return { id: data.id, role: data.role }
}
