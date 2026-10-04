export interface MenuItem {
  id: string
  name_km: string
  name_en: string
  description?: string
  price: number
  category: string
  image_url?: string
  available: boolean
}

export interface CartItem extends MenuItem {
  quantity: number
  notes?: string
}

export interface Table {
  id: string
  number: string
  token: string
  active: boolean
}

export interface Order {
  id: string
  table_id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export const ORDER_STATUS_LABELS = {
  pending: { km: 'កំពុងទទួល...', en: 'Received', color: 'blue' },
  preparing: { km: 'កំពុងចម្អិន...', en: 'Preparing', color: 'yellow' },
  ready: { km: 'រួចរាល់! 🎉', en: 'Ready', color: 'green' },
  completed: { km: 'ចប់សាច់', en: 'Completed', color: 'gray' },
  cancelled: { km: 'បានបោះបង់', en: 'Cancelled', color: 'red' }
} as const
