import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: ads } = await supabase
    .from('ads')
    .select('*, ad_media(*), categories(name)')
    .eq('status', 'published')
    .order('publish_at', { ascending: false })
    .limit(4)

  return (
    <div className="w-full pb-24">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center px-6 text-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px] opacity-30" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full" style={{ background: 'rgba(192, 132, 252, 0.1)', border: '1px solid rgba(192, 132, 252, 0.25)', color: '#c084fc' }}>
            ✦ Premium Sponsored Listings Platform
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight lg:text-7xl leading-[1.1] text-white">
            The Premier Marketplace<br />
            <span style={{ background: 'linear-gradient(135deg, #c084fc 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              for Sponsored Listings
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            AdFlow Pro helps you reach your target audience through moderated, high-quality ad placements with flexible scheduling and instant analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/explore" className="btn-purple px-10 py-4 rounded-xl font-bold text-lg shadow-2xl">
              Explore Ads
            </Link>
            <Link href="/packages" className="px-10 py-4 rounded-xl font-bold text-lg text-white transition-all hover:-translate-y-0.5 hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
              View Packages
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-12 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {[['500+', 'Active Listings'], ['98%', 'Satisfaction Rate'], ['3x', 'Avg. ROI Increase']].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-extrabold" style={{ color: '#c084fc' }}>{num}</div>
                <div className="text-sm text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Featured Listings</h2>
            <p className="text-slate-400 mt-2">Discover the latest top-tier ads published on AdFlow Pro.</p>
          </div>
          <Link href="/explore" className="text-sm font-semibold transition-colors" style={{ color: '#c084fc' }}>
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {!ads || ads.length === 0 ? (
            <div className="col-span-full py-16 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-4xl mb-4">📢</div>
              <span className="text-slate-500 font-medium">No active ads right now. Be the first to post!</span>
            </div>
          ) : (
            ads.map((ad: any) => {
              const media = ad.ad_media && ad.ad_media.length > 0 ? ad.ad_media[0] : null
              return (
                <Link key={ad.id} href={`/explore/${ad.slug}`} className="group rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
                  <div className="w-full h-48 flex items-center justify-center overflow-hidden shrink-0 relative" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {media?.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media.thumbnail_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <span className="text-4xl">🖼️</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-base text-white line-clamp-2 leading-tight mb-2 group-hover:text-purple-300 transition-colors">{ad.title}</h3>
                    {ad.categories?.name && (
                      <span className="text-xs px-2 py-0.5 rounded-full self-start mb-3 font-semibold" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>{ad.categories.name}</span>
                    )}
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{ad.description}</p>
                    <div className="pt-3 border-t flex justify-end" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <span className="text-xs font-bold" style={{ color: '#c084fc' }}>View details →</span>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-extrabold text-white text-center mb-16">How AdFlow Pro Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '✍️', step: '01', title: 'Submit Your Ad', desc: 'Create your listing with details, images, and select your coverage area.' },
            { icon: '✅', step: '02', title: 'Moderation Review', desc: 'Our team reviews your ad for quality and compliance within 24 hours.' },
            { icon: '🚀', step: '03', title: 'Go Live & Reach', desc: 'Choose a package, complete payment, and your ad goes live globally.' },
          ].map(({ icon, step, title, desc }) => (
            <div key={step} className="rounded-2xl p-8 text-center transition-all hover:-translate-y-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-4xl mb-4">{icon}</div>
              <div className="text-xs font-black mb-3 tracking-widest" style={{ color: '#c084fc' }}>STEP {step}</div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

