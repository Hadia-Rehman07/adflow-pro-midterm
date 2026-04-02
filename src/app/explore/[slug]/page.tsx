import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function AdDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: ad } = await supabase
    .from('ads')
    .select('*, ad_media(*), packages(name), cities(name), categories(name), seller_profiles(display_name, phone)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!ad) {
    notFound()
  }

  const media = ad.ad_media && ad.ad_media.length > 0 ? ad.ad_media[0] : null
  const pkgName = (ad.packages?.name || 'basic').toLowerCase()
  const BADGE: Record<string, string> = { basic: '#94a3b8', standard: '#60a5fa', premium: '#c084fc' }
  const badgeColor = BADGE[pkgName] || BADGE.basic

  return (
    <div className="w-full max-w-7xl mt-8 mb-24 px-6 mx-auto">
      <Link href="/explore" className="inline-flex items-center gap-2 text-sm mb-8 text-slate-400 hover:text-white transition-colors">
        ← Back to Explore
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left — Image Gallery */}
        <div className="flex-1">
          {/* Main Image */}
          <div className="w-full rounded-2xl overflow-hidden relative" style={{ height: '420px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {media?.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media.thumbnail_url} alt={ad.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-6xl mb-4 opacity-30">🖼️</div>
                <span className="text-slate-600 text-sm">No image available</span>
              </div>
            )}
            {/* Package badge overlaid */}
            <span className="absolute top-4 left-4 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ background: `${badgeColor}20`, color: badgeColor, border: `1px solid ${badgeColor}40`, backdropFilter: 'blur(8px)' }}>
              {ad.packages?.name || 'Basic'} Package
            </span>
          </div>

          {/* More media thumbnails */}
          {ad.ad_media && ad.ad_media.length > 1 && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {ad.ad_media.slice(1).map((m: any) => (
                <div key={m.id} className="w-24 h-24 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  {m.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.thumbnail_url} alt="media" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600 text-xs">N/A</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mt-8 rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(192,132,252,0.15)', color: '#c084fc' }}>
                {ad.categories?.name || 'Uncategorized'}
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                {ad.cities?.name || 'Any Location'}
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-semibold text-slate-600" style={{ background: 'rgba(255,255,255,0.03)' }}>
                Published {new Date(ad.publish_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-6">{ad.title}</h1>

            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Description</h2>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-base">{ad.description}</p>
          </div>
        </div>

        {/* Right — Sticky Card */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="rounded-2xl p-6 lg:sticky lg:top-24" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(24px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            {/* Seller Info */}
            <div className="mb-6 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Listed By</div>
              <div className="font-bold text-white text-lg">{ad.seller_profiles?.display_name || 'Anonymous Seller'}</div>
              <span className="text-xs mt-1 inline-block" style={{ color: badgeColor }}>✓ Verified Seller</span>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              {ad.seller_profiles?.phone ? (
                <a
                  href={`tel:${ad.seller_profiles.phone}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                >
                  📞 Contact Seller
                </a>
              ) : (
                <div className="text-center text-xs text-slate-600 py-2">No contact info provided.</div>
              )}

              {user ? (
                <Link
                  href={`/packages?ad_id=${ad.id}`}
                  className="btn-purple w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                >
                  🛒 Buy Now
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
                  style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.3)', color: '#c084fc' }}
                >
                  Log In to Buy Now
                </Link>
              )}
            </div>

            {/* Package info */}
            <div className="mt-6 pt-6 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Package Benefits</div>
              {[
                pkgName === 'premium' && '30 Days Duration',
                pkgName === 'standard' && '15 Days Duration',
                pkgName === 'basic' && '7 Days Duration',
                pkgName !== 'basic' && '⚡ Priority Placement',
                pkgName === 'premium' && '🔥 Homepage Featured',
                '✅ Moderation Verified',
              ].filter(Boolean).map((feature) => (
                <div key={String(feature)} className="flex items-center gap-2 text-sm text-slate-400">
                  <span style={{ color: '#c084fc' }}>✦</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

