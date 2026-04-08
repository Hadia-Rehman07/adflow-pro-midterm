import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

// Function name change kiya taake path se match kare
export default async function ModeratorAdsPage() {
  // 1. Role verification
  const { authorized, redirect: redirectPath } = await requireRole(['moderator', 'admin', 'super_admin'])

  // Agar authorized nahi hai toh redirect karega (Terminal 307 redirect yahan se ho raha hai)
  if (!authorized) redirect(redirectPath!)

  // 2. Database connection
  const supabase = await createClient()

  // 3. Fetching pending ads
  const { data: ads, error } = await supabase
    .from('ads')
    .select('id, title, status, created_at, users(email)')
    .eq('status', 'under_review')
    .order('created_at', { ascending: true })

  // Error handling agar DB fetch fail ho jaye
  if (error) {
    console.error("Database error:", error.message)
    return <div className="p-10 text-red-500">Error loading ads. Please try again later.</div>
  }

  // --- STYLING: Glassmorphism style (jaise purane dashboard par tha) ---
  const glassStyle = { background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)' };

  return (
    <div className="w-full max-w-7xl flex flex-col mt-12 mb-24 p-6 mx-auto text-white">

      {/* 1. Heading Color Changed to White & Border light */}
      <h1 className="text-3xl font-bold mb-6 w-full text-white border-b border-white/10 pb-4 tracking-tight">
        Moderator Review Queue
      </h1>

      <div className="w-full grid grid-cols-1 gap-6">
        {!ads || ads.length === 0 ? (
          // Box is now transparent
          <div className="border border-white/10 rounded-2xl p-10 mt-6 text-center shadow-sm text-slate-400" style={glassStyle}>
            <h3 className="font-bold text-xl text-white mb-2">Queue is Empty</h3>
            <p>You have reviewed all pending ads.</p>
          </div>
        ) : (
          // Table container is now transparent and border light
          <div className="overflow-x-auto border border-white/10 rounded-2xl shadow-xl" style={glassStyle}>
            <table className="w-full text-left text-sm text-slate-300">

              {/* Header background light and border updated */}
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-bold text-slate-100">Ad Title</th>
                  <th className="p-4 font-bold text-slate-100">User Email</th>
                  <th className="p-4 font-bold text-slate-100">Submitted At</th>
                  <th className="p-4 font-bold text-slate-100 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {ads.map((ad: any) => (
                  // Hover effect changed from blue to white/5 (for dark theme)
                  <tr key={ad.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-white">{ad.title}</td>
                    <td className="p-4 text-slate-300">{ad.users?.email || 'N/A'}</td>
                    <td className="p-4 text-slate-400">
                      {new Date(ad.created_at).toLocaleDateString()} {new Date(ad.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-right">
                      {/* 2. Button Color Changed from Blue to Purple */}
                      <Link
                        href={`/moderator/ads/${ad.id}`}
                        className="bg-purple-600 text-white px-5 py-2 rounded-full hover:bg-purple-700 font-medium transition inline-block text-[11px] tracking-wide"
                      >
                        Review Ad
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}