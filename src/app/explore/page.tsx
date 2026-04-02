import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function ExplorePage() {
  const supabase = await createClient()
  
  const { data: ads } = await supabase
    .from('ads')
    .select('*, ad_media(*), packages(name), cities(name), categories(name)')
    .eq('status', 'published')
    .order('publish_at', { ascending: false })

  const { data: categories } = await supabase.from('categories').select('id, name')

  const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
    basic:    { bg: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8' },
    standard: { bg: 'rgba(59, 130, 246, 0.2)',  text: '#60a5fa' },
    premium:  { bg: 'rgba(192, 132, 252, 0.2)', text: '#c084fc' },
  }

  return (
    <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 mt-8 p-6 mb-24">
      {/* Left Sidebar — Categories */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="rounded-2xl p-6 sticky top-24" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)' }}>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Categories</h2>
          <ul className="space-y-1">
            <li>
              <Link href="/explore" className="flex items-center w-full text-sm font-semibold text-white rounded-lg px-3 py-2 transition-all hover:bg-white/10">
                All Listings
              </Link>
            </li>
            {categories?.map((cat) => (
              <li key={cat.id}>
                <Link href={`/explore?category=${cat.id}`} className="flex items-center w-full text-sm text-slate-400 hover:text-white rounded-lg px-3 py-2 transition-all hover:bg-white/10">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Grid */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Explore Listings</h1>
          <span className="text-sm text-slate-500">{ads?.length || 0} ads found</span>
        </div>

        {!ads || ads.length === 0 ? (
          <div className="w-full text-center py-24 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-slate-400 font-medium">No published ads yet.</p>
            <p className="text-slate-500 mt-2">Be the first to post!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {ads.map((ad: any) => {
              const media = ad.ad_media && ad.ad_media.length > 0 ? ad.ad_media[0] : null
              const pkgName = (ad.packages?.name || 'basic').toLowerCase()
              const badge = BADGE_COLORS[pkgName] || BADGE_COLORS.basic
              return (
                <Link key={ad.id} href={`/explore/${ad.slug}`} className="group rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/20" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
                  <div className="w-full h-52 flex items-center justify-center overflow-hidden shrink-0 relative" style={{ background: 'rgba(15,23,42,0.8)' }}>
                    {media?.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media.thumbnail_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <span className="text-5xl opacity-30">🖼️</span>
                    )}
                    {/* Package Badge */}
                    <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.text}30` }}>
                      {ad.packages?.name || 'Basic'}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-base text-white line-clamp-2 leading-tight mb-2 group-hover:text-purple-300 transition-colors">{ad.title}</h3>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {ad.categories?.name && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(192, 132, 252, 0.12)', color: '#c084fc' }}>{ad.categories.name}</span>
                      )}
                      {ad.cities?.name && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>{ad.cities.name}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{ad.description}</p>
                    <div className="pt-3 border-t flex justify-between items-center" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <span className="text-xs text-slate-600">{new Date(ad.publish_at).toLocaleDateString()}</span>
                      <span className="text-xs font-bold transition-all group-hover:translate-x-1" style={{ color: '#c084fc' }}>View →</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

