import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function ClientAdDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const { authorized, redirect: redirectPath } = await requireRole(['client', 'super_admin'])
  
  if (!authorized) {
    redirect(redirectPath!)
  }
  
  const supabase = await createClient()
  
  const { data: ad, error } = await supabase
    .from('ads')
    .select('*, ad_media(*)')
    .eq('id', id)
    .single()
    
  if (error || !ad) {
    return <div className="p-12 text-center text-red-500 font-bold">Ad not found.</div>
  }

  return (
    <div className="w-full max-w-5xl mt-12 mb-24 p-6 flex flex-col gap-6">
      <Link href="/client" className="text-blue-600 hover:underline mb-2">&larr; Back to Dashboard</Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 border border-gray-200 rounded-lg shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{ad.title}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded border border-gray-300 uppercase tracking-widest">
              {ad.status}
            </span>
          </div>
        </div>
        
        {ad.status === 'draft' && (
          <a href={`/client/ads/${ad.id}/submit`} className="bg-blue-600 text-white px-6 py-3 rounded-md shadow-sm hover:bg-blue-700 font-medium transition">
            Submit for Review
          </a>
        )}
        
        {ad.status === 'under_review' && (
           <span className="text-orange-700 font-medium border border-orange-200 bg-orange-50 px-5 py-3 rounded-md shadow-sm">
             Under Moderator Review
           </span>
        )}
        
        {ad.status === 'payment_pending' && (
          <Link href={`/client/ads/${ad.id}/payment`} className="bg-green-600 text-white px-6 py-3 rounded-md shadow-sm hover:bg-green-700 font-medium transition text-center">
            Proceed to Payment
          </Link>
        )}
      </div>

      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Ad Details</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ad.description}</p>
      </div>
      
      {ad.ad_media && ad.ad_media.length > 0 && (
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Media Preview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {ad.ad_media.map((media: any) => (
              <div key={media.id} className="border border-gray-200 rounded-md overflow-hidden bg-gray-50 flex flex-col p-2">
                {media.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media.thumbnail_url} alt="Media thumbnail" className="w-full h-40 object-cover rounded shadow-sm border border-gray-100" />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400 rounded">
                    No preview
                  </div>
                )}
                <span className="text-xs text-gray-500 mt-3 font-mono break-all line-clamp-2" title={media.original_url}>{media.original_url}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
