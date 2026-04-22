'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function ExploreContent() {
  const [ads, setAds] = useState<any[]>([])
  const [filteredAds, setFilteredAds] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const supabase = createClient()
  const searchParams = useSearchParams()

  const initialCat = searchParams.get('category')
  const initialCity = searchParams.get('city')

  const getBadgeStyle = (pkg: any) => {
    if (!pkg || pkg.status !== 'approved') return null;
    const name = pkg.name ? pkg.name.toLowerCase() : '';
    if (name === 'basic') return { bg: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)', label: 'Basic' };
    if (name === 'standard') return { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', border: '#3b82f6', shadow: '0 0 15px rgba(59, 130, 246, 0.4)', label: '✦ Standard' };
    if (name === 'premium') return { bg: 'linear-gradient(90deg, #d97706, #fbbf24)', text: '#ffffff', border: '#fbbf24', shadow: '0 0 20px rgba(251, 191, 36, 0.5)', animate: 'animate-pulse', label: '👑 Premium' };
    return null;
  };

  const fetchData = async () => {
    try {
      const { data: catData } = await supabase.from('categories').select('id, name, slug')
      if (catData) setCategories(catData)

      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select(`
          *, 
          ad_media(*), 
          cities(id, name, slug), 
          categories(id, name, slug)
        `)
        .eq('status', 'published')
        .order('publish_at', { ascending: false })

      if (adsError) throw adsError;

      const { data: pkgsData } = await supabase.from('packages').select('*').eq('status', 'approved')

      if (adsData) {
        const adsWithPkgs = adsData.map(ad => ({
          ...ad,
          activePackage: pkgsData?.find(p => p.ad_id === ad.id) || null
        }))
        setAds(adsWithPkgs)

        const newCounts: Record<string, number> = {}
        adsWithPkgs.forEach(ad => {
          const catId = ad.categories?.id
          if (catId) newCounts[catId] = (newCounts[catId] || 0) + 1
        })
        setCounts(newCounts)

        // Initial filtering based on URL
        let filtered = adsWithPkgs;
        if (initialCat) {
          filtered = filtered.filter(ad => ad.categories?.id === initialCat || ad.categories?.slug === initialCat)
          const activeCat = catData?.find(c => c.id === initialCat || c.slug === initialCat)
          if (activeCat) setSelectedCatId(activeCat.id)
        }
        if (initialCity) {
          filtered = filtered.filter(ad => ad.cities?.slug === initialCity)
        }
        setFilteredAds(filtered)
      }
    } catch (err) {
      console.error("Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Hook 1: Data fetching (Fixed constant dependency array)
  useEffect(() => {
    fetchData()
  }, [initialCat, initialCity])

  // Hook 2: UI Filtering (Fixed constant dependency array)
  useEffect(() => {
    let result = ads;
    if (selectedCatId) result = result.filter(ad => ad.categories?.id === selectedCatId)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(ad =>
        ad.title.toLowerCase().includes(q) ||
        ad.description?.toLowerCase().includes(q)
      )
    }
    setFilteredAds(result)
  }, [searchQuery, selectedCatId, ads])

  const handleFilter = (catId: string | null) => {
    setSelectedCatId(catId)
  }

  if (loading) return <div className="text-white p-10 font-bold opacity-20">Loading...</div>

  return (
    <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 mt-8 p-6 mb-24 mx-auto">
      <aside className="w-full lg:w-64 shrink-0">
        <div className="rounded-3xl p-6 sticky top-24 shadow-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>

          {/* SEARCH BOX */}
          <div className="mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Search</h2>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
              <input
                type="text"
                placeholder="Keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          {/* CATEGORIES LIST */}
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Category</h2>
          <ul className="space-y-1.5 mb-8">
            <li>
              <button onClick={() => handleFilter(null)} className={`flex items-center justify-between w-full text-sm font-medium rounded-xl px-4 py-2.5 transition-all ${!selectedCatId ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:bg-white/5'}`}>
                <span>All Listings</span>
                <span className="text-[10px] opacity-40 font-bold">{ads.length}</span>
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button onClick={() => handleFilter(cat.id)} className={`flex items-center justify-between w-full text-sm font-medium rounded-xl px-4 py-2.5 transition-all ${selectedCatId === cat.id ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:bg-white/5'}`}>
                  <span className="truncate pr-2">{cat.name}</span>
                  <span className="text-[10px] opacity-40 font-bold">{counts[cat.id] || 0}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* BROWSE BY CITY BUTTON */}
          <div className="pt-6 border-t border-white/5">
            <Link
              href="/cities"
              className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-white/[0.05] to-white/[0.02] hover:from-white/[0.08] hover:to-white/[0.04] border border-white/10 transition-all group"
            >
              <span className="text-xl group-hover:rotate-12 transition-transform">🌍</span>
              <span className="text-xs font-black uppercase tracking-widest text-white">Browse by City</span>
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Listings</span></h1>
            <p className="text-slate-500 text-sm mt-1">{filteredAds.length} results found</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAds.map((ad: any) => {
            const media = ad.ad_media?.[0]
            const badgeStyle = getBadgeStyle(ad.activePackage);

            return (
              <Link key={ad.id} href={`/explore/${ad.slug}`} className="group rounded-[2rem] overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-full h-60 flex items-center justify-center overflow-hidden shrink-0 relative bg-slate-900">
                  {media?.thumbnail_url ? (
                    <img src={media.thumbnail_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  ) : (
                    <div className="opacity-20 text-4xl">🖼️</div>
                  )}

                  {badgeStyle && (
                    <span
                      className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-2xl z-10 ${badgeStyle.animate || ''}`}
                      style={{ background: badgeStyle.bg, color: badgeStyle.text, borderColor: badgeStyle.border }}
                    >
                      {badgeStyle.label}
                    </span>
                  )}

                  {ad.categories?.name && (
                    <span className="absolute bottom-4 left-4 text-[10px] px-3 py-1 rounded-lg font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                      {ad.categories.name}
                    </span>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-white line-clamp-1 mb-2 group-hover:text-purple-400 transition-colors">{ad.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 leading-relaxed">{ad.description}</p>

                  <div className="flex items-center justify-between pt-5 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Location</span>
                      <span className="text-xs text-slate-300 font-semibold">{ad.cities?.name || 'Remote'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-purple-400 text-xs font-bold group-hover:mr-1 transition-all">View Details →</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredAds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-[3rem]">
            <span className="text-6xl mb-6 grayscale opacity-50">🔍</span>
            <p className="text-xl font-bold text-white">No matches found</p>
            <p className="text-slate-500 mt-2">Try adjusting your filters or search keywords.</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCatId(null) }} className="mt-8 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-sm font-bold transition-all">Reset All Filters</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="text-white p-10 min-h-screen bg-[#0a0a0c]">Loading Explore...</div>}>
      <ExploreContent />
    </Suspense>
  )
}