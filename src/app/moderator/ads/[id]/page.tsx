import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { moderateAd } from './actions'

export default async function ModeratorReviewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const { authorized, redirect: redirectPath } = await requireRole(['moderator', 'admin', 'super_admin'])
  
  if (!authorized) redirect(redirectPath!)
  
  const supabase = await createClient()
  const { data: ad, error } = await supabase
    .from('ads')
    .select('*, users(email), ad_media(*)')
    .eq('id', id)
    .single()
    
  if (error || !ad) {
    return <div className="p-12 text-center text-red-500 font-bold">Ad not found.</div>
  }

  return (
    <div className="w-full max-w-5xl mt-12 mb-24 p-6 flex flex-col gap-6">
      <Link href="/moderator" className="text-blue-600 hover:underline mb-2">&larr; Back to Queue</Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start bg-white p-8 border border-gray-200 rounded-lg shadow-sm gap-8">
        <div className="flex-1 overflow-hidden">
          <h1 className="text-3xl font-bold text-gray-900 break-words">{ad.title}</h1>
          <p className="text-sm text-gray-500 mt-2">Submitted by: {ad.users?.email}</p>
          <div className="mt-6">
            <h3 className="font-semibold mb-2 border-b pb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{ad.description}</p>
          </div>
          
          {ad.ad_media && ad.ad_media.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-4 text-gray-800">Media Attachments</h3>
              <div className="flex gap-4 flex-wrap">
                {ad.ad_media.map((media: any) => (
                  <div key={media.id} className="border p-2 rounded w-48 bg-gray-50 text-center flex flex-col items-center">
                    {media.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media.thumbnail_url} alt="thumbnail" className="h-32 object-cover rounded shadow-sm w-full" />
                    ) : (
                      <div className="h-32 w-full bg-gray-200 rounded flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    <a href={media.original_url} target="_blank" className="text-xs text-blue-600 hover:underline mt-2 truncate w-full" title={media.original_url}>
                      View Original
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-full md:w-80 bg-gray-50 border border-gray-200 p-6 rounded-md shadow-sm shrink-0">
          <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">Moderator Decision</h3>
          
          <form action={moderateAd} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={ad.id} />
            <div className="flex flex-col gap-2">
              <label htmlFor="note" className="text-sm font-medium text-gray-700">Internal Note / Rejection Reason</label>
              <textarea 
                id="note" 
                name="note" 
                rows={4} 
                className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-y"
                placeholder="Optional if approving. Required if rejecting."
              />
            </div>
            
            <div className="flex flex-col gap-3 mt-2">
              <button 
                type="submit" 
                name="action" 
                value="approve" 
                className="w-full bg-green-600 text-white font-medium py-2 px-4 rounded hover:bg-green-700 shadow-sm transition inline-flex justify-center items-center"
              >
                Approve (Move to Payment)
              </button>
              
              <button 
                type="submit" 
                name="action" 
                value="reject" 
                className="w-full bg-red-600 text-white font-medium py-2 px-4 rounded hover:bg-red-700 shadow-sm transition inline-flex justify-center items-center"
              >
                Reject (Return to Draft)
              </button>

              <button 
                type="submit" 
                name="action" 
                value="flag" 
                className="w-full bg-slate-800 text-white font-medium py-2 px-4 rounded hover:bg-slate-900 shadow-sm transition inline-flex justify-center items-center mt-2 border border-slate-700"
              >
                Flag for Suspicious Content
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
