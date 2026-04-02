import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { verifyPayment } from './actions'

export default async function AdminPaymentsQueue() {
  const { authorized, redirect: redirectPath } = await requireRole(['admin', 'super_admin'])
  
  if (!authorized) redirect(redirectPath!)
  
  const supabase = await createClient()
  const { data: payments } = await supabase
    .from('payments')
    .select('*, ads(id, title)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div className="w-full max-w-7xl flex flex-col mt-12 mb-24 p-6">
      <h1 className="text-3xl font-bold mb-6 w-full text-gray-900 border-b pb-4">Payment Verifications</h1>
      
      <div className="w-full grid grid-cols-1 gap-6">
        {!payments || payments.length === 0 ? (
          <div className="border border-gray-200 rounded-md p-10 mt-6 bg-white text-center shadow-sm text-gray-500">
            <h3 className="font-bold text-xl text-gray-700 mb-2">Queue is Empty</h3>
            <p>No payments pending verification.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-md shadow-sm p-6">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-900">Ad Title</th>
                  <th className="p-4 font-semibold text-gray-900">Amount</th>
                  <th className="p-4 font-semibold text-gray-900">Method / Ref</th>
                  <th className="p-4 font-semibold text-gray-900">Submitted At</th>
                  <th className="p-4 font-semibold text-gray-900 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-900">{payment.ads?.title}</td>
                    <td className="p-4 text-green-700 font-bold">${payment.amount}</td>
                    <td className="p-4">
                      {payment.method} <br/>
                      <span className="text-xs text-mono bg-gray-100 p-1 rounded font-mono">{payment.transaction_ref}</span>
                    </td>
                    <td className="p-4">{new Date(payment.created_at).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <form action={verifyPayment}>
                        <input type="hidden" name="payment_id" value={payment.id} />
                        <input type="hidden" name="ad_id" value={payment.ads?.id} />
                        <button 
                          name="action"
                          value="verify"
                          className="bg-green-600 text-white font-medium p-2 rounded hover:bg-green-700 text-xs shadow-sm"
                        >
                          Verify & Publish
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
