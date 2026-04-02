'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = (formData.get('fullName') || formData.get('name') || 'New User') as string
  const role = (formData.get('role') as string) || 'client'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        role: role,
      },
    },
  })

  if (error) {
    console.error('Supabase Error:', error.message)
    redirect('/register?error=' + encodeURIComponent(error.message))
  }

  // Insert into seller_profiles table to track role and display name
  if (data?.user) {
    await supabase.from('seller_profiles').upsert({
      user_id: data.user.id,
      display_name: name,
    }, { onConflict: 'user_id' })
  }

  redirect('/login?message=Account+created+successfully')
}