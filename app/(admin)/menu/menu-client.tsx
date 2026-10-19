'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { MenuItem } from '@/lib/types'
import { deleteMenuItem, saveMenuItem, setMenuAvailability } from './actions'
import ImageField from './image-field'
import { Utensils } from 'lucide-react'

const fieldClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2'

export default function MenuClient({ items }: { items: MenuItem[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [availability, setAvailability] = useState('all')
  const [editing, setEditing] = useState<MenuItem | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const categories = [...new Set(items.map(item => item.category))].sort()
  const visible = items.filter(item =>
    `${item.name_en} ${item.name_km}`.toLowerCase().includes(search.trim().toLowerCase()) &&
    (!category || item.category === category) &&
    (availability === 'all' || item.available === (availability === 'available'))
  )

  async function mutate(action: () => Promise<{ error?: string; success?: boolean }>, success: string, close = false) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await action()
      if (result.error) { setError(result.error); return }
      if (close) setEditing(undefined)
      setMessage(success)
      router.refresh()
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    void mutate(() => saveMenuItem(editing?.id ?? null, form), editing ? 'Menu item updated.' : 'Menu item created.', true)
  }

  return <div className="mx-auto max-w-7xl space-y-6 text-gray-900">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><span className="admin-eyebrow">FRESH FROM YOUR KITCHEN</span><h1 className="text-3xl font-bold mt-2">Menu Items</h1><p className="mt-2 text-gray-600">Manage your menu, prices, and availability.</p></div>
      <button disabled={busy} onClick={() => { setEditing(null); setError(''); setMessage('') }} className="rounded-lg bg-amber-900 px-4 py-2 font-medium text-white disabled:opacity-50">Add menu item</button>
    </div>
    <div className="admin-metrics"><div><span>Total items</span><strong>{items.length}</strong></div><div><span>Available to order</span><strong>{items.filter(item => item.available).length}<small>ready to serve</small></strong></div><div><span>Categories</span><strong>{categories.length}</strong></div></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">{error}</p>}
    {message && <p role="status" className="rounded-lg bg-green-50 p-4 text-green-800">{message}</p>}
    {editing !== undefined && <form key={editing?.id ?? 'new'} onSubmit={submit} className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">{editing ? 'Edit menu item' : 'Add menu item'}</h2>
      <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1">English name<input name="name_en" required maxLength={200} defaultValue={editing?.name_en ?? ''} className={fieldClass} /></label>
        <label className="grid gap-1">Khmer name<input name="name_km" lang="km" required maxLength={200} defaultValue={editing?.name_km ?? ''} className={fieldClass} /></label>
        <label className="grid gap-1">Price ($)<input name="price" type="number" required min="0" max="999999.99" step="0.01" defaultValue={editing?.price ?? ''} className={fieldClass} /></label>
        <label className="grid gap-1">Category<input name="category" list="menu-categories" required maxLength={100} defaultValue={editing?.category ?? ''} className={fieldClass} /><datalist id="menu-categories">{categories.map(value => <option key={value} value={value} />)}</datalist></label>
        <label className="grid gap-1 sm:col-span-2">Description<textarea name="description" rows={3} maxLength={2000} defaultValue={editing?.description ?? ''} className={fieldClass} /></label>
        <ImageField initialUrl={editing?.image_url} />
        <label className="flex items-center gap-2 sm:col-span-2"><input name="available" type="checkbox" defaultChecked={editing?.available ?? true} />Available to order</label>
        <div className="flex gap-3 sm:col-span-2"><button className="rounded-lg bg-amber-900 px-4 py-2 text-white">{busy ? 'Saving…' : 'Save item'}</button><button type="button" onClick={() => { setEditing(undefined); setError('') }} className="rounded-lg border px-4 py-2">Cancel</button></div>
      </fieldset>
    </form>}
    <div className="grid gap-4 rounded-xl bg-white p-4 shadow sm:grid-cols-3">
      <label className="grid gap-1">Search<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="English or Khmer name" className={fieldClass} /></label>
      <label className="grid gap-1">Category<select value={category} onChange={event => setCategory(event.target.value)} className={fieldClass}><option value="">All categories</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="grid gap-1">Availability<select value={availability} onChange={event => setAvailability(event.target.value)} className={fieldClass}><option value="all">All items</option><option value="available">Available</option><option value="unavailable">Unavailable</option></select></label>
    </div>
    <div className="overflow-x-auto rounded-xl bg-white shadow">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100"><tr><th className="p-4">Item</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Availability</th><th className="p-4">Actions</th></tr></thead>
        <tbody>{visible.map(item => <tr key={item.id} className="border-t border-gray-100">
          <td className="p-4"><div className="flex items-center gap-3"><span className="admin-menu-thumbnail"><Utensils size={19} />{item.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={item.image_url} src={item.image_url} alt="" loading="lazy" onError={event => { event.currentTarget.style.display = 'none' }} />
          )}</span><div><p className="font-semibold">{item.name_en}</p><p lang="km" className="text-gray-600">{item.name_km}</p>{item.description && <p className="mt-1 max-w-md whitespace-pre-wrap text-gray-500">{item.description}</p>}</div></div></td>
          <td className="p-4">{item.category}</td><td className="p-4">${Number(item.price).toFixed(2)}</td>
          <td className="p-4"><button disabled={busy} aria-label={`Toggle availability for ${item.name_en}`} aria-pressed={item.available} onClick={() => void mutate(() => setMenuAvailability(item.id, !item.available), 'Availability updated.')} className={`rounded-full px-3 py-1 disabled:opacity-50 ${item.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{item.available ? 'Available' : 'Unavailable'}</button></td>
          <td className="p-4"><div className="flex gap-3"><button disabled={busy} aria-label={`Edit ${item.name_en}`} onClick={() => { setEditing(item); setError(''); setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="font-medium text-amber-900 disabled:opacity-50">Edit</button><button disabled={busy} aria-label={`Delete ${item.name_en}`} onClick={() => { if (window.confirm(`Delete "${item.name_en}"? This cannot be undone. You can mark it unavailable instead.`)) void mutate(() => deleteMenuItem(item.id), 'Menu item deleted.', editing?.id === item.id) }} className="font-medium text-red-700 disabled:opacity-50">Delete</button></div></td>
        </tr>)}</tbody>
      </table>
      {!visible.length && <p className="p-10 text-center text-gray-500">{items.length ? 'No items match your filters.' : 'No menu items yet. Add your first item to get started.'}</p>}
    </div>
  </div>
}
