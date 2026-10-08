import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/current-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { CreateUserForm } from './create-user-form'

export default async function UsersPage() {
  const actor = await getCurrentUser()
  if (!actor) redirect('/auth/login')
  if (actor.role !== 'admin') redirect(actor.role === 'chef' ? '/kds' : '/dashboard')

  const { data: users, error } = await createAdminClient()
    .from('admin_users')
    .select('id, name, email, role')
    .order('created_at', { ascending: false })

  return <div className="max-w-4xl space-y-8">
    <h1 className="text-3xl font-bold text-gray-900">Users</h1>
    <CreateUserForm />
    <section className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Team members</h2>
      {error ? <p className="text-red-700">Could not load users.</p> :
        <div className="divide-y divide-gray-200">
          {users?.map(user => <div key={user.id} className="flex justify-between gap-4 py-3">
            <div><p className="font-medium">{user.name}</p><p className="text-sm text-gray-600">{user.email}</p></div>
            <span className="capitalize text-gray-700">{user.role}</span>
          </div>)}
        </div>}
    </section>
  </div>
}
