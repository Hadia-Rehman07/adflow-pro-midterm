import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { checkDbHeartbeat } from '@/app/admin/system-health/actions'

export default async function AdminDashboard() {
  const { authorized, redirect: redirectPath } = await requireRole(['admin', 'super_admin'])

  if (!authorized) {
    redirect(redirectPath!)
  }

  const supabase = await createClient()

  // Data Fetching Logic (No changes)
  const { count: pendingCount } = await supabase.from('packages').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  const { count: adsCount } = await supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'published')
  const health = await checkDbHeartbeat()

  const glassStyle = { background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)' };

  return (
    <div className="w-full max-w-7xl flex flex-col mt-12 p-6 mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Admin Dashboard</h1>

      {/* Grid: Ab tamam 5 boxes aik hi size aur style ke hain */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Box 1: Pending Verifications */}
        <div className="p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col transition-all hover:border-white/20" style={glassStyle}>
          <h3 className="text-slate-400 font-medium text-[10px] tracking-widest uppercase">Pending Verifications</h3>
          <span className="text-4xl font-bold mt-3">{pendingCount || 0}</span>
          <Link href="/admin/payments" className="text-purple-400 text-sm mt-6 hover:text-purple-300 transition font-medium">
            View queue &rarr;
          </Link>
        </div>

        {/* Box 2: Active Ads */}
        <div className="p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col transition-all hover:border-white/20" style={glassStyle}>
          <h3 className="text-slate-400 font-medium text-[10px] tracking-widest uppercase">Active Ads</h3>
          <span className="text-4xl font-bold mt-3">{adsCount || 0}</span>
          <Link href="/explore" className="text-purple-400 text-sm mt-6 hover:text-purple-300 transition font-medium">
            View all &rarr;
          </Link>
        </div>

        {/* Box 3: Health Logs */}
        <div className="p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col transition-all hover:border-white/20" style={glassStyle}>
          <h3 className="text-slate-400 font-medium text-[10px] tracking-widest uppercase">Health Logs</h3>
          <div className="flex items-baseline gap-2 mt-3">
            <span className={`text-4xl font-bold ${health.status === 'healthy' ? 'text-emerald-400' : 'text-red-500'}`}>
              {health.status === 'healthy' ? 'OK' : 'DOWN'}
            </span>
            <span className="text-xs text-slate-500 font-mono">({health.latency}ms)</span>
          </div>
          <Link href="/admin/health" className="text-purple-400 text-sm mt-6 hover:text-purple-300 transition font-medium">
            View logs &rarr;
          </Link>
        </div>

        {/* Box 4: System Operations (Ab bilkul upar jesa hai) */}
        <div className="p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col transition-all hover:border-white/20" style={glassStyle}>
          <h3 className="text-slate-400 font-medium text-[10px] tracking-widest uppercase">System Operations</h3>
          <span className="text-2xl font-bold mt-3 leading-tight">System Health</span>
          <Link href="/admin/system-health" className="text-purple-400 text-sm mt-6 hover:text-purple-300 transition font-medium">
            Open Dashboard &rarr;
          </Link>
        </div>

        {/* Box 5: Platform Insights (Ab bilkul upar jesa hai) */}
        <div className="p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col transition-all hover:border-white/20" style={glassStyle}>
          <h3 className="text-slate-400 font-medium text-[10px] tracking-widest uppercase">Platform Insights</h3>
          <span className="text-2xl font-bold mt-3 leading-tight text-blue-400">Analytics Reports</span>
          <Link href="/admin/analytics" className="text-purple-400 text-sm mt-6 hover:text-purple-300 transition font-medium">
            View Analytics &rarr;
          </Link>
        </div>

      </div>
    </div>
  )
}