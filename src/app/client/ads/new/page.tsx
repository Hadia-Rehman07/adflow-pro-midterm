import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { submitAdDraft } from './actions'
import { createClient } from '@/utils/supabase/server' // Server client add kiya
import Link from 'next/link'

export default async function NewAdPage(props: { searchParams: Promise<{ error?: string }> }) {
  const params = await props.searchParams;
  const { authorized, redirect: redirectPath } = await requireRole(['client', 'super_admin'])

  if (!authorized) {
    redirect(redirectPath!)
  }

  // DATABASE SE CATEGORIES FETCH KARNA (AUTOMATIC)
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white font-sans flex flex-col items-center py-24 px-6">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="w-full max-w-4xl bg-white/[0.02] border border-white/5 rounded-[48px] p-10 md:p-16 backdrop-blur-xl shadow-2xl">
        <header className="mb-12 border-b border-white/5 pb-10">
          <h1 className="text-5xl font-black text-white mb-3 tracking-tighter uppercase">Create New Ad</h1>
          <p className="text-blue-500 text-[10px] font-bold tracking-[0.4em] uppercase opacity-60">Submissions will be sent for admin approval</p>
        </header>

        {params?.error && (
          <div className="bg-red-500/10 text-red-400 border border-red-500/10 p-5 rounded-2xl mb-10 text-[10px] font-black uppercase tracking-widest animate-pulse">
            ⚠️ {params.error}
          </div>
        )}

        <form className="space-y-8" action={submitAdDraft}>
          {/* Ad Title */}
          <div className="space-y-3">
            <label htmlFor="title" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Campaign Title</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all hover:bg-white/[0.07]"
              placeholder="e.g. Sony PlayStation 5 Slim"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category Dropdown - NOW DYNAMIC */}
            <div className="space-y-3">
              <label htmlFor="category" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Category Selection</label>
              <select
                id="category"
                name="category_id" // ID send hogi database ko
                required
                defaultValue=""
                className="w-full bg-[#111625] border border-white/10 rounded-2xl p-5 text-white outline-none transition-all cursor-pointer hover:border-blue-500/50 appearance-none"
              >
                <option value="" disabled>Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#111625]">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Input */}
            <div className="space-y-3">
              <label htmlFor="price" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Market Value ($)</label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* NEW: Image Upload Section */}
          <div className="space-y-3">
            <label htmlFor="images" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Product Visuals (Image)</label>
            <div className="relative group">
              <input
                id="images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="w-full bg-white/5 border border-white/10 border-dashed rounded-2xl p-8 text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:bg-white/[0.07] transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label htmlFor="description" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Detailed Specifications</label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-slate-700 focus:border-blue-500/50 outline-none resize-none transition-all"
              placeholder="Explain the features and condition..."
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-end gap-6 items-center">
            <Link href="/client" className="text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors">
              Discard Changes
            </Link>
            <button
              type="submit"
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all shadow-xl active:scale-95"
            >
              Submit for Review →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}