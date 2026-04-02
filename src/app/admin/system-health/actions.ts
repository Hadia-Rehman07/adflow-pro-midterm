'use server'

import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/roles'

export async function checkDbHeartbeat() {
  const { authorized } = await requireRole(['admin', 'super_admin'])
  if (!authorized) return { status: 'error', latency: 0, message: 'Unauthorized' }

  const supabase = await createClient()
  const start = Date.now()
  const { error } = await supabase.from('users').select('id').limit(1)
  const end = Date.now()
  
  if (error) {
    return { status: 'down', latency: end - start, message: error.message }
  }
  return { status: 'healthy', latency: end - start, message: 'Connected' }
}

export async function triggerAdsCleanup() {
  const { authorized } = await requireRole(['admin', 'super_admin'])
  if (!authorized) return { success: false, message: 'Unauthorized' }

  // Because this is a NextJS server action, we can just invoke the logic directly or fetch the absolute URL
  // But calling absolute URL in Vercel sometimes yields issues with localhost.
  // We'll mock the trigger process here invoking the route handler logic.
  try {
     const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
     const res = await fetch(`${baseUrl}/api/cron/expire-ads`, { method: 'POST' })
     if (res.ok) {
       const data = await res.json()
       return { success: true, message: `Cleanup ran successfully. ${data.count || 0} ads expired.` }
     }
     return { success: false, message: `Cleanup endpoint failed with status ${res.status}` }
  } catch (err: any) {
     return { success: false, message: `Cleanup failed to execute: ${err.message}` }
  }
}
