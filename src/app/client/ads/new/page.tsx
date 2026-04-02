import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { submitAdDraft } from './actions'

export default async function NewAdPage(props: { searchParams: Promise<{ error?: string }> }) {
  const params = await props.searchParams;
  const { authorized, redirect: redirectPath } = await requireRole(['client', 'super_admin'])
  
  if (!authorized) {
    redirect(redirectPath!)
  }
  
  return (
    <div className="w-full max-w-4xl mt-12 mb-24 flex flex-col items-center px-4">
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm w-full">
        <h1 className="text-3xl font-bold mb-2 w-full text-gray-900">Create New Ad Draft</h1>
        <p className="text-gray-500 mb-8 border-b pb-4">Provide details about your listing. You can submit for review and choose a package later.</p>

        {params?.error && (
          <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-md mb-6 text-sm font-medium">
            {params.error}
          </div>
        )}

        <form className="flex flex-col gap-6" action={submitAdDraft}>
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="font-semibold text-gray-800">Ad Title *</label>
            <input 
              id="title" 
              name="title" 
              type="text" 
              required 
              className="border border-gray-300 rounded-md p-3 text-lg focus:ring-2 focus:ring-blue-600 outline-none" 
              placeholder="e.g. 2021 Toyota Camry Low Mileage"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="font-semibold text-gray-800">Description *</label>
            <textarea 
              id="description" 
              name="description" 
              required 
              rows={6}
              className="border border-gray-300 rounded-md p-3 text-lg focus:ring-2 focus:ring-blue-600 outline-none resize-y" 
              placeholder="Describe your item in detail..."
            ></textarea>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="media_url" className="font-semibold text-gray-800">Media URL (Optional)</label>
            <p className="text-sm text-gray-500 mb-1">We support YouTube links, direct image URLs, or Github raw images.</p>
            <input 
              id="media_url" 
              name="media_url" 
              type="url" 
              className="border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-600 outline-none" 
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="pt-6 border-t border-gray-200 mt-4 flex justify-end gap-4">
            <a href="/client" className="px-6 py-3 rounded-md text-gray-600 hover:bg-gray-100 font-medium transition">
              Cancel
            </a>
            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium shadow-sm transition">
              Save as Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
