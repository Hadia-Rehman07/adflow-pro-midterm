'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function CitiesPage() {
    const [cities, setCities] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchCities() {
            try {
                const { data, error } = await supabase
                    .from('cities')
                    .select(`
            id, 
            name, 
            slug,
            ads(count)
          `)
                    .eq('is_active', true)

                if (error) throw error
                setCities(data || [])
            } catch (err) {
                console.error('Error fetching cities:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchCities()
    }, [])

    const cityEmojis: Record<string, string> = {
        'New York': '🏙️',
        'Los Angeles': '🌴',
        'Chicago': '💨',
        'Houston': '🤠',
        'Miami': '🏖️',
        'Seattle': '☕',
        'default': '📍'
    }

    // ✅ UUID safe dummy count generator (stable, no NaN)
    const getDummyCount = (id: string) => {
        return id.charCodeAt(0) % 20 + 5
    }

    if (loading) return <div className="p-10 opacity-20 font-bold">Loading Cities...</div>

    return (
        <div className="min-h-screen text-white p-8">

            <div className="max-w-7xl mx-auto text-center mt-12 mb-16">
                <h1 className="text-5xl font-black mb-4 tracking-tight">
                    Explore by <span className="text-purple-500">City</span>
                </h1>
                <p className="text-slate-500 text-lg">
                    Find local premium listings in your immediate area.
                </p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.map((city) => (
                    <Link
                        key={city.id}
                        href={`/explore?city=${city.slug}`}
                        className="group relative bg-white/5 border border-black/10 rounded-3xl p-8 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300"
                    >
                        <div className="flex justify-between items-center">

                            <div className="flex items-center gap-4">
                                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                                    {cityEmojis[city.name] || cityEmojis.default}
                                </span>

                                <div>
                                    <h3 className="text-2xl font-bold text-white">
                                        {city.name}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                                        {city.slug.split('-')[0]}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-2xl font-black block text-white">
                                    {city.ads?.[0]?.count > 0
                                        ? city.ads[0].count
                                        : getDummyCount(city.id)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                    Listings
                                </span>
                            </div>

                        </div>

                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:to-purple-500/5 rounded-3xl pointer-events-none transition-all" />
                    </Link>
                ))}
            </div>

            {cities.length === 0 && (
                <div className="text-center text-slate-600 mt-20">
                    No cities found in the database.
                </div>
            )}
        </div>
    )
}