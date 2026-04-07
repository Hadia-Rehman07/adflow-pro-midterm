import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function SystemHealthPage() {
  const { authorized, redirect: redirectPath } = await requireRole(['admin', 'super_admin'])

  if (!authorized) redirect(redirectPath!)

  const supabase = await createClient()

  // Aapke existing table se data fetch ho raha hai
  const { data: logs } = await supabase
    .from('system_health_logs')
    .select('*')
    .order('checked_at', { ascending: false })
    .limit(20)

  return (
    <div className="w-full max-w-7xl mt-12 mb-24 p-6 mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">System Health Logs</h1>

      {/* Transparent Card Design */}
      <div className="rounded-2xl border border-white/10 shadow-xl overflow-hidden"
        style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)' }}>

        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 border-b border-white/10">
            <tr className="text-slate-400 uppercase text-[10px] tracking-widest font-bold">
              <th className="p-5">Checked At</th>
              <th className="p-5">Source</th>
              <th className="p-5">Status</th>
              <th className="p-5 text-right">Response Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs?.map((log: any) => (
              <tr key={log.id} className="hover:bg-white/5 transition">
                <td className="p-5 font-mono text-xs text-slate-500">
                  {new Date(log.checked_at).toLocaleString()}
                </td>
                <td className="p-5 font-medium text-white">
                  {log.source}
                </td>
                <td className="p-5">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${log.status === 'healthy'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/20 text-red-400 border-red-500/20'
                    }`}>
                    {log.status}
                  </span>
                </td>
                <td className="p-5 text-right font-mono text-purple-400">
                  {log.response_ms} ms
                </td>
              </tr>
            ))}

            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={4} className="p-20 text-center text-slate-500 font-medium italic">
                  No health logs found. Trigger the heartbeat to see real-time data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}