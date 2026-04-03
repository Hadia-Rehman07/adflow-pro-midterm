'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { requireRole } from '@/utils/roles'
import { revalidatePath } from 'next/cache'

export async function moderateAd(formData: FormData) {
  // 1. Security Check (Moderator ya Admin hona lazmi hai)
  const { authorized } = await requireRole(['moderator', 'admin', 'super_admin'])
  if (!authorized) redirect('/login')

  const supabase = await createClient()

  // 2. Extract Data (Form se sahi names uthana)
  const id = formData.get('ad_id') as string // Page file mein 'ad_id' hona chahiye
  const action = formData.get('action') as string
  const userId = formData.get('userId') as string
  const title = formData.get('title') as string || 'Your Ad'
  const feedback = formData.get('feedback') as string // Textarea ka name

  const { data: { user: moderator } } = await supabase.auth.getUser()

  // 3. Determine New Status (Jo humne SQL mein setup kiye)
  let newStatus = 'under_review'
  if (action === 'approve') newStatus = 'published'
  if (action === 'reject') newStatus = 'rejected'
  if (action === 'flag') newStatus = 'flagged'

  console.log(`Updating Ad ${id} to ${newStatus}...`)

  // 4. Update Ad Status & Feedback
  const { error: updateError } = await supabase
    .from('ads')
    .update({
      status: newStatus,
      moderator_feedback: feedback, // Humne SQL mein ye column add kiya tha
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (updateError) {
    console.error("Main Update Error:", updateError.message)
    throw new Error('Database update failed: ' + updateError.message)
  }

  // 5. Try to Maintain History (Agay wala code fail ho toh bhi process na rukay)
  try {
    await supabase.from('ad_status_history').insert({
      ad_id: id,
      previous_status: 'under_review',
      new_status: newStatus,
      changed_by: moderator?.id,
      note: feedback || (action === 'approve' ? 'Approved' : 'Decision by moderator')
    })

    // 6. Audit Logs
    await supabase.from('audit_logs').insert({
      action: 'MODERATE_AD',
      user_id: moderator?.id,
      target_id: id,
      target_type: 'ad',
      details: { action, new_status: newStatus, feedback }
    })

    // 7. Send Notification to Client
    if (userId) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title: action === 'approve' ? 'Listing Approved ✅' : 'Ad Status Update',
        message: action === 'approve'
          ? `Your ad "${title}" is now live.`
          : `Update on "${title}": Status is now ${newStatus}. Note: ${feedback}`,
        read: false
      })
    }
  } catch (logError) {
    console.log("Log/Notification failed but Ad was updated successfully.")
  }

  // 8. Revalidate & Redirect
  revalidatePath('/moderator/ads')
  revalidatePath('/explore')
  revalidatePath(`/moderator/ads/${id}`)

  redirect('/moderator/ads')
}