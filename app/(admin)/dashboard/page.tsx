import Link from 'next/link'
import { QrCode, Utensils, ChefHat, BarChart3 } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          href="/tables"
          icon={<QrCode className="w-8 h-8" />}
          title="Tables & QR Codes"
          description="Generate QR codes for customer ordering"
          color="amber"
        />

        <DashboardCard
          href="/menu"
          icon={<Utensils className="w-8 h-8" />}
          title="Menu Management"
          description="Add, edit, and manage menu items"
          color="green"
          disabled
        />

        <DashboardCard
          href="/kds"
          icon={<ChefHat className="w-8 h-8" />}
          title="Kitchen Display"
          description="View and manage incoming orders"
          color="blue"
        />

        <DashboardCard
          href="/analytics"
          icon={<BarChart3 className="w-8 h-8" />}
          title="Analytics"
          description="View sales reports and insights"
          color="purple"
          disabled
        />
      </div>

      {/* Quick Guide */}
      <div className="mt-12 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-amber-900 mb-4">🚀 Quick Start Guide</h2>
        <ol className="space-y-3 text-gray-700">
          <li className="flex gap-3">
            <span className="font-bold text-amber-700">1.</span>
            <span>
              <strong>Create Tables:</strong> Go to Tables & QR Codes and add your restaurant tables
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-700">2.</span>
            <span>
              <strong>Generate QR Codes:</strong> Click View QR to see and print QR codes
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-700">3.</span>
            <span>
              <strong>Place QR Codes:</strong> Print and place QR codes on each table
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-amber-700">4.</span>
            <span>
              <strong>Customers Order:</strong> Guests scan QR codes to browse menu and order
            </span>
          </li>
        </ol>
      </div>
    </div>
  )
}

function DashboardCard({
  href,
  icon,
  title,
  description,
  color,
  disabled = false
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  color: 'amber' | 'green' | 'blue' | 'purple'
  disabled?: boolean
}) {
  const colorClasses = {
    amber: 'bg-amber-500 group-hover:bg-amber-600',
    green: 'bg-green-500 group-hover:bg-green-600',
    blue: 'bg-blue-500 group-hover:bg-blue-600',
    purple: 'bg-purple-500 group-hover:bg-purple-600'
  }

  const Component = disabled ? 'div' : Link

  return (
    <Component
      href={disabled ? '#' : href}
      className={`group bg-white rounded-xl shadow-md p-6 transition-all ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:shadow-xl cursor-pointer'
      }`}
    >
      <div className={`${colorClasses[color]} text-white p-3 rounded-lg inline-block mb-4 transition-colors`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title}
        {disabled && <span className="text-sm text-gray-500 ml-2">(Coming Soon)</span>}
      </h3>
      <p className="text-gray-600">{description}</p>
    </Component>
  )
}
