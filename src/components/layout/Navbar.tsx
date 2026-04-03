import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="w-full flex justify-center border-b border-white/5 h-16 shrink-0 sticky top-0 z-50 bg-transparent backdrop-blur-md">
      <div className="w-full max-w-7xl flex justify-between items-center px-6 text-sm">

        {/* Logo */}
        <Link href="/" className="font-extrabold flex items-center gap-1 text-xl tracking-tight text-white">
          AdFlow<span style={{ color: '#c084fc' }}>Pro</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-6 items-center font-medium">
          <Link href="/explore" className="text-slate-300 hover:text-white transition-colors">Explore</Link>
          <Link href="/categories" className="text-slate-300 hover:text-white transition-colors">Categories</Link>
          <Link href="/packages" className="text-slate-300 hover:text-white transition-colors">Packages</Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
              <form action="/auth/signout" method="post">
                {/* Logout button - Light style with subtle hover */}
                <button className="text-[13px] border border-red-500/20 text-red-500/80 hover:bg-red-500/10 hover:border-red-500/40 px-3 py-1.5 rounded-md transition-all duration-300">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="bg-[#c084fc] hover:bg-[#a855f7] text-white px-5 py-2 rounded-lg font-bold text-sm transition-all">
              Post an Ad
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}