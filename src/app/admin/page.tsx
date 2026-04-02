import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
  const { authorized, redirect: redirectPath } = await requireRole(['admin', 'super_admin'])
  
  if (!authorized) {
    redirect(redirectPath!)
  }
  
  return (
    <div className="w-full max-w-7xl flex flex-col mt-12 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-gray-500 font-medium text-sm">Pending Verifications</h3>
          <span className="text-4xl font-bold mt-2">0</span>
          <Link href="/admin/payments" className="text-blue-600 text-sm mt-4 hover:underline">View queue</Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-gray-500 font-medium text-sm">Active Ads</h3>
          <span className="text-4xl font-bold mt-2">0</span>
          <Link href="/explore" className="text-blue-600 text-sm mt-4 hover:underline">View all</Link>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-gray-500 font-medium text-sm">System Health</h3>
          <span className="text-4xl font-bold mt-2 text-green-600">OK</span>
          <Link href="/admin/health" className="text-blue-600 text-sm mt-4 hover:underline">View logs</Link>
        </div>
      </div>

    </div>
  )
}
