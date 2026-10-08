export type Role = 'admin' | 'cashier' | 'chef'

export function isRole(value: unknown): value is Role {
  return value === 'admin' || value === 'cashier' || value === 'chef'
}

export function canAccess(role: Role, path: string): boolean {
  if (role === 'admin') return true
  if (role === 'chef') return path === '/kds' || path.startsWith('/kds/')
  return path === '/dashboard' || path.startsWith('/dashboard/') || path === '/tables' || path.startsWith('/tables/')
}

export function homeForRole(role: Role): string {
  return role === 'chef' ? '/kds' : '/dashboard'
}
