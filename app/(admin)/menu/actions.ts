'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/current-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { uploadMenuImage, discardMenuImage } from '@/lib/r2'

export async function saveMenuItem(id: string | null, form: FormData) {
  const actor = await getCurrentUser()
  if (actor?.role !== 'admin') return { error: 'Only admins can manage menu items.' }

  const name_en = String(form.get('name_en') ?? '').trim()
  const name_km = String(form.get('name_km') ?? '').trim()
  const category = String(form.get('category') ?? '').trim()
  const description = String(form.get('description') ?? '').trim()
  let image_url = String(form.get('image_url') ?? '').trim()
  const rawPrice = String(form.get('price') ?? '').trim()
  const price = Number(rawPrice)
  if (!name_en || !name_km || !category) return { error: 'English name, Khmer name, and category are required.' }
  if (name_en.length > 200 || name_km.length > 200 || category.length > 100 || description.length > 2000 || image_url.length > 2048) {
    return { error: 'One or more fields exceed the allowed length.' }
  }
  if (!/^\d+(\.\d{1,2})?$/.test(rawPrice) || !Number.isFinite(price) || price < 0 || price > 999999.99) {
    return { error: 'Enter a price between 0 and 999999.99 with at most two decimal places.' }
  }
  if (image_url) {
    try {
      if (!['https:', 'http:'].includes(new URL(image_url).protocol)) throw new Error()
    } catch {
      return { error: 'Image URL must be a valid HTTP or HTTPS URL.' }
    }
  }
  const file = form.get('image')
  let uploadedKey: string | undefined
  if (file instanceof File && file.size > 0) {
    try {
      const uploaded = await uploadMenuImage(file)
      uploadedKey = uploaded.key
      image_url = uploaded.url
    } catch (cause) {
      console.error('Menu image upload failed:', cause)
      return { error: cause instanceof Error && (cause.message.startsWith('Choose ') || cause.message.startsWith('Image uploads are not configured.')) ? cause.message : 'Could not upload the image. Check the R2 configuration and try again.' }
    }
  }
  const values = { name_en, name_km, category, description, image_url, price, available: form.get('available') === 'on' }
  const db = createAdminClient()
  try {
    const query = id ? db.from('menu_items').update(values).eq('id', id) : db.from('menu_items').insert(values)
    const { data, error } = await query.select('id').maybeSingle()
    if (error) throw error
    if (!data) throw new Error('Menu item no longer exists')
  } catch (cause) {
    console.error('Menu save failed:', cause)
    if (uploadedKey) {
      try { await discardMenuImage(uploadedKey) } catch (cleanupError) { console.error('Menu image cleanup failed:', cleanupError) }
    }
    return { error: 'Could not save the menu item. Refresh and try again.' }
  }
  revalidatePath('/menu')
  return { success: true }
}

export async function deleteMenuItem(id: string) {
  const actor = await getCurrentUser()
  if (actor?.role !== 'admin') return { error: 'Only admins can manage menu items.' }
  const { data, error } = await createAdminClient().from('menu_items').delete().eq('id', id).select('id').maybeSingle()
  if (error) {
    console.error('Menu delete failed:', error)
    return { error: 'Could not delete this item. If it is used by orders, mark it unavailable instead.' }
  }
  if (!data) return { error: 'This item no longer exists. Refresh the page.' }
  revalidatePath('/menu')
  return { success: true }
}

export async function setMenuAvailability(id: string, available: boolean) {
  const actor = await getCurrentUser()
  if (actor?.role !== 'admin') return { error: 'Only admins can manage menu items.' }
  if (typeof available !== 'boolean') return { error: 'Invalid availability.' }
  const { data, error } = await createAdminClient().from('menu_items').update({ available }).eq('id', id).select('id').maybeSingle()
  if (error) {
    console.error('Menu availability update failed:', error)
    return { error: 'Could not update availability. Please try again.' }
  }
  if (!data) return { error: 'This item no longer exists. Refresh the page.' }
  revalidatePath('/menu')
  return { success: true }
}
