import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/current-user'

export default async function MenuPage() {
  const actor = await getCurrentUser()
  if (!actor) redirect('/auth/login')
  if (actor.role !== 'admin') redirect('/dashboard')
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Menu Management</h1>
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
        <p className="text-xl text-blue-900 mb-2">🚧 Coming Soon</p>
        <p className="text-gray-600">
          Menu CRUD operations will be implemented in Phase 2
        </p>
      </div>
    </div>
  )
}
