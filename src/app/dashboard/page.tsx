import { getUserRole } from '@/utils/roles'
import { redirect } from 'next/navigation'

export default async function DashboardRedirect() {
  const role = await getUserRole()
  
  if (!role) {
    redirect('/login')
  }

  if (role === 'admin' || role === 'super_admin') {
    redirect('/admin')
  } else if (role === 'moderator') {
    redirect('/moderator')
  } else {
    redirect('/client')
  }
}
