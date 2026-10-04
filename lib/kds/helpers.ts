import type { Order } from '@/lib/types'

export type ActiveOrderStatus = 'pending' | 'preparing' | 'ready'

export const ACTIVE_ORDER_STATUSES: ActiveOrderStatus[] = [
  'pending',
  'preparing',
  'ready',
]

export const KDS_STATUS_LABELS = {
  pending: { km: 'ថ្មី', en: 'New' },
  preparing: { km: 'កំពុងចម្អិន', en: 'Preparing' },
  ready: { km: 'រួចរាល់', en: 'Ready' },
} as const

export function nextOrderStatus(
  status: ActiveOrderStatus
): 'preparing' | 'ready' | 'completed' {
  if (status === 'pending') return 'preparing'
  if (status === 'preparing') return 'ready'
  return 'completed'
}

export function formatElapsed(since: string): string {
  const ms = Date.now() - new Date(since).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return '<1 min'
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`
}

export type { Order }
