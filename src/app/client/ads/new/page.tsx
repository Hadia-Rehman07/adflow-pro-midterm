import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { submitAdDraft } from './actions'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function NewAdPage(props: { searchParams: Promise<{ error?: string }> }) {
  const params = await props.searchParams;
  const { authorized, redirect: redirectPath } = await requireRole(['client', 'super_admin'])

  if (!authorized) {
    redirect(redirectPath!)
  }

  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="text-white px-4 py-10">

      {/* HEADER */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          <span className="text-white">Create </span>
          <span className="text-purple-500">New Ad</span>
        </h1>
        <p className="text-purple-500 text-sm opacity-90">
          Submit your product for review and approval
        </p>
      </div>

      {/* ERROR */}
      {params?.error && (
        <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-4 rounded-xl mb-6 text-sm">
          ⚠️ {params.error}
        </div>
      )}

      {/* FORM CARD */}
      <form
        action={submitAdDraft}
        className="max-w-5xl mx-auto bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-10 space-y-8 shadow-2xl"
      >

        <div className="grid md:grid-cols-2 gap-6">

          {/* TITLE */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs text-slate-400">Campaign Title</label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Sony PlayStation 5 Slim"
              className="w-full p-4 rounded-xl bg-[#0c0f1d] border border-white/10 focus:border-purple-500 outline-none"
            />
          </div>

          {/* CATEGORY */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Category</label>
            <select
              name="category_id"
              required
              defaultValue=""
              className="w-full p-4 rounded-xl bg-[#0c0f1d] border border-white/10 focus:border-purple-500 outline-none"
            >
              <option value="" disabled>Select Category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* PRICE */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Price ($)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              className="w-full p-4 rounded-xl bg-[#0c0f1d] border border-white/10 focus:border-purple-500 outline-none"
            />
          </div>
        </div>

        {/* IMAGE URL */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Image URL</label>
          <input
            name="image_url"
            type="text"
            required
            placeholder="https://example.com/image.jpg"
            className="w-full p-4 rounded-xl bg-[#0c0f1d] border border-white/10 focus:border-purple-500 outline-none"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Description</label>
          <textarea
            name="description"
            rows={4}
            required
            placeholder="Write product details..."
            className="w-full p-4 rounded-xl bg-[#0c0f1d] border border-white/10 focus:border-purple-500 outline-none resize-none"
          ></textarea>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">

          <Link
            href="/client"
            className="text-slate-400 hover:text-white text-sm"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:scale-105 transition-all px-8 py-3 rounded-xl font-semibold shadow-lg"
          >
            Submit Ad 🚀
          </button>

        </div>
      </form>
    </div>
  )
}