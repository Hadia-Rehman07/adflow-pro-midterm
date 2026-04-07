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

  // 2. Database se role check karein
  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (roleError || !userData) {
    console.error("Role fetching error:", roleError)
    return redirect('/dashboard')
  }

  revalidatePath('/', 'layout')

  // 3. Logic: Role ke mutabiq sahi jagah bhejein
  if (userData.role === 'admin') {
    return redirect('/admin') // Admin ke liye naya rasta
  } else if (userData.role === 'moderator') {
    return redirect('/moderator/ads') // Moderator ka purana rasta
  } else {
    return redirect('/dashboard') // Client ka purana rasta
  }
}