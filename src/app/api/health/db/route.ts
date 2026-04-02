import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const start = Date.now()
  const supabase = await createClient()

  let status = 'healthy'
  let response_ms = 0

  try {
    const { error } = await supabase.from('users').select('id').limit(1)
    if (error) throw error
    response_ms = Date.now() - start
  } catch (e) {
    status = 'error'
    response_ms = Date.now() - start
  }

  await supabase.from('system_health_logs').insert({
    source: 'db_heartbeat',
    response_ms,
    status
  })

  return NextResponse.json({ status, response_ms })
}
