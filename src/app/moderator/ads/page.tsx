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

  return (
    <div className="w-full max-w-7xl flex flex-col mt-12 mb-24 p-6 mx-auto">
      <h1 className="text-3xl font-bold mb-6 w-full text-gray-900 border-b pb-4">
        Moderator Review Queue
      </h1>

      <div className="w-full grid grid-cols-1 gap-6">
        {!ads || ads.length === 0 ? (
          <div className="border border-gray-200 rounded-md p-10 mt-6 bg-white text-center shadow-sm text-gray-500">
            <h3 className="font-bold text-xl text-gray-700 mb-2">Queue is Empty</h3>
            <p>You have reviewed all pending ads.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-900">Ad Title</th>
                  <th className="p-4 font-bold text-gray-900">User Email</th>
                  <th className="p-4 font-bold text-gray-900">Submitted At</th>
                  <th className="p-4 font-bold text-gray-900 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ads.map((ad: any) => (
                  <tr key={ad.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{ad.title}</td>
                    <td className="p-4 text-gray-600">{ad.users?.email || 'N/A'}</td>
                    <td className="p-4 text-gray-500">
                      {new Date(ad.created_at).toLocaleDateString()} {new Date(ad.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-right">
                      {/* Sahi dynamic routing link */}
                      <Link
                        href={`/moderator/ads/${ad.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition inline-block text-xs"
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