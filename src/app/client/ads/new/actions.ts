'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { adSchema } from '@/lib/validations/ad'
import { normalizeMediaUrl } from '@/lib/media-normalizer'

export async function submitAdDraft(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const payload = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category_id: formData.get('category_id') as string || undefined,
    city_id: formData.get('city_id') as string || undefined,
    package_id: formData.get('package_id') as string || undefined,
    media_url: formData.get('media_url') as string || '',
  }

  const parsed = adSchema.safeParse(payload)

  if (!parsed.success) {
    let errorStr = parsed.error.issues.map(i => i.message).join(', ')
    redirect('/client/ads/new?error=' + encodeURIComponent(errorStr))
  }

  const baseSlug = parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6)

  const { data: newAd, error } = await supabase.from('ads').insert({
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    slug: baseSlug,
    category_id: parsed.data.category_id,
    city_id: parsed.data.city_id,
    package_id: parsed.data.package_id,
    status: 'draft',
  }).select('id').single()

  if (error) {
    redirect('/client/ads/new?error=' + encodeURIComponent(error.message))
  }

  if (parsed.data.media_url) {
    const media = normalizeMediaUrl(parsed.data.media_url)
    await supabase.from('ad_media').insert({
      ad_id: newAd.id,
      ...media
    })
  }
  
  await supabase.from('ad_status_history').insert({
    ad_id: newAd.id,
    previous_status: null,
    new_status: 'draft',
    changed_by: user.id,
    note: 'Initial creation'
  })

  await supabase.from('audit_logs').insert({
    action: 'CREATE_AD',
    user_id: user.id,
    target_id: newAd.id,
    target_type: 'ad',
    details: { title: parsed.data.title, status: 'draft' }
  })

  redirect('/client/ads/' + newAd.id)
}
