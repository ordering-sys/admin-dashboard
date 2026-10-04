'use client'

import { useEffect, useState } from 'react'
import { Plus, Download, Trash2, RefreshCw, Eye } from 'lucide-react'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/client'
import type { Table } from '@/lib/types'

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  const supabase = createClient()

  const loadTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('number', { ascending: true })

      if (error) throw error
      setTables(data || [])
    } catch (error) {
      console.error('Failed to load tables:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTables()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function createTable(tableNumber: string) {
    // Generate token inside the function (not during render)
    const token = `${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`
    
    try {
      const { data, error } = await supabase
        .from('tables')
        .insert({
          number: tableNumber,
          token,
          active: true
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        alert(`Failed to create table: ${error.message}`)
        return
      }
      setTables(prev => [...prev, data])
      setShowAddModal(false)
    } catch (error) {
      console.error('Failed to create table:', error)
      alert('Failed to create table')
    }
  }

  async function deleteTable(id: string) {
    if (!confirm('Delete this table?')) return

    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id)

      if (error) throw error
      setTables(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Failed to delete table:', error)
    }
  }

  async function regenerateToken(table: Table) {
    if (!confirm(`Regenerate QR code for ${table.number}? Old QR codes will stop working.`)) return

    // Generate token inside the function (not during render)
    const newToken = `${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`

    try {
      const { error } = await supabase
        .from('tables')
        .update({ token: newToken })
        .eq('id', table.id)

      if (error) throw error
      
      setTables(prev => prev.map(t => 
        t.id === table.id ? { ...t, token: newToken } : t
      ))
    } catch (error) {
      console.error('Failed to regenerate token:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tables & QR Codes</h1>
          <p className="text-gray-600 mt-2">Manage tables and generate QR codes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Table
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(table => (
          <TableCard
            key={table.id}
            table={table}
            onDelete={() => deleteTable(table.id)}
            onRegenerate={() => regenerateToken(table)}
            onView={() => setSelectedTable(table)}
          />
        ))}
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <AddTableModal
          onClose={() => setShowAddModal(false)}
          onCreate={createTable}
        />
      )}

      {/* QR Code Preview Modal */}
      {selectedTable && (
        <QRPreviewModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </div>
  )
}

function TableCard({ 
  table, 
  onDelete, 
  onRegenerate,
  onView 
}: { 
  table: Table
  onDelete: () => void
  onRegenerate: () => void
  onView: () => void
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-amber-900">{table.number}</h3>
        <div className={`px-3 py-1 rounded-full text-sm ${
          table.active 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {table.active ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Token:</p>
        <p className="text-sm font-mono bg-gray-50 p-2 rounded truncate">
          {table.token}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          View QR
        </button>
        <button
          onClick={onRegenerate}
          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          title="Regenerate Token"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
          title="Delete Table"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function AddTableModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void
  onCreate: (tableNumber: string) => void
}) {
  const [tableNumber, setTableNumber] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (tableNumber.trim()) {
      onCreate(tableNumber.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">Add New Table</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              Table Number/Name
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={e => setTableNumber(e.target.value)}
              placeholder="e.g., T1, Table 5, VIP-A"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              autoFocus
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              This will appear on the QR code
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
            >
              Create Table
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function QRPreviewModal({ 
  table, 
  onClose 
}: { 
  table: Table
  onClose: () => void
}) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [loading, setLoading] = useState(true)

  const generateQR = async () => {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const url = `${siteUrl}/?table=${table.number}&token=${table.token}`
      
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#92400E', // amber-900
          light: '#FFFFFF'
        }
      })
      
      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error('QR generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateQR()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table])

  async function downloadQR() {
    const link = document.createElement('a')
    link.download = `QR-${table.number}.png`
    link.href = qrDataUrl
    link.click()
  }

  async function printQR() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code - ${table.number}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
              border: 2px solid #ddd;
              border-radius: 12px;
            }
            h1 {
              font-size: 48px;
              margin-bottom: 20px;
              color: #92400E;
            }
            p {
              font-size: 24px;
              margin-bottom: 30px;
              color: #666;
            }
            img {
              max-width: 400px;
            }
            @media print {
              body { margin: 0; }
              .qr-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${table.number}</h1>
            <p>Scan to Order</p>
            <p style="font-size: 18px;">ស្កេនដើម្បីកុម្ម៉ង់</p>
            <img src="${qrDataUrl}" alt="QR Code" />
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => window.print(), 500)
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-2">QR Code - {table.number}</h2>
        <p className="text-gray-600 mb-6">Customers scan this to order</p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Generating QR code...</div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 mb-6 flex flex-col items-center">
            <img src={qrDataUrl} alt="QR Code" className="w-full max-w-sm" />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 font-mono break-all">
                {`${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/?table=${table.number}&token=${table.token}`}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={downloadQR}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            <Download className="w-5 h-5" />
            Download PNG
          </button>
          <button
            onClick={printQR}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            🖨️ Print
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
