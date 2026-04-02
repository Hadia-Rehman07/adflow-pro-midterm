'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function submitPayment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const ad_id = formData.get('ad_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const method = formData.get('method') as string
  const transaction_ref = formData.get('transaction_ref') as string
  
  const { error } = await supabase.from('payments').insert({
    ad_id,
    amount,
    method,
    transaction_ref,
    status: 'pending'
  })

  if (!error) {
    await supabase.from('ads').update({ status: 'payment_submitted' }).eq('id', ad_id).eq('user_id', user.id)

    await supabase.from('ad_status_history').insert({
      ad_id,
      previous_status: 'payment_pending',
      new_status: 'payment_submitted',
      changed_by: user.id,
      note: 'Client submitted payment details'
    })
  }

  redirect('/client/ads/' + ad_id)
}
