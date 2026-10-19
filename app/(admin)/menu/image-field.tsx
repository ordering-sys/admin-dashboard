'use client'

import { useEffect, useState } from 'react'
import { MAX_MENU_IMAGE_BYTES, MENU_IMAGE_TYPES } from '@/lib/menu-image'

export default function ImageField({ initialUrl }: { initialUrl?: string }) {
  const [url, setUrl] = useState(initialUrl ?? '')
  const [preview, setPreview] = useState('')

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  return <div className="grid gap-3 sm:col-span-2">
    <label className="grid gap-1">Upload image (optional)
      <input name="image" type="file" accept={MENU_IMAGE_TYPES.join(',')} className="w-full rounded-lg border border-gray-300 p-2" onChange={event => {
        const input = event.currentTarget
        const selected = input.files?.[0] ?? null
        input.setCustomValidity('')
        if (selected && (!MENU_IMAGE_TYPES.includes(selected.type) || selected.size > MAX_MENU_IMAGE_BYTES || selected.size === 0)) {
          input.setCustomValidity('Choose a JPEG, PNG, or WebP image up to 3 MB.')
          input.reportValidity()
          setPreview('')
          return
        }
        setPreview(selected ? URL.createObjectURL(selected) : '')
      }} />
    </label>
    <p className="text-sm text-gray-500">JPEG, PNG, or WebP, up to 3 MB. The image uploads when you save the item.</p>
    <label className="grid gap-1">Image URL (optional)
      <input name="image_url" type="url" maxLength={2048} value={url} onChange={event => setUrl(event.target.value)} placeholder="https://example.com/photo.jpg" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2" />
    </label>
    <p className="text-sm text-gray-500">A selected file replaces this URL. Clear the URL to remove the current image.</p>
    {(preview || url) && <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview || url} alt="Menu item preview" className="h-36 w-36 rounded-lg border object-cover" />
    </div>}
  </div>
}
