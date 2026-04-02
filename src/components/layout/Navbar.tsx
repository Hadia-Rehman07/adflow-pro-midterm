import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="w-full flex justify-center border-b border-white/10 h-16 shrink-0 sticky top-0 z-50" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="w-full max-w-7xl flex justify-between items-center px-6 text-sm">
        <Link href="/" className="font-extrabold flex items-center gap-1 text-xl tracking-tight text-white">
          AdFlow<span style={{ color: '#c084fc' }}>Pro</span>
        </Link>
        <div className="flex gap-6 items-center font-medium">
          <Link href="/explore" className="text-slate-300 hover:text-white transition-colors">Explore</Link>
          <Link href="/packages" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
              <form action="/auth/signout" method="post">
                <button className="text-sm border border-white/20 text-slate-300 hover:text-white hover:border-white/40 px-4 py-2 rounded-lg transition-all">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="btn-purple px-5 py-2 rounded-lg font-bold text-sm">
              Post an Ad
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

