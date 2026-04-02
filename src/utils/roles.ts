import { createClient } from '@/utils/supabase/server'

export async function getUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch from public.users table
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
    
  return profile?.role || user.user_metadata?.role || 'client'
}

export async function requireRole(allowedRoles: string[]) {
  const role = await getUserRole()
  
  if (!role) {
    return { authorized: false, redirect: '/login' }
  }
  
  if (!allowedRoles.includes(role)) {
    return { authorized: false, redirect: '/dashboard' } // redirect back to safe dashboard
  }

  return { authorized: true, role }
}
