'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { requireRole } from '@/utils/roles'

export async function moderateAd(formData: FormData) {
  const { authorized } = await requireRole(['moderator', 'admin', 'super_admin'])
  if (!authorized) redirect('/login')

  const id = formData.get('id') as string
  const action = formData.get('action') as string
  let note = formData.get('note') as string

  if (action === 'flag') {
    note = `[FLAGGED SUSPICIOUS] ${note}`
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const newStatus = action === 'approve' ? 'payment_pending' : 'draft'

  const { data: ad } = await supabase.from('ads').select('user_id').eq('id', id).single()

  await supabase.from('ads').update({ status: newStatus }).eq('id', id)
  
  await supabase.from('ad_status_history').insert({
    ad_id: id,
    previous_status: 'under_review',
    new_status: newStatus,
    changed_by: user!.id,
    note: note || (action === 'approve' ? 'Approved by moderator' : 'Rejected by moderator')
  })

  await supabase.from('audit_logs').insert({
    action: 'MODERATE_AD',
    user_id: user!.id,
    target_id: id,
    target_type: 'ad',
    details: { action, previous_status: 'under_review', new_status: newStatus, note }
  })

  if (ad) {
    await supabase.from('notifications').insert({
      user_id: ad.user_id,
      title: action === 'approve' ? 'Ad Approved' : 'Ad Rejected / Flagged',
      message: action === 'approve' 
        ? 'Your ad has been approved! Please proceed to select a package and complete payment.' 
        : `Your ad requires revisions. Note: ${note}`,
      type: 'status_update',
      read: false
    })
  }

  redirect('/moderator')
}
