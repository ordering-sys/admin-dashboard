'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KitchenDisplay } from '@/components/KitchenDisplay'

export default function KDSClient() {
  const supabase = useMemo(() => createClient(), [])

  return <KitchenDisplay supabase={supabase} variant="embedded" />
}
