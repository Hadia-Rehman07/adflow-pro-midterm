import { signup } from './actions'
import Link from 'next/link'

export default async function RegisterPage(props: { searchParams: Promise<{ error?: string }> }) {
  const params = await props.searchParams;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Glass Card */}
        <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full mb-4" style={{ background: 'rgba(192, 132, 252, 0.1)', border: '1px solid rgba(192, 132, 252, 0.2)', color: '#c084fc' }}>
              ✦ Exclusive Access
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Apply for Account</h1>
            <p className="text-slate-400 mt-2 text-sm">Join AdFlow Pro's premium marketplace</p>
          </div>

          {params?.error && (
            <div className="rounded-lg p-3 mb-6 text-sm font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>
              {params.error}
            </div>
          )}

          <form className="flex flex-col gap-5" action={signup}>
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="rounded-lg p-3 text-white text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-purple-400/50"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="rounded-lg p-3 text-white text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-purple-400/50"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="rounded-lg p-3 text-white text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-purple-400/50"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                placeholder="Min. 6 characters"
              />
            </div>

            {/* Requested Role */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="role" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Requested Role</label>
              <select
                id="role"
                name="role"
                className="rounded-lg p-3 text-white text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-purple-400/50 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <option value="client" style={{ background: '#1e1b4b' }}>Buyer (Default)</option>
                <option value="client" style={{ background: '#1e1b4b' }}>Seller</option>
                <option value="moderator" style={{ background: '#1e1b4b' }}>Moderator</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-purple w-full py-3 rounded-lg font-bold text-sm mt-2"
            >
              Apply & Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: '#c084fc' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

