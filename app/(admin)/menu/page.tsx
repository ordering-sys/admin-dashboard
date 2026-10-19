import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/current-user'
import { createAdminClient } from '@/lib/supabase/admin'
import type { MenuItem } from '@/lib/types'
import MenuClient from './menu-client'

export default async function MenuPage() {
  const actor = await getCurrentUser()
  if (!actor) redirect('/auth/login')
  if (actor.role !== 'admin') redirect('/dashboard')
  const { data, error } = await createAdminClient()
    .from('menu_items')
    .select('id, name_en, name_km, description, price, category, image_url, available')
    .order('name_en')
  if (error) {
    console.error('Menu load failed:', error)
    return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">Could not load menu items. Please refresh to try again.</div>
  }
  return <MenuClient items={(data ?? []) as MenuItem[]} />
}
