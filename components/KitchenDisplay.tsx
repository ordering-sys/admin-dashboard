'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  Bell,
  BellOff,
  ChefHat,
  Clock,
  Printer,
  RefreshCw,
  Volume2,
} from 'lucide-react'
import {
  ACTIVE_ORDER_STATUSES,
  KDS_STATUS_LABELS,
  formatElapsed,
  nextOrderStatus,
  type ActiveOrderStatus,
  type Order,
} from '@/lib/kds/helpers'
import { playNewOrderChime } from '@/lib/kds/sound'
import { advanceOrderStatus } from '@/app/actions/order'

type KitchenDisplayProps = {
  supabase: SupabaseClient
  variant?: 'kitchen' | 'embedded'
}

const COLUMN_STYLES: Record<
  ActiveOrderStatus,
  { header: string; ring: string; badge: string }
> = {
  pending: {
    header: 'bg-blue-600',
    ring: 'ring-blue-500/40',
    badge: 'bg-blue-100 text-blue-800',
  },
  preparing: {
    header: 'bg-amber-500',
    ring: 'ring-amber-500/40',
    badge: 'bg-amber-100 text-amber-900',
  },
  ready: {
    header: 'bg-emerald-600',
    ring: 'ring-emerald-500/40',
    badge: 'bg-emerald-100 text-emerald-900',
  },
}

const ACTION_LABELS: Record<ActiveOrderStatus, string> = {
  pending: 'Start preparing',
  preparing: 'Mark ready',
  ready: 'Complete order',
}

