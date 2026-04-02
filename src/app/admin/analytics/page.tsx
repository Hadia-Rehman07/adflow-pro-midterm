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

  // Mock revenue mapping just to show the chart
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

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col mt-12 mb-24 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 border-b pb-4 w-full">Analytics & Reports</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800 hover:-translate-y-1 transition-all">
          <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider">Total Ads Lifetime</h3>
          <span className="text-4xl font-bold mt-2 block">{totalAds || 0}</span>
        </div>
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg border border-blue-500 hover:-translate-y-1 transition-all">
          <h3 className="text-blue-200 font-medium text-sm uppercase tracking-wider">Active (Published)</h3>
          <span className="text-4xl font-bold mt-2 block">{publishedAds || 0}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-all">
          <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Pending Reviews</h3>
          <span className="text-4xl font-bold mt-2 text-orange-500 block">{pendingReviews || 0}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:-translate-y-1 transition-all">
          <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Expired Ads</h3>
          <span className="text-4xl font-bold mt-2 text-slate-400 block">{expiredAds || 0}</span>
        </div>
      </div>

      <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-sm w-full mt-8 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-slate-500 mb-2 uppercase tracking-wide">Total Verified Revenue</h2>
        <span className="text-6xl font-extrabold text-blue-600 block">${totalRevenue.toFixed(2)}</span>
      </div>

      <AnalyticsCharts revenueData={revenueData} statusData={statusData} />
    </div>
  )
}
