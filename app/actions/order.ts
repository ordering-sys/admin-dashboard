'use server'

import { createClient } from '@/lib/supabase/server'
import { sendTelegram } from '@/lib/telegram'
import { getCurrentUser } from '@/lib/current-user'
import {
  ACTIVE_ORDER_STATUSES,
  nextOrderStatus,
  type ActiveOrderStatus,
} from '@/lib/kds/helpers'

export async function advanceOrderStatus(orderId: string) {
  const actor = await getCurrentUser()
  if (!actor || actor.role === 'cashier') return { success: false as const, error: 'Forbidden' }
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    console.error('advanceOrderStatus fetch failed:', error)
    return { success: false as const, error: 'Order not found' }
  }

  if (!ACTIVE_ORDER_STATUSES.includes(order.status as ActiveOrderStatus)) {
    return { success: false as const, error: 'Invalid status' }
  }

  const previousStatus = order.status as ActiveOrderStatus
  const next = nextOrderStatus(previousStatus)

  const { data: updated, error: updateError } = await supabase
    .from('orders')
    .update({ status: next, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('status', previousStatus)
    .select()
    .maybeSingle()

  if (updateError || !updated) {
    console.error('advanceOrderStatus update failed:', updateError)
    return { success: false as const, error: 'Update failed' }
  }

  if (previousStatus === 'preparing' && next === 'ready') {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    const trackingUrl = siteUrl ? `${siteUrl}/tracking/${orderId}` : null

    await sendTelegram(
      `✅ <b>រួចរាល់ / Order ready</b>\n\n` +
        `📋 Order #${orderId.slice(0, 8)}\n` +
        `🪑 តុ / Table: ${order.table_id}\n` +
        (trackingUrl ? `\n🔗 Tracking: ${trackingUrl}` : '')
    )
  }

  return { success: true as const, nextStatus: next }
}
