import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function ClientDashboard() {
  // 1. Force TypeScript to accept the result shape for authorization
  const { authorized, redirect: redirectPath, role } = await requireRole(['client', 'super_admin']) as any;

  // Safely check for authorization
  if (!authorized) {
    redirect(redirectPath || '/login');
  }

  // Use explicit supabase server client to fetch user securely
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch Ads
  const { data: ads, error } = await supabase
    .from('ads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 3. Fetch Quick Stats Data
  const { count: activeAds } = await supabase.from('ads').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['published', 'payment_pending']);
  const { data: payments } = await supabase.from('payments').select('amount').eq('user_id', user.id).eq('status', 'verified');
  const totalSpent = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const { count: pendingNotifications } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false);

  return (
    <div className="w-full max-w-7xl flex flex-col items-center mt-12 p-6 mx-auto">
      <div className="w-full flex justify-between items-center mb-8 px-4">
        <h1 className="text-4xl font-extrabold text-slate-900 border-b-4 border-blue-600 pb-2 inline-block">Client Dashboard</h1>
        <Link
          href="/client/ads/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-md shadow-blue-500/20"
        >
          Create New Ad +
        </Link>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 px-4 w-full">
         <div className="bg-slate-900 text-white border-none rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col">
            <h3 className="text-slate-400 font-bold uppercase text-xs tracking-wider">Total Spent</h3>
            <span className="text-4xl font-extrabold mt-3">${totalSpent.toFixed(2)}</span>
            <div className="absolute -right-4 -bottom-4 bg-slate-800 opacity-50 w-24 h-24 rounded-full blur-2xl pointer-events-none" />
         </div>
         <div className="bg-blue-600 text-white border-none rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col">
            <h3 className="text-blue-200 font-bold uppercase text-xs tracking-wider">Active & Pending Ads</h3>
            <span className="text-4xl font-extrabold mt-3">{activeAds || 0}</span>
            <div className="absolute -right-4 -bottom-4 bg-blue-500 opacity-60 w-24 h-24 rounded-full blur-2xl pointer-events-none" />
         </div>
         <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col relative">
            <h3 className="text-slate-500 font-bold uppercase text-xs tracking-wider">Unread Notifications</h3>
             <span className="text-4xl font-extrabold mt-3 text-slate-800">{pendingNotifications || 0}</span>
              {pendingNotifications && pendingNotifications > 0 ? (
                 <div className="absolute top-6 right-6 h-3 w-3 bg-red-500 rounded-full animate-ping" />
              ) : null}
         </div>
      </div>

      {(!ads || ads.length === 0) ? (
        <div className="w-full mt-8 border border-gray-100 rounded-xl p-16 text-center text-gray-500 bg-white shadow-sm">
          <div className="text-4xl mb-4">📢</div>
          <p className="text-xl font-semibold text-gray-700">No ads found</p>
          <p className="text-sm mt-2">Submit your first ad to see it here.</p>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {ads.map((ad: any) => {
            let statusColor = 'bg-slate-100 text-slate-700 border-slate-200';
            if (ad.status === 'under_review') statusColor = 'bg-orange-100 text-orange-800 border-orange-200';
            else if (ad.status === 'payment_submitted' || ad.status === 'payment_pending') statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-300';
            else if (ad.status === 'published') statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
            else if (ad.status === 'expired') statusColor = 'bg-red-50 text-red-700 border-red-200';

            return (
              <div key={ad.id} className="bg-slate-50/70 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out p-6 flex flex-col h-full group">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{ad.title}</h3>
                  <span className={`text-[10px] whitespace-nowrap font-black px-2 py-1 rounded-md uppercase border ${statusColor}`}>
                    {ad.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                  {ad.description}
                </p>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center mt-auto">
                  <Link
                    href={`/client/ads/${ad.id}`}
                    className="text-blue-600 text-sm font-bold hover:text-blue-800 flex items-center gap-1 group/link"
                  >
                    Manage Ad <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                  </Link>
                  {ad.status === 'payment_pending' && (
                     <Link href={`/packages?ad_id=${ad.id}`} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded font-bold hover:bg-slate-800 transition">
                       Select Package
                     </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}