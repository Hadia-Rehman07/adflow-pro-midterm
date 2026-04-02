import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { submitPayment } from './actions'

export default async function PaymentPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const { authorized, redirect: redirectPath } = await requireRole(['client', 'super_admin'])
  
  if (!authorized) redirect(redirectPath!)
  
  const supabase = await createClient()
  const { data: ad, error } = await supabase
    .from('ads')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error || !ad) return <div className="p-12 text-center text-red-500">Ad not found.</div>
  
  if (ad.status !== 'payment_pending') {
    return (
      <div className="p-12 text-center">
        <p className="text-lg">This ad is not pending payment.</p>
        <Link href={`/client/ads/${id}`} className="text-blue-600 hover:underline mt-4 inline-block">Back to Ad</Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mt-12 mb-24 p-6 flex flex-col gap-6 mx-auto">
      <Link href={`/client/ads/${id}`} className="text-blue-600 hover:underline mb-2">&larr; Back to Ad Detail</Link>
      
      <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-sm w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Payment Proof</h1>
        <p className="text-gray-500 border-b pb-6 mb-6">
          Your ad <strong>"{ad.title}"</strong> has been approved by our moderation team. 
          Please submit payment verification details to have it published.
        </p>

        <form action={submitPayment} className="flex flex-col gap-5">
          <input type="hidden" name="ad_id" value={ad.id} />
          
          <div className="flex flex-col gap-2">
            <label htmlFor="amount" className="font-semibold text-gray-800">Payment Amount ($)</label>
            <input 
              id="amount" 
              name="amount" 
              type="number" 
              step="0.01" 
              min="0"
              required 
              className="border border-gray-300 rounded p-3 focus:ring-2 focus:ring-green-600 outline-none w-1/2"
              placeholder="0.00"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="method" className="font-semibold text-gray-800">Payment Method</label>
            <select 
              id="method" 
              name="method" 
              required 
              className="border border-gray-300 rounded p-3 focus:ring-2 focus:ring-green-600 outline-none bg-white w-1/2"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="transaction_ref" className="font-semibold text-gray-800">Transaction Reference ID</label>
            <input 
              id="transaction_ref" 
              name="transaction_ref" 
              type="text" 
              required 
              className="border border-gray-300 rounded p-3 focus:ring-2 focus:ring-green-600 outline-none"
              placeholder="e.g. TXN-99XYZ945"
            />
          </div>

          <button 
            type="submit" 
            className="mt-4 bg-green-600 text-white font-medium p-3 rounded hover:bg-green-700 shadow-sm transition w-full md:w-auto self-start px-8"
          >
            Submit Payment Verification
          </button>
        </form>
      </div>
    </div>
  )
}
