'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// 1. CREATE AD & SUBMIT TO ADMIN (FIXED & DYNAMIC)
export async function submitAdDraft(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string // ID use ho rahi hai ginti ke liye
  const price = formData.get('price') as string
  const imageFiles = formData.getAll('images') as File[] // Frontend se images lena

  if (!title || !description || !category_id) {
    redirect('/client/ads/new?error=' + encodeURIComponent('Title, Description and Category are required'))
  }

  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6)

  // FIX: category_id column use kiya taake listing count barhay
  const { data: newAd, error } = await supabase.from('ads').insert({
    user_id: user.id,
    title: title,
    description: description,
    slug: baseSlug,
    category_id: category_id,
    price: parseFloat(price) || 0,
    status: 'under_review',
  }).select('id').single()

  if (error) redirect('/client/ads/new?error=' + encodeURIComponent(error.message))

  // --- IMAGE UPLOAD LOGIC ---
  for (const file of imageFiles) {
    if (file.size > 0) {
      const fileName = `${newAd.id}/${Math.random()}-${file.name}`

      const { data: uploadData } = await supabase.storage
        .from('ads') // Bucket name 'ads' hona chahiye
        .upload(fileName, file)

      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('ads').getPublicUrl(fileName)

        await supabase.from('ad_media').insert({
          ad_id: newAd.id,
          original_url: publicUrl,
          thumbnail_url: publicUrl,
          media_type: 'image'
        })
      }
    }
  }

  // Notification for Client
  await supabase.from('notifications').insert({
    user_id: user.id,
    title: 'Sent for Review 🚀',
    message: `Your ad "${title}" has been submitted for approval.`,
    read: false
  })

  // Status History
  await supabase.from('ad_status_history').insert({
    ad_id: newAd.id,
    new_status: 'under_review',
    changed_by: user.id,
    note: 'Initial submission'
  })

  // Audit Logs
  await supabase.from('audit_logs').insert({
    action: 'CREATE_AD',
    user_id: user.id,
    target_id: newAd.id,
    target_type: 'ad',
    details: { title: title, status: 'under_review' }
  })

  // Sab refresh karo taake counter foran barhay
  revalidatePath('/admin')
  revalidatePath('/client')
  revalidatePath('/explore')

  redirect('/client')
}

// 2. SUBMIT FOR REVIEW (Manual Trigger)
export async function submitAdForReview(adId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('ads')
    .update({ status: 'under_review' })
    .eq('id', adId)

  if (error) throw new Error(error.message)

  const { data: adData } = await supabase.from('ads').select('title').eq('id', adId).single()

  await supabase.from('notifications').insert({
    user_id: user.id,
    title: 'Status Updated 🚀',
    message: `Your ad "${adData?.title || 'Listing'}" is now under review.`,
    read: false
  })

  revalidatePath('/admin')
  revalidatePath('/client')
  revalidatePath('/explore')
  revalidatePath(`/client/ads/${adId}`)

  return { success: true }
}

// 3. DELETE AD
export async function deleteAdAction(adId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase.from('ad_media').delete().eq('ad_id', adId)
  await supabase.from('ad_status_history').delete().eq('ad_id', adId)

  const { error } = await supabase
    .from('ads')
    .delete()
    .eq('id', adId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/client')
  revalidatePath('/explore')
  redirect('/client')
}

// 4. UPDATE AD
export async function updateAdAction(adId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = formData.get('price') as string

  const { error } = await supabase
    .from('ads')
    .update({
      title,
      description,
      price: parseFloat(price) || 0,
    })
    .eq('id', adId)

  if (error) throw new Error(error.message)

  revalidatePath(`/client/ads/${adId}`)
  revalidatePath('/client')
  revalidatePath('/explore')
  return { success: true }
}