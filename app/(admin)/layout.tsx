import Link from 'next/link'
import { LayoutDashboard, Utensils, QrCode, ChefHat } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <header className="bg-amber-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Cafe Admin</h1>
            <nav className="flex gap-4">
              <Link href="/" className="text-sm hover:text-amber-200">
                View Site
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-screen shadow-lg">
          <nav className="p-4 space-y-2">
            <NavLink href="/dashboard" icon={<LayoutDashboard />}>
              Dashboard
            </NavLink>
            <NavLink href="/tables" icon={<QrCode />}>
              Tables & QR
            </NavLink>
            <NavLink href="/menu" icon={<Utensils />}>
              Menu Items
            </NavLink>
            <NavLink href="/kds" icon={<ChefHat />}>
              Kitchen Display
            </NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string
  icon: React.ReactNode
  children: React.ReactNode 
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-colors"
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  )
}
