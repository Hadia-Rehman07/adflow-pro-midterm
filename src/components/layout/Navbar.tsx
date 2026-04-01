import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="w-full flex justify-center border-b h-16 bg-white shrink-0 sticky top-0 z-50">
      <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
        <Link href="/" className="font-bold flex items-center gap-1 text-2xl tracking-tighter">
          AdFlow<span className="text-blue-600">Pro</span>
        </Link>
        <div className="flex gap-6 items-center font-medium">
          <Link href="/explore" className="hover:text-blue-600 transition-colors">Explore</Link>
          <Link href="/packages" className="hover:text-blue-600 transition-colors">Pricing</Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
              <form action="/auth/signout" method="post">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-md transition-colors">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm">
              Post an Ad
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
