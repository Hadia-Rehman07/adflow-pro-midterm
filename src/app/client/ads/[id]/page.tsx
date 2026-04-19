'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { submitAdForReview, deleteAdAction } from '../new/actions'

export default function ClientAdDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [ad, setAd] = useState<any>(null)
  const [adMedia, setAdMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { id } = await params
      const { data: adData } = await supabase.from('ads').select('*').eq('id', id).single()

      if (!adData) {
        setLoading(false)
        return
      }

      const { data: mediaData } = await supabase.from('ad_media').select('*').eq('ad_id', id)

      setAd(adData)
      setAdMedia(mediaData || [])
      setLoading(false)
    }
    fetchData()
  }, [params, supabase])

  if (loading) return <div className="p-20 text-center text-white font-bold tracking-widest">LOADING...</div>

  if (!ad) {
    return (
      <div className="p-12 text-center bg-[#0a0e1a] min-h-screen flex flex-col items-center justify-center font-sans text-white">
        <h1 className="text-red-500 text-5xl font-black mb-4 tracking-tighter">AD NOT FOUND</h1>
        <Link href="/client" className="text-purple-400 hover:underline font-bold">Return to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mt-12 mb-24 px-6 mx-auto flex flex-col gap-8 min-h-screen text-white font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <Link href="/client" className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest group">
          <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">

          {/* UPDATE BUTTON */}
          <Link
            href={`/client/ads/${ad.id}/edit`}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-500 hover:to-purple-700 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20"
          >
            Update Ad
          </Link>

          <button
            onClick={async () => {
              if (window.confirm("Are you sure you want to delete this ad permanently?")) {
                await deleteAdAction(ad.id)
                router.push('/client')
              }
            }}
            className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all text-[10px] uppercase tracking-widest"
          >
            Delete Ad
          </button>

        </div>
      </div>

      {/* MAIN BOX (PROPER GLASS BLUR) */}
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-purple-600 text-white px-3 py-1 rounded font-bold uppercase tracking-tighter">
              {ad.category || 'General'}
            </span>

            <h1 className="text-4xl font-extrabold text-white tracking-tight uppercase">
              {ad.title}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest bg-white/5">
              {ad.status.replace('_', ' ')}
            </span>

            <span className="text-3xl font-black text-white">
              ${Number(ad.price || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {ad.status === 'draft' && (
          <button
            onClick={async () => {
              await submitAdForReview(ad.id)
              router.refresh()
            }}
            className="bg-purple-600 text-white px-10 py-4 rounded-xl shadow-lg hover:bg-purple-700 font-bold text-xs tracking-widest uppercase transition-all"
          >
            SUBMIT FOR REVIEW
          </button>
        )}

        <div className="absolute -right-20 -top-20 bg-purple-600/10 w-64 h-64 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* DESCRIPTION BOX (GLASS FIX) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl min-h-[350px]">
            <h2 className="text-[11px] font-bold text-purple-400 uppercase tracking-[0.3em] mb-10">
              Ad Description
            </h2>

            <p className="text-slate-300 leading-relaxed text-xl">
              "{ad.description}"
            </p>
          </div>
        </div>

        {/* MEDIA BOX (GLASS FIX) */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl">

          <h2 className="text-[11px] font-bold text-purple-400 uppercase tracking-[0.3em] mb-8">
            Media Gallery
          </h2>

          {adMedia.length > 0 ? (
            <div className="grid gap-6">
              {adMedia.map((media: any) => (
                <div
                  key={media.id}
                  className="rounded-2xl overflow-hidden bg-black/30 aspect-square border border-white/10 shadow-xl group"
                >
                  <img
                    src={media.original_url || media.thumbnail_url}
                    alt="Ad Content"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as any).src =
                        'https://placehold.co/600x600/111827/white?text=Broken+Image+URL'
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-64 bg-white/5 border border-white/10 flex flex-col items-center justify-center text-slate-500 rounded-2xl gap-4 backdrop-blur-xl">
              <span className="text-5xl opacity-20">🖼️</span>
              <p className="text-[10px] font-bold uppercase tracking-widest">
                No Media Assets Detected
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}