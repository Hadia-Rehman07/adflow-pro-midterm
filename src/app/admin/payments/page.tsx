import { requireRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { verifyPayment } from './actions'

export default async function AdminPaymentsQueue() {
  const { authorized, redirect: redirectPath } = await requireRole(['admin', 'super_admin'])

  if (!authorized) redirect(redirectPath!)

  const supabase = await createClient()

  // FIX: Table name 'payments' se badal kar 'packages' kar diya
  const { data: payments } = await supabase
    .from('packages')
    .select('*, ads(id, title)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div className="w-full max-w-7xl flex flex-col mt-12 mb-24 p-6 mx-auto">
      {/* Text color white kar diya */}
      <h1 className="text-3xl font-bold mb-6 w-full text-white border-b border-white/10 pb-4">
        Payment Verifications
      </h1>

      <div className="w-full grid grid-cols-1 gap-6">
        {!payments || payments.length === 0 ? (
          /* Box ko transparent/dark kar diya */
          <div className="border border-white/10 rounded-3xl p-20 mt-6 bg-white/[0.03] backdrop-blur-md text-center shadow-2xl text-slate-400">
            <h3 className="font-bold text-2xl text-white mb-2">Queue is Empty</h3>
            <p className="opacity-60 text-sm tracking-wide">No payments pending verification at the moment.</p>
          </div>
        ) : (
          /* Table container ko bhi transparent styling di hai */
          <div className="overflow-x-auto bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl p-6">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-bold text-white uppercase tracking-widest text-[10px]">Ad Title</th>
                  <th className="p-4 font-bold text-white uppercase tracking-widest text-[10px]">Package / Price</th>
                  <th className="p-4 font-bold text-white uppercase tracking-widest text-[10px]">Reference ID</th>
                  <th className="p-4 font-bold text-white uppercase tracking-widest text-[10px]">Submitted At</th>
                  <th className="p-4 font-bold text-white uppercase tracking-widest text-[10px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="p-4 font-medium text-white">{payment.ads?.title || 'Unknown Ad'}</td>
                    <td className="p-4">
                      <span className="text-purple-400 font-bold">{payment.name}</span> <br />
                      <span className="text-emerald-400 font-mono text-xs">${payment.price}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 group-hover:border-purple-500/50 transition-all">
                        {payment.transaction_ref}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(payment.created_at).toLocaleDateString()} <br />
                      {new Date(payment.created_at).toLocaleTimeString()}
                    </td>
                    <td className="p-4 text-right">
                      <form action={verifyPayment}>
                        <input type="hidden" name="payment_id" value={payment.id} />
                        <input type="hidden" name="ad_id" value={payment.ads?.id} />
                        <button
                          name="action"
                          value="verify"
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold px-6 py-2.5 rounded-xl hover:from-emerald-500 hover:to-teal-500 text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
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