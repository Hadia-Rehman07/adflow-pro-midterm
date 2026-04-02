import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { SystemHealthDashboard } from './Dashboard'
import { checkDbHeartbeat } from './actions'

export default async function SystemHealthPage() {
  const { authorized, redirect: redirectPath } = await requireRole(['admin', 'super_admin'])
  
  if (!authorized) redirect(redirectPath!)

  const initialPulse = await checkDbHeartbeat()

  return (
    <div className="w-full max-w-7xl flex flex-col mt-12 mb-24 p-6 mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 border-b pb-4 w-full">System Health & Operations</h1>
      </div>
      
      <p className="text-slate-500 mb-8 max-w-3xl leading-relaxed">
        Monitor the real-time health of your infrastructure, run cron-based background jobs manually, and verify the integrity of critical operational constraints.
      </p>

      <SystemHealthDashboard initialPulse={initialPulse} />
    </div>
  )
}
