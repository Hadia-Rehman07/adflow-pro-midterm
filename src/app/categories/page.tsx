"use client"

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CategoriesPage() {
    const supabase = createClient()
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCategories() {
            const { data, error } = await supabase
                .from('categories')
                .select(`id, name, slug, ads(count)`)

            if (!error && data) {
                setCategories(data)
            }
            setLoading(false)
        }
        fetchCategories()
    }, [])

    const getIcon = (name: string) => {
        const icons: { [key: string]: string } = {
            'Electronics': '💻', 'Vehicles': '🚗', 'Real Estate': '🏠',
            'Services': '🛠️', 'Jobs': '💼', 'Fashion': '👔', 'Home': '🛋️', 'Pets': '🐶'
        }
        return icons[name] || '📦'
    }

    if (loading) return <div className="p-10 text-center text-white text-sm">Loading...</div>

    return (
        <div className="w-full min-h-screen text-white" style={{ background: 'linear-gradient(145deg, rgba(124,58,237,0.3), rgba(192,132,252,0.15))' }}>

            {/* Header Section - Chotta aur Professional */}
            <div className="max-w-6xl mx-auto pt-20 pb-10 px-6 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                    Browse by <span className="text-purple-500">Category</span>
                </h1>
                <p className="text-slate-400 text-sm max-w-lg mx-auto">
                    Find everything you need organized in perfectly curated categories.
                </p>
            </div>

            {/* Grid - Normal Card Sizes */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            // Yahan URL parameter ko ensure kiya hai taake filter sahi chale
                            href={`/explore?category=${cat.slug}`}
                            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all text-center flex flex-col items-center"
                        >
                            {/* Icon size normal */}
                            <div className="text-4xl mb-3 group-hover:scale-105 transition-transform">
                                {getIcon(cat.name)}
                            </div>

                            {/* Text size normal */}
                            <h3 className="text-base font-bold tracking-tight mb-1">
                                {cat.name}
                            </h3>

                            {/* Count text chotta */}
                            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                                {cat.ads?.[0]?.count || 0} Active Ads
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}