'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function ClientDashboard() {
  const [stats, setStats] = useState({ totalValue: 0, activeAds: 0, notifications: 0 })
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const { data: adsData } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false })

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false)

    if (adsData) {
      const total = adsData.reduce((sum, ad) => sum + (Number(ad.price) || 0), 0)
      setStats({ totalValue: total, activeAds: adsData.length, notifications: count || 0 })
      setAds(adsData)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel('client_dashboard_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchData())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchData])

  if (loading) return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="text-purple-500 font-medium tracking-widest animate-pulse">Loading Dashboard...</div>
    </div>
  )

  return (
    <div
      className="min-h-screen text-slate-200 font-sans p-8 md:p-12"
      style={{
        background: 'linear-gradient(145deg, rgba(124,58,237,0.2), rgba(192,132,252,0.15))'
      }}
    >

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-2">Dashboard</h1>
          <p className="text-purple-400/60 text-xs font-medium tracking-[0.3em] uppercase">Campaign Management</p>
        </div>

        <Link href="/client/ads/new" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 active:scale-95">
          Create New Ad +
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="bg-white/[0.03] border border-white/5 p-10 rounded-3xl backdrop-blur-md">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Portfolio Value</p>
          <h2 className="text-4xl font-bold text-white">${stats.totalValue.toLocaleString()}</h2>
        </div>

        <div className="bg-gradient-to-br from-purple-600/90 to-purple-800 p-10 rounded-3xl shadow-2xl shadow-purple-900/20 border border-purple-500/30">
          <p className="text-[11px] font-bold text-purple-100 uppercase tracking-wider mb-3">Live & Pending</p>
          <h2 className="text-6xl font-black text-white">{stats.activeAds}</h2>
        </div>

        <div className={`p-10 rounded-3xl border transition-all duration-500 ${stats.notifications > 0 ? 'bg-white border-white' : 'bg-white/[0.03] border-white/5'}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${stats.notifications > 0 ? 'text-purple-600' : 'text-slate-500'}`}>Alerts</p>
          <h2 className={`text-6xl font-bold ${stats.notifications > 0 ? 'text-black' : 'text-white'}`}>
            {stats.notifications}
          </h2>
        </div>
      </div>

      {/* Listings Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap">Your Listings</h3>
          <div className="h-[1px] w-full bg-white/5"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <Link href={`/client/ads/${ad.id}`} key={ad.id} className="group bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start mb-8">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-tighter border ${ad.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : ad.status === 'under_review'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                    {ad.status.replace('_', ' ')}
                  </span>

                  <span className="text-2xl font-bold text-white">
                    ${Number(ad.price).toLocaleString()}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-1">
                  {ad.title}
                </h4>

                <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-2 opacity-70">
                  {ad.description}
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                  Details
                </span>
                <span className="text-purple-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}