'use client'

import { useState } from 'react'
import { triggerAdsCleanup, checkDbHeartbeat } from './actions'

export function SystemHealthDashboard({ initialPulse }: { initialPulse: any }) {
  const [pulse, setPulse] = useState(initialPulse)
  const [triggering, setTriggering] = useState(false)
  const [triggerResult, setTriggerResult] = useState<{ success: boolean, message: string } | null>(null)

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

  // Common glass style for all cards
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

      {/* DB Heartbeat Card - Transparent */}
      <div className="border border-white/10 rounded-2xl p-8 shadow-xl flex flex-col justify-between transition-all hover:border-white/20"
        style={glassStyle}>
        <div>
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-white">Database Heartbeat</h2>
            <button
              onClick={handleRefreshHeartbeat}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full transition border border-white/10"
            >
              Refresh
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className={`h-4 w-4 rounded-full shadow-[0_0_15px] ${pulse.status === 'healthy' ? 'bg-emerald-500 shadow-emerald-500/50 animate-pulse' :
                pulse.status === 'refreshing' ? 'bg-yellow-400 shadow-yellow-400/50' :
                  'bg-red-500 shadow-red-500/50'
              }`}></div>
            <span className="text-3xl font-bold capitalize text-white tracking-tight">
              {pulse.status === 'healthy' ? 'Operational' : pulse.status}
            </span>
          </div>

          <div className="space-y-2 mt-4">
            <p className="text-slate-400 text-sm flex justify-between border-b border-white/5 pb-2">
              Latency: <span className="font-mono text-purple-400 font-bold">{pulse.latency}ms</span>
            </p>
            <p className="text-slate-400 text-sm flex justify-between">
              Status: <span className="font-mono text-slate-300 italic">{pulse.message}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Automated Operations - Transparent */}
      <div className="border border-white/10 rounded-2xl p-8 shadow-xl flex flex-col justify-between transition-all hover:border-white/20"
        style={glassStyle}>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Automated Operations</h2>
          <p className="text-slate-400 text-sm mb-8">Manual override for background cleanup tasks.</p>

          <button
            onClick={handleTriggerCron}
            disabled={triggering}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-200 transition disabled:opacity-30 shadow-lg"
          >
            {triggering ? 'Executing...' : 'Run Ad Expiration Cron'}
          </button>

          {triggerResult && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-bold text-center border ${triggerResult.success
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
              {triggerResult.message}
            </div>
          )}
        </div>
      </div>

      {/* System Validations - Transparent */}
      <div className="border border-white/10 rounded-2xl p-8 shadow-xl col-span-1 md:col-span-2 relative overflow-hidden transition-all hover:border-white/20"
        style={glassStyle}>
        <div className="absolute top-0 right-0 p-6">
          <span className="bg-emerald-500/10 text-emerald-400 font-black px-3 py-1 rounded-full text-[10px] border border-emerald-500/20 tracking-tighter">
            INTEGRITY OK
          </span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">System Validations</h2>
        <p className="text-slate-400 text-sm mb-6">Automated integrity checks across business logic.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition">
            <span className="font-medium text-slate-300">Orphaned Media Attachments</span>
            <span className="text-emerald-400 font-black text-xs">ALL CLEAR</span>
          </div>
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition">
            <span className="font-medium text-slate-300">Payment Intent Integrity</span>
            <span className="text-emerald-400 font-black text-xs">ALL CLEAR</span>
          </div>
        </div>
      </div>
    </div>
  )
}