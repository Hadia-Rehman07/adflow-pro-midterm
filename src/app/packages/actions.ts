'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function selectPackageAction(formData: FormData) {
  const ad_id = formData.get('ad_id') as string
  const package_id = formData.get('package_id') as string
  const package_name = formData.get('package_name') as string
  const amount = formData.get('amount') as string

  if (!ad_id) {
    redirect('/client')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: ad } = await supabase.from('ads').select('status').eq('id', ad_id).single()

  const { data: payment, error } = await supabase.from('payments').insert({
    user_id: user.id,
    ad_id: ad_id,
    amount: amount,
    status: 'pending'
  }).select('id').single()

  if (!error) {
    await supabase.from('ads').update({
      package_id: package_id,
      status: 'payment_submitted'
    }).eq('id', ad_id)

    await supabase.from('ad_status_history').insert({
      ad_id: ad_id,
      previous_status: ad?.status || 'payment_pending',
      new_status: 'payment_submitted',
      changed_by: user.id,
      note: `Selected package: ${package_name}`
    })
    
    await supabase.from('audit_logs').insert({
      action: 'SUBMIT_PAYMENT',
      user_id: user.id,
      target_id: ad_id,
      target_type: 'ad',
      details: { package_name, amount }
    })
  }

  redirect('/client')
}
