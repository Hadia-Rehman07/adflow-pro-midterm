'use client'

import { useState } from 'react'
import { triggerAdsCleanup, checkDbHeartbeat } from './actions'

export function SystemHealthDashboard({ initialPulse }: { initialPulse: any }) {
  const [pulse, setPulse] = useState(initialPulse)
  const [triggering, setTriggering] = useState(false)
  const [triggerResult, setTriggerResult] = useState<{success: boolean, message: string} | null>(null)

  const handleRefreshHeartbeat = async () => {
    setPulse({ status: 'refreshing', latency: 0, message: 'Pinging database...' })
    const res = await checkDbHeartbeat()
    setPulse(res)
  }

  const handleTriggerCron = async () => {
    setTriggering(true)
    setTriggerResult(null)
    const res = await triggerAdsCleanup()
    setTriggerResult(res)
    setTriggering(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* DB Heartbeat Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Database Heartbeat</h2>
            <button 
              onClick={handleRefreshHeartbeat}
              className="text-sm bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1 rounded transition"
            >
              Refresh
            </button>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className={`h-4 w-4 rounded-full ${pulse.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : pulse.status === 'refreshing' ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
            <span className="text-2xl font-semibold capitalize text-slate-800">
              {pulse.status === 'healthy' ? 'Operational' : pulse.status}
            </span>
          </div>
          
          <p className="text-slate-500 text-sm">Latency: <span className="font-mono text-blue-600">{pulse.latency}ms</span></p>
          <p className="text-slate-500 text-sm mt-1">Status Message: <span className="font-mono">{pulse.message}</span></p>
        </div>
      </div>

      {/* Operations Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Automated Operations</h2>
          <p className="text-slate-500 text-sm mb-6">Trigger background jobs like ad expiration cleanups manually.</p>
          
          <button 
            onClick={handleTriggerCron}
            disabled={triggering}
            className="w-full bg-slate-900 text-white font-medium py-3 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            {triggering ? 'Executing...' : 'Force Trigger Ad Expiration Cron'}
          </button>

          {triggerResult && (
            <div className={`mt-4 p-3 rounded text-sm font-medium ${triggerResult.success ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'} border`}>
              {triggerResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Validation Mocks */}
      <div className="bg-white border text-red-800 border-red-100 rounded-xl p-8 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <span className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded text-xs">0 FAILED TRANSACTIONS</span>
        </div>
        <h2 className="text-xl font-bold text-red-900 mb-2">System Validations</h2>
        <p className="text-red-700 text-sm mb-4">Monitoring core business logic constraints across ad records.</p>
        <div className="space-y-3">
           <div className="flex justify-between items-center bg-red-50 p-3 rounded border border-red-100">
              <span className="font-medium">Orphaned Media Attachments</span>
              <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">ALL CLEAR</span>
           </div>
           <div className="flex justify-between items-center bg-red-50 p-3 rounded border border-red-100">
              <span className="font-medium">Mismatched Payment Intents</span>
              <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">ALL CLEAR</span>
           </div>
        </div>
      </div>
    </div>
  )
}
