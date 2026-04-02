import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.redirect(new URL('/login', req.url))
  
  await supabase.from('ads').update({ status: 'under_review' }).eq('id', id).eq('user_id', user.id)
  
  await supabase.from('ad_status_history').insert({
    ad_id: id,
    previous_status: 'draft',
    new_status: 'under_review',
    changed_by: user.id,
    note: 'Submitted for moderation'
  })
  
  await supabase.from('audit_logs').insert({
    action: 'UPDATE_AD_STATUS',
    user_id: user.id,
    target_id: id,
    target_type: 'ad',
    details: { previous_status: 'draft', new_status: 'under_review' }
  })
  
  await supabase.from('notifications').insert({
    user_id: user.id,
    title: 'Ad Submitted',
    message: 'Your ad has been submitted and is under review.',
    type: 'status_update',
    read: false
  })
  
  revalidatePath('/client/ads/' + id)
  return NextResponse.redirect(new URL('/client/ads/' + id, req.url))
}
