import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Simple auth for cron routes (Vercel provides CRON_SECRET)
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date().toISOString()
  
  const { data: expiredAds, error } = await supabase
    .from('ads')
    .select('id, user_id')
    .eq('status', 'published')
    .lt('expire_at', now)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (expiredAds && expiredAds.length > 0) {
    const ids = expiredAds.map((ad: any) => ad.id)
    
    await supabase.from('ads').update({ status: 'expired' }).in('id', ids)
    
    const historyPayload = ids.map((id: string) => ({
      ad_id: id,
      previous_status: 'published',
      new_status: 'expired',
      changed_by: null, 
      note: 'Cron job expired ad automatically due to passed expire_at'
    }))

    await supabase.from('ad_status_history').insert(historyPayload)

    const notificationsPayload = expiredAds.map((ad: any) => ({
      user_id: ad.user_id,
      title: 'Ad Expired',
      message: 'Your ad listing has expired because it passed its end date.',
      type: 'status_update',
      read: false
    }))

    await supabase.from('notifications').insert(notificationsPayload)

    const auditLogsPayload = expiredAds.map((ad: any) => ({
      action: 'AUTO_EXPIRE_AD',
      user_id: ad.user_id, // attributing to owner for viewability
      target_id: ad.id,
      target_type: 'ad',
      details: { status: 'expired' }
    }))

    await supabase.from('audit_logs').insert(auditLogsPayload)
  }

  return NextResponse.json({ success: true, count: expiredAds?.length || 0 })
}
