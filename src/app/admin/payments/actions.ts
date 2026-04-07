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

  // FIX 1: 'payments' ki jagah 'packages' table update hoga
  // Aur status 'verified' ki jagah 'approved' kar rahe hain (ya jo aapke DB mein valid ho)
  const { data: packageData } = await supabase
    .from('packages')
    .update({ status: 'approved' })
    .eq('id', payment_id)
    .select('duration_days') // Duration fetch kar rahe hain taake expiry sahi set ho
    .single()

  const now = new Date()
  const expireAt = new Date()

  // FIX 2: Dynamic Expiry Date (Jitne din ka package hai utne hi din add honge)
  const daysToAdd = packageData?.duration_days || 7
  expireAt.setDate(now.getDate() + daysToAdd)

  // Ad ko publish karna
  await supabase.from('ads').update({
    status: 'published',
    publish_at: now.toISOString(),
    expire_at: expireAt.toISOString()
  }).eq('id', ad_id)

  // Status history update karna
  await supabase.from('ad_status_history').insert({
    ad_id,
    previous_status: 'under_review', // Status match kar diya
    new_status: 'published',
    changed_by: user!.id,
    note: `Payment verified (${daysToAdd} days package) and Ad published`
  })

  // Audit logs
  await supabase.from('audit_logs').insert({
    action: 'VERIFY_PAYMENT_AND_PUBLISH',
    user_id: user!.id,
    target_id: ad_id,
    target_type: 'ad',
    details: { payment_id, status: 'published', duration: daysToAdd }
  })

  const { data: ad } = await supabase.from('ads').select('user_id').eq('id', ad_id).single()
  if (ad) {
    await supabase.from('notifications').insert({
      user_id: ad.user_id,
      title: 'Payment Verified & Ad Published ✨',
      message: `Your payment was successfully verified. Your ad is now live for ${daysToAdd} days.`,
      type: 'status_update',
      read: false
    })
  }

  redirect('/admin/payments')
}