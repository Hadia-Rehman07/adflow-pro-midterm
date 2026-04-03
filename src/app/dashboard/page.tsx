import { getUserRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server' // Server-side check ke liye

export default async function DashboardRedirect() {
  const supabase = await createClient()

  // 1. Pehle check karein ke user login hai bhi ya nahi
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // 2. Role fetch karein
  const role = await getUserRole()

  // 3. Precise Redirection Logic
  if (role === 'admin' || role === 'super_admin') {
    redirect('/admin') // Aapka admin approvals page yahan hona chahiye
  } else if (role === 'moderator') {
    redirect('/moderator')
  } else {
    // Client dashboard jahan se wo ad post karega
    redirect('/client')
  }

  return null // Redirect handle ho jayega, kuch render karne ki zaroorat nahi
}