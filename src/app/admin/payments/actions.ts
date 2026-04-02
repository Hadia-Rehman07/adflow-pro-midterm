'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { requireRole } from '@/utils/roles'

export async function verifyPayment(formData: FormData) {
  const { authorized } = await requireRole(['admin', 'super_admin'])
  if (!authorized) redirect('/login')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const payment_id = formData.get('payment_id') as string
  const ad_id = formData.get('ad_id') as string
  
  await supabase.from('payments').update({ status: 'verified' }).eq('id', payment_id)

  const now = new Date()
  const expireAt = new Date()
  expireAt.setDate(now.getDate() + 7) // Default to 7 days for now

  await supabase.from('ads').update({ 
    status: 'published',
    publish_at: now.toISOString(),
    expire_at: expireAt.toISOString()
  }).eq('id', ad_id)

  await supabase.from('ad_status_history').insert({
    ad_id,
    previous_status: 'payment_submitted',
    new_status: 'published',
    changed_by: user!.id,
    note: 'Payment verified and Ad published'
  })

  await supabase.from('audit_logs').insert({
    action: 'VERIFY_PAYMENT_AND_PUBLISH',
    user_id: user!.id,
    target_id: ad_id,
    target_type: 'ad',
    details: { payment_id, status: 'published' }
  })
  
  const { data: ad } = await supabase.from('ads').select('user_id').eq('id', ad_id).single()
  if (ad) {
    await supabase.from('notifications').insert({
      user_id: ad.user_id,
      title: 'Payment Verified & Ad Published',
      message: 'Your payment was successfully verified and your ad is now live.',
      type: 'status_update',
      read: false
    })
  }

  redirect('/admin/payments')
}
