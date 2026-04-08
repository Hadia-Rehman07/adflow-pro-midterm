import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { moderateAd } from './actions'

export default async function ModeratorReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { authorized, redirect: redirectPath } = await requireRole(['moderator', 'admin', 'super_admin'])
  if (!authorized) redirect(redirectPath!)

  const supabase = await createClient()

  const { data: ad, error } = await supabase
    .from('ads')
    .select('*, users(email), ad_media(*)')
    .eq('id', id)
    .single()

  if (error || !ad) {
    return (
      <div className="p-12 text-center bg-slate-950 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Ad Not Found</h1>
        <Link href="/moderator/ads" className="text-blue-400 hover:underline mt-4 inline-block font-medium">
          &larr; Go back to queue
        </Link>
      </div>
    )
  }

  // Transparent Glass Style
  const glassStyle = { background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(12px)' };

  return (
    <div className="w-full max-w-6xl mt-12 mb-24 p-6 flex flex-col gap-6 mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/moderator/ads" className="text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition">
          &larr; Back to Moderation Queue
        </Link>
        <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">ID: {id}</span>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">

        {/* LEFT COLUMN: AD DETAILS (AB TRANSPARENT HAI) */}
        <div
          className="flex-1 w-full p-8 border border-white/10 rounded-2xl shadow-sm overflow-hidden text-white"
          style={glassStyle}
        >
          <div className="border-b border-white/10 pb-4 mb-6">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{ad.title}</h1>
            <p className="text-sm text-slate-400 mt-3 flex items-center gap-2 italic">
              <span className="font-bold text-slate-200 not-italic uppercase text-[10px] bg-white/10 px-2 py-0.5 rounded">Owner:</span> {ad.users?.email}
            </p>
          </div>

          <div className="mb-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Description</h3>
            <div className="text-slate-200 text-lg whitespace-pre-wrap leading-relaxed bg-white/5 p-6 rounded-xl border border-white/5 shadow-inner">
              {ad.description}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5">Media Attachments</h3>
            {ad.ad_media && ad.ad_media.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {ad.ad_media.map((media: any) => (
                  <div key={media.id} className="group relative border border-white/10 p-1 rounded-xl bg-white/5 hover:shadow-lg transition-all duration-300">
                    {media.thumbnail_url ? (
                      <img
                        src={media.thumbnail_url}
                        alt="Ad content"
                        className="h-40 w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-40 w-full bg-white/5 rounded-lg flex items-center justify-center text-slate-500">No Image</div>
                    )}
                    <a
                      href={media.original_url}
                      target="_blank"
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-white text-[10px] font-black uppercase tracking-widest"
                    >
                      View Original
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-white/5 rounded-xl text-center text-slate-500 text-sm italic">
                No media uploaded for this listing.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DECISION PANEL (YE PEHLE SE DARK THA) */}
        <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-8">
          <div className="bg-slate-950 p-7 rounded-2xl shadow-2xl text-white border border-slate-800">
            <h3 className="font-bold border-b border-slate-800 pb-4 mb-6 flex items-center gap-2 text-sm tracking-widest uppercase">
              <span className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]"></span>
              Moderator Action
            </h3>

            <form action={moderateAd} className="flex flex-col gap-6">
              <input type="hidden" name="ad_id" value={ad.id} />
              <input type="hidden" name="userId" value={ad.user_id} />
              <input type="hidden" name="title" value={ad.title} />

              <div className="flex flex-col gap-2.5">
                <label htmlFor="feedback" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">
                  Feedback for User (Optional)
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  rows={4}
                  className="w-full border border-slate-800 rounded-xl p-4 text-sm bg-slate-900 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none transition-all"
                  placeholder="Explain your decision..."
                />
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  name="action"
                  value="approve"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-950/40 active:scale-[0.98] uppercase text-[10px] tracking-[0.2em]"
                >
                  Approve & Publish
                </button>

                <button
                  type="submit"
                  name="action"
                  value="reject"
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-rose-950/40 active:scale-[0.98] uppercase text-[10px] tracking-[0.2em]"
                >
                  Reject to Draft
                </button>

                <div className="border-t border-slate-800 mt-2 pt-6">
                  <button
                    type="submit"
                    name="action"
                    value="flag"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-xl transition-all shadow-lg shadow-amber-950/20 active:scale-[0.98] uppercase text-[10px] tracking-[0.2em]"
                  >
                    Flag Suspicious
                  </button>
                </div>
              </div>
            </form>
          </div>

          <p className="mt-5 text-[9px] text-slate-500 text-center uppercase tracking-widest font-medium">
            Authorized Personnel Only • Audit Log Active
          </p>
        </div>

      </div>
    </div>
  )
}