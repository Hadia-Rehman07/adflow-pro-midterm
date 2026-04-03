'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Auth Sign In
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // 2. Database se role check karein (Kyube Auth metadata kabhi kabhi delay karta hai)
  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (roleError || !userData) {
    console.error("Role fetching error:", roleError)
    // Agar role na mile toh default dashboard par bhej dein
    return redirect('/dashboard')
  }

  revalidatePath('/', 'layout')

  // 3. Logic: Moderator ko moderator dashboard par, baaki sab ko client dashboard par
  if (userData.role === 'moderator') {
    return redirect('/moderator/ads')
  } else {
    return redirect('/dashboard')
  }
}