import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function SystemHealthPage() {
  const { authorized, redirect: redirectPath } = await requireRole(['admin', 'super_admin'])
  
  if (!authorized) redirect(redirectPath!)
  
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('system_health_logs')
    .select('*')
    .order('checked_at', { ascending: false })
    .limit(20)

  return (
    <div className="w-full max-w-5xl mt-12 mb-24 p-6">
      <h1 className="text-3xl font-bold mb-6 w-full text-gray-900 border-b pb-4">System Health Logs</h1>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-900">Checked At</th>
              <th className="p-4 font-semibold text-gray-900">Source</th>
              <th className="p-4 font-semibold text-gray-900">Status</th>
              <th className="p-4 font-semibold text-gray-900 text-right">Response Time (ms)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs?.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50 transition">
                <td className="p-4">{new Date(log.checked_at).toLocaleString()}</td>
                <td className="p-4 font-medium">{log.source}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${log.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {log.status}
                  </span>
                </td>
                <td className="p-4 text-right font-mono">{log.response_ms} ms</td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr><td colSpan={4} className="p-12 text-center text-gray-500 font-medium">No health logs found. Trigger the /api/health/db endpoint or wait for cron.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
