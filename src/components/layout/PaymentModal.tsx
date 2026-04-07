'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function PaymentModal({ isOpen, onClose, plan, adId }: any) {
    const [ref, setRef] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation: Ad ID lazmi honi chahiye
        if (!adId) {
            return alert("Error: Ad ID is missing. Please try again from the dashboard.")
        }

        if (!ref) return alert("Please enter Transaction ID")

        setLoading(true)

        // Database mein save karne ka logic - Name aur Price add kar diye hain
        const { error } = await supabase
            .from('packages')
            .insert([
                {
                    ad_id: adId,
                    transaction_ref: ref,
                    status: 'pending',
                    name: plan.name, // Plan ka naam (Basic/Standard/Premium)
                    price: parseFloat(plan.amount), // Plan ki qeemat
                    duration_days: parseInt(plan.duration) || 7 // Duration days
                }
            ])

        if (error) {
            alert("Error: " + error.message)
            setLoading(false)
        } else {
            alert(`Payment for ${plan.name} submitted! Admin will verify TXN: ${ref}`)
            setLoading(false)
            onClose()
            window.location.reload()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl"
                style={{ background: 'linear-gradient(145deg, #1e1b4b, #0f172a)' }}>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Confirm Payment</h2>
                    <p className="text-slate-400 text-sm">You are purchasing <span className="text-purple-400 font-bold">{plan.name}</span> for {plan.price}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-purple-400 font-black mb-3">Transfer Funds To:</p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Bank Name:</span>
                            <span className="text-white font-medium">Meezan Bank</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Account No:</span>
                            <span className="text-white font-medium">0123-456789-01</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Account Title:</span>
                            <span className="text-white font-medium">AdFlow Pro Admin</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Transaction ID / Reference</label>
                        <input
                            required
                            type="text"
                            placeholder="Enter TXN ID from receipt"
                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            value={ref}
                            onChange={(e) => setRef(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 shadow-lg"
                        style={{ background: 'linear-gradient(90deg, #7c3aed, #c084fc)' }}
                    >
                        {loading ? 'Processing...' : 'Confirm Purchase'}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-500 text-sm font-medium hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    )
}