export function KitchenDisplay({
  supabase,
  variant = 'kitchen',
}: KitchenDisplayProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [clock, setClock] = useState(() => new Date())
  const knownPendingRef = useRef<Set<string>>(new Set())
  const isKitchen = variant === 'kitchen'

  const grouped = useMemo(() => {
    const map: Record<ActiveOrderStatus, Order[]> = {
      pending: [],
      preparing: [],
      ready: [],
    }
    for (const order of orders) {
      if (ACTIVE_ORDER_STATUSES.includes(order.status as ActiveOrderStatus)) {
        map[order.status as ActiveOrderStatus].push(order)
      }
    }
    for (const key of ACTIVE_ORDER_STATUSES) {
      map[key].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }
    return map
  }, [orders])

  const loadOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ACTIVE_ORDER_STATUSES)
        .order('created_at', { ascending: true })

      if (error) throw error
      const list = (data ?? []) as Order[]
      setOrders(list)
      knownPendingRef.current = new Set(
        list.filter((o) => o.status === 'pending').map((o) => o.id)
      )
    } catch (err) {
      console.error('Failed to load kitchen orders:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  useEffect(() => {
    const channel = supabase
      .channel('kitchen_orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new as Order
          if (!ACTIVE_ORDER_STATUSES.includes(order.status as ActiveOrderStatus)) {
            return
          }
          setOrders((prev) => {
            if (prev.some((o) => o.id === order.id)) return prev
            return [...prev, order]
          })
          if (order.status === 'pending' && !knownPendingRef.current.has(order.id)) {
            knownPendingRef.current.add(order.id)
            if (soundEnabled) playNewOrderChime()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new as Order
          if (
            order.status === 'completed' ||
            order.status === 'cancelled'
          ) {
            setOrders((prev) => prev.filter((o) => o.id !== order.id))
            knownPendingRef.current.delete(order.id)
            return
          }
          if (!ACTIVE_ORDER_STATUSES.includes(order.status as ActiveOrderStatus)) {
            return
          }
          setOrders((prev) => {
            const idx = prev.findIndex((o) => o.id === order.id)
            if (idx === -1) return [...prev, order]
            const next = [...prev]
            next[idx] = order
            return next
          })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase, soundEnabled])

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  async function advanceStatus(order: Order) {
    if (!ACTIVE_ORDER_STATUSES.includes(order.status as ActiveOrderStatus)) {
      return
    }
    const next = nextOrderStatus(order.status as ActiveOrderStatus)
    setUpdatingId(order.id)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq('id', order.id)

      if (error) throw error

      if (next === 'completed') {
        setOrders((prev) => prev.filter((o) => o.id !== order.id))
        knownPendingRef.current.delete(order.id)
      } else {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: next } : o))
        )
      }
    } catch (err) {
      console.error('Failed to update order status:', err)
      alert('Could not update order. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  function printTicket(order: Order) {
    const lines = order.items
      .map(
        (item) =>
          `<tr><td>${item.quantity}x</td><td>${item.name_en}<br/><small>${item.name_km}</small></td><td>${item.notes ?? ''}</td></tr>`
      )
      .join('')
    const html = `<!DOCTYPE html><html><head><title>Order ${order.id.slice(0, 8)}</title>
      <style>body{font-family:sans-serif;padding:16px}h1{font-size:18px}table{width:100%;border-collapse:collapse}td{padding:4px 8px;border-bottom:1px solid #ddd}</style>
      </head><body>
      <h1>Table ${order.table_id} · #${order.id.slice(0, 8)}</h1>
      <p>${new Date(order.created_at).toLocaleString()}</p>
      <table><thead><tr><th>Qty</th><th>Item</th><th>Notes</th></tr></thead><tbody>${lines}</tbody></table>
      <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
      </body></html>`
    const win = window.open('', '_blank', 'width=400,height=600')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
  }

  const shellClass = isKitchen
    ? 'min-h-screen bg-slate-950 text-slate-100'
    : 'min-h-[70vh] text-gray-900'

  return (
    <div className={shellClass}>
      <header
        className={
          isKitchen
            ? 'border-b border-slate-800 bg-slate-900/80 px-4 py-4 sm:px-6'
            : 'mb-6'
        }
      >
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ChefHat
              className={`h-8 w-8 ${isKitchen ? 'text-amber-400' : 'text-amber-700'}`}
            />
            <div>
              <h1
                className={`text-2xl font-bold ${isKitchen ? 'text-white' : 'text-gray-900'}`}
              >
                Kitchen Display
              </h1>
              <p
                className={`text-sm ${isKitchen ? 'text-slate-400' : 'text-gray-500'}`}
              >
                Real-time order queue · {orders.length} active
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                isKitchen ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Clock className="h-4 w-4" />
              {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isKitchen
                  ? 'bg-slate-800 hover:bg-slate-700'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {soundEnabled ? (
                <Bell className="h-4 w-4 text-emerald-400" />
              ) : (
                <BellOff className="h-4 w-4 text-slate-500" />
              )}
              Sound {soundEnabled ? 'on' : 'off'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (soundEnabled) playNewOrderChime()
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                isKitchen ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="Test notification sound"
            >
              <Volume2 className="h-4 w-4" />
              Test
            </button>
            <button
              type="button"
              onClick={() => void loadOrders()}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                isKitchen
                  ? 'bg-amber-600 text-white hover:bg-amber-500'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-4 sm:p-6">
        {loading && orders.length === 0 ? (
          <p className={isKitchen ? 'text-slate-400' : 'text-gray-500'}>
            Loading orders…
          </p>
        ) : orders.length === 0 ? (
          <div
            className={`rounded-2xl border-2 border-dashed p-12 text-center ${
              isKitchen
                ? 'border-slate-700 text-slate-400'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            <ChefHat className="mx-auto mb-4 h-12 w-12 opacity-40" />
            <p className="text-lg font-medium">No active orders</p>
            <p className="text-sm">New customer orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {ACTIVE_ORDER_STATUSES.map((status) => (
              <section key={status} className="flex min-h-[320px] flex-col">
                <div
                  className={`mb-3 flex items-center justify-between rounded-xl px-4 py-3 text-white ${COLUMN_STYLES[status].header}`}
                >
                  <span className="font-bold">
                    {KDS_STATUS_LABELS[status].en} · {KDS_STATUS_LABELS[status].km}
                  </span>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-sm font-semibold">
                    {grouped[status].length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  {grouped[status].map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      status={status}
                      isKitchen={isKitchen}
                      updating={updatingId === order.id}
                      onAdvance={() => void advanceStatus(order)}
                      onPrint={() => printTicket(order)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function OrderCard({
  order,
  status,
  isKitchen,
  updating,
  onAdvance,
  onPrint,
}: {
  order: Order
  status: ActiveOrderStatus
  isKitchen: boolean
  updating: boolean
  onAdvance: () => void
  onPrint: () => void
}) {
  const [elapsed, setElapsed] = useState(() => formatElapsed(order.created_at))

  useEffect(() => {
    setElapsed(formatElapsed(order.created_at))
    const id = window.setInterval(
      () => setElapsed(formatElapsed(order.created_at)),
      30_000
    )
    return () => window.clearInterval(id)
  }, [order.created_at])

  return (
    <article
      className={`rounded-xl p-4 ring-2 ${COLUMN_STYLES[status].ring} ${
        isKitchen ? 'bg-slate-900 shadow-lg' : 'bg-white shadow-md'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold">Table {order.table_id}</p>
          <p className={`text-xs ${isKitchen ? 'text-slate-500' : 'text-gray-500'}`}>
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${COLUMN_STYLES[status].badge}`}
        >
          {elapsed}
        </span>
      </div>

      <ul className={`mb-4 space-y-2 text-sm ${isKitchen ? 'text-slate-200' : 'text-gray-800'}`}>
        {order.items.map((item, idx) => (
          <li key={`${item.id}-${idx}`} className="flex justify-between gap-2">
            <span>
              <span className="font-bold">{item.quantity}×</span>{' '}
              {item.name_en}
              <span className={`block text-xs ${isKitchen ? 'text-slate-500' : 'text-gray-500'}`}>
                {item.name_km}
              </span>
              {item.notes ? (
                <span className="text-xs italic text-amber-500/90">Note: {item.notes}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={updating}
          onClick={onAdvance}
          className="flex-1 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 py-2.5 text-sm font-bold text-slate-950 transition-colors enabled:hover:from-amber-500 enabled:hover:to-amber-400 disabled:opacity-50"
        >
          {updating ? 'Saving…' : ACTION_LABELS[status]}
        </button>
        <button
          type="button"
          onClick={onPrint}
          className={`rounded-lg p-2.5 ${
            isKitchen
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          title="Print ticket"
        >
          <Printer className="h-5 w-5" />
        </button>
      </div>
    </article>
  )
}
