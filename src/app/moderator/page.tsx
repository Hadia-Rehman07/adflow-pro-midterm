import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function ModeratorDashboard() {
  const { authorized, redirect: redirectPath } = await requireRole(['moderator', 'admin', 'super_admin'])
  
  if (!authorized) redirect(redirectPath!)
  
  const supabase = await createClient()
  const { data: ads } = await supabase
    .from('ads')
    .select('id, title, status, created_at, users(email)')
    .eq('status', 'under_review')
    .order('created_at', { ascending: true })

  return (
    <div className="w-full max-w-7xl flex flex-col mt-12 mb-24 p-6">
      <h1 className="text-3xl font-bold mb-6 w-full text-gray-900 border-b pb-4">Moderator Review Queue</h1>
      
      <div className="w-full grid grid-cols-1 gap-6">
        {!ads || ads.length === 0 ? (
          <div className="border border-gray-200 rounded-md p-10 mt-6 bg-white text-center shadow-sm text-gray-500">
            <h3 className="font-bold text-xl text-gray-700 mb-2">Queue is Empty</h3>
            <p>You have reviewed all pending ads.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-md shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-900">Ad Title</th>
                  <th className="p-4 font-semibold text-gray-900">User Email</th>
                  <th className="p-4 font-semibold text-gray-900">Submitted At</th>
                  <th className="p-4 font-semibold text-gray-900 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ads.map((ad: any) => (
                  <tr key={ad.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">{ad.title}</td>
                    <td className="p-4">{ad.users?.email}</td>
                    <td className="p-4">{new Date(ad.created_at).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <Link href={`/moderator/ads/${ad.id}`} className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                        Review &rarr;
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
