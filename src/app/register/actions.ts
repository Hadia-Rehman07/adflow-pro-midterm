'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = (formData.get('full_name') || 'New User') as string
  const role = (formData.get('role') as string) || 'client'

  // 1. Auth SignUp
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, role: role }
    }
  })

  if (authError) {
    if (!authError.message.includes("already registered")) {
      return redirect('/register?error=' + encodeURIComponent(authError.message))
    }
  }

  // 2. Database Insert
  const userId = authData?.user?.id;

  if (userId) {
    // Step A: 'users' table mein entry (Moderator aur Client dono ke liye)
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: email,
        name: name,
        role: role
      }, { onConflict: 'id' })

    if (dbError) {
      console.error("Critical DB Error:", dbError.message)
      return redirect('/register?error=Database_Error:_' + encodeURIComponent(dbError.message))
    }

    // Step B: AGAR ROLE 'client' HAI, TOH SELLER PROFILE BANAO
    // Isi ki wajah se client ka dashboard "Page Not Found" de raha hai
    if (role === 'client') {
      const { error: profileError } = await supabase
        .from('seller_profiles')
        .upsert({
          user_id: userId,
          full_name: name,
          bio: 'Welcome to my store!', // Default bio
        }, { onConflict: 'user_id' })

      if (profileError) {
        console.error("Seller Profile Error:", profileError.message)
      }
    }
  }

  return redirect('/login?message=Account+setup+complete.+Please+login.')
}