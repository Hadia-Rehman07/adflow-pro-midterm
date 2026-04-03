'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AdminAdsApproval() {
    const [pendingAds, setPendingAds] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // Data fetch karne ka function
    const fetchPendingAds = useCallback(async () => {
        const { data, error } = await supabase
            .from('ads')
            .select('*')
            .eq('status', 'under_review')
            .order('created_at', { ascending: false })

        if (!error) {
            setPendingAds(data || [])
        }
        setLoading(false)
    }, [supabase])

    // Real-time listener
    useEffect(() => {
        fetchPendingAds()

        const channel = supabase
            .channel('admin_ads_realtime_final')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, () => {
                fetchPendingAds()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, fetchPendingAds])

    const handleAction = async (id: string, newStatus: string, title: string, adUser: any) => {
        const { error: updateError } = await supabase
            .from('ads')
            .update({ status: newStatus })
            .eq('id', id)

        if (!updateError) {
            if (adUser) {
                await supabase.from('notifications').insert({
                    user_id: adUser,
                    title: newStatus === 'published' ? 'Listing Approved ✅' : 'Review Update',
                    message: `Your listing "${title}" is now ${newStatus}.`,
                    read: false
                });
            }
            fetchPendingAds();
        }
    }

    if (loading) return <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center font-black tracking-widest uppercase">Syncing...</div>

    return (
        <div className="min-h-screen bg-[#0a0e1a] bg-gradient-to-br from-[#0a0e1a] via-[#120d2d] to-[#0a0e1a] text-white font-sans selection:bg-blue-500/20 selection:text-white p-6 md:p-12 overflow-x-hidden">

            {/* Background Subtle Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />

            {/* MAIN CONTAINER: Tightened for compactness (max-w-6xl, my-16) */}
            <div className="max-w-6xl mx-auto my-16 bg-white/[0.02] border border-white/5 rounded-[56px] p-10 md:p-16 backdrop-blur-sm">

                <header className="mb-12 text-center">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-2">Ad Approvals</h1>
                    <p className="text-blue-500 text-[9px] font-bold tracking-[0.5em] uppercase opacity-60">Moderation Control Center</p>
                </header>

                <div className="w-full">
                    {pendingAds.length > 0 ? (
                        /* COMPACT GRID (md:grid-cols-2 lg:grid-cols-3) */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingAds.map((ad) => (
                                <div key={ad.id} className="bg-white/5 border border-white/10 p-8 rounded-[36px] flex flex-col justify-between hover:bg-white/[0.08] transition-all duration-300">
                                    <div>
                                        <div className="flex justify-between items-center mb-5">
                                            <span className="text-[8px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest bg-blue-500/10 text-blue-400">
                                                {ad.category || 'Listing'}
                                            </span>
                                            <span className="text-xl font-black">${Number(ad.price).toLocaleString()}</span>
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight mb-3 leading-tight">{ad.title}</h3>
                                        <p className="text-slate-400 text-xs mb-8 line-clamp-2 opacity-70 leading-relaxed">{ad.description}</p>
                                    </div>

                                    <div className="flex gap-3.5 pt-6 border-t border-white/5">
                                        <button
                                            onClick={() => handleAction(ad.id, 'published', ad.title, ad.user_id)}
                                            className="flex-1 bg-[#2563eb] hover:bg-blue-600 text-white py-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(ad.id, 'rejected', ad.title, ad.user_id)}
                                            className="px-6 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-500 border border-white/10 hover:border-red-500/30 transition-all"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Compact Centered Empty State */
                        <div className="w-full max-w-xl mx-auto py-24 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                            <div className="w-1.5 h-1.5 bg-blue-500/40 rounded-full mx-auto mb-6animate-pulse" />
                            <p className="text-slate-700 font-black uppercase tracking-[0.6em] text-[9px]">
                                All caught up. No ads pending review.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}