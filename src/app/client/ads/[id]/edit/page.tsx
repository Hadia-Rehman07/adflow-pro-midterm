'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateAdAction } from '../../new/actions'

export default function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
    const [ad, setAd] = useState<any>(null)
    const [mediaUrl, setMediaUrl] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function fetchAdAndMedia() {
            const { id } = await params

            // 1. Fetch Ad Basic Info
            const { data: adData } = await supabase.from('ads').select('*').eq('id', id).single()

            // 2. Fetch Media Info to get current URL
            const { data: mediaData } = await supabase.from('ad_media').select('original_url').eq('ad_id', id).single()

            if (adData) {
                setAd(adData)
                setMediaUrl(mediaData?.original_url || '')
            }
            setLoading(false)
        }
        fetchAdAndMedia()
    }, [params, supabase])

    if (loading) return <div className="p-20 text-center text-white font-bold uppercase tracking-widest">Loading Ad Data...</div>
    if (!ad) return <div className="p-20 text-center text-red-500 font-bold">AD NOT FOUND</div>

    const handleSubmit = async (formData: FormData) => {
        setUpdating(true)
        try {
            // Hum updateAdAction ko call kar rahe hain jo database update karega
            await updateAdAction(ad.id, formData)
            router.push(`/client/ads/${ad.id}`)
            router.refresh()
        } catch (err) {
            alert("Update failed: " + (err as Error).message)
        } finally {
            setUpdating(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto mt-12 mb-24 px-6 text-white font-sans">

            <div className="bg-[#111827] border border-white/5 p-10 rounded-3xl shadow-2xl">
                <h1 className="text-3xl font-black mb-10 uppercase tracking-tight text-blue-500">Update Listing</h1>

                <form action={handleSubmit} className="space-y-8">
                    {/* Title Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ad Title</label>
                        <input
                            name="title"
                            defaultValue={ad.title}
                            required
                            className="bg-black/40 border border-white/10 p-4 rounded-xl focus:border-blue-600 outline-none transition-all font-medium"
                        />
                    </div>

                    {/* Price Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Price ($)</label>
                        <input
                            name="price"
                            type="number"
                            defaultValue={ad.price}
                            required
                            className="bg-black/40 border border-white/10 p-4 rounded-xl focus:border-blue-600 outline-none transition-all font-medium"
                        />
                    </div>

                    {/* Image URL Update Option (New) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Image URL</label>
                        <input
                            name="media_url"
                            defaultValue={mediaUrl}
                            className="bg-black/40 border border-white/10 p-4 rounded-xl focus:border-blue-600 outline-none transition-all font-medium text-blue-400"
                            placeholder="Paste new image link here..."
                        />
                    </div>

                    {/* Description Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</label>
                        <textarea
                            name="description"
                            defaultValue={ad.description}
                            rows={6}
                            required
                            className="bg-black/40 border border-white/10 p-4 rounded-xl focus:border-blue-600 outline-none transition-all font-medium resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-6 pt-4">
                        <button
                            type="submit"
                            disabled={updating}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            {updating ? 'SAVING...' : 'SAVE UPDATES'}
                        </button>

                        {/* Corrected Discard Button: Bypasses form and redirects back */}
                        <Link
                            href={`/client/ads/${ad.id}`}
                            className="text-slate-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
                        >
                            Discard Changes
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}