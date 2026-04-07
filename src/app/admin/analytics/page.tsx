import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { AnalyticsCharts } from './Charts'

export default async function AnalyticsDashboard() {
  const { authorized, redirect: redirectPath } = await requireRole(['admin', 'super_admin'])

  if (!authorized) redirect(redirectPath!)

  const supabase = await createClient()

  const { count: totalAds } = await supabase.from('ads').select('*', { count: 'exact', head: true })
  const { count: publishedAds } = await supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'published')
  const { count: pendingReviews } = await supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'under_review')
  const { count: expiredAds } = await supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'expired')

  const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'verified')
  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  const revenueData = [
    { name: 'Basic', amount: 99.9 },
    { name: 'Standard', amount: totalRevenue > 99.9 ? totalRevenue - 99.9 : 249.9 },
    { name: 'Premium', amount: 499.9 }
  ]

  const statusData = [
    { name: 'Published', value: publishedAds || 1 },
    { name: 'Under Review', value: pendingReviews || 0 },
    { name: 'Expired', value: expiredAds || 0 },
    { name: 'Draft', value: (totalAds || 0) - (publishedAds || 0) - (pendingReviews || 0) - (expiredAds || 0) }
  ]

  // Common glass style for cards
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col mt-12 mb-24 p-6">
      <div className="flex justify-between items-center mb-8">
        {/* Text color changed to white as requested */}
        <h1 className="text-4xl font-extrabold text-white border-b border-white/10 pb-4 w-full">
          Analytics & Reports
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Ads */}
        <div className="p-6 rounded-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all"
          style={glassStyle}>
          <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">Total Ads Lifetime</h3>
          <span className="text-4xl font-bold mt-2 block text-white">{totalAds || 0}</span>
        </div>

        {/* Card 2: Active Ads (Blue Glass Effect) */}
        <div className="p-6 rounded-2xl border border-blue-500/20 shadow-xl hover:border-blue-500/40 transition-all"
          style={{ background: 'rgba(37, 99, 235, 0.1)', backdropFilter: 'blur(12px)' }}>
          <h3 className="text-blue-300 font-medium text-sm uppercase tracking-wider">Active (Published)</h3>
          <span className="text-4xl font-bold mt-2 block text-white">{publishedAds || 0}</span>
        </div>

        {/* Card 3: Pending Reviews */}
        <div className="p-6 rounded-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all"
          style={glassStyle}>
          <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">Pending Reviews</h3>
          <span className="text-4xl font-bold mt-2 text-orange-400 block">{pendingReviews || 0}</span>
        </div>

        {/* Card 4: Expired Ads */}
        <div className="p-6 rounded-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all"
          style={glassStyle}>
          <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">Expired Ads</h3>
          <span className="text-4xl font-bold mt-2 text-slate-500 block">{expiredAds || 0}</span>
        </div>
      </div>

      {/* Revenue Card - Transparent */}
      <div className="p-8 rounded-2xl border border-white/10 shadow-xl w-full mt-8 flex flex-col items-center justify-center"
        style={glassStyle}>
        <h2 className="text-xl font-bold text-slate-400 mb-2 uppercase tracking-wide">Total Verified Revenue</h2>
        <span className="text-6xl font-extrabold text-blue-400 block tracking-tighter">
          ${totalRevenue.toFixed(2)}
        </span>
      </div>

      <AnalyticsCharts revenueData={revenueData} statusData={statusData} />
    </div>
  )
}