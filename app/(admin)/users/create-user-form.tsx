'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function CreateUserForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    const form = event.currentTarget
    const values = new FormData(form)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(values)),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not create user')
      form.reset()
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create user')
    } finally {
      setBusy(false)
    }
  }

  return <form onSubmit={submit} className="grid gap-4 rounded-xl bg-white p-6 shadow sm:grid-cols-2">
    <h2 className="text-xl font-semibold sm:col-span-2">Create user</h2>
    <label className="grid gap-1">Name<input name="name" required className="rounded border p-2" /></label>
    <label className="grid gap-1">Email<input name="email" type="email" required className="rounded border p-2" /></label>
    <label className="grid gap-1">Password<input name="password" type="password" minLength={8} required className="rounded border p-2" /></label>
    <label className="grid gap-1">Role<select name="role" className="rounded border p-2"><option value="cashier">Cashier</option><option value="chef">Chef</option><option value="admin">Admin</option></select></label>
    {error && <p role="alert" className="text-red-700 sm:col-span-2">{error}</p>}
    <button disabled={busy} className="rounded bg-amber-900 px-4 py-2 text-white disabled:opacity-50 sm:col-span-2">{busy ? 'Creating…' : 'Create user'}</button>
  </form>
}
