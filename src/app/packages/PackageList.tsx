'use client'
import { useState } from 'react'
import PaymentModal from '@/components/layout/PaymentModal'

export default function PackageList({ plans, adId }: any) {
    const [selectedPlan, setSelectedPlan] = useState<any>(null)

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {plans.map((plan: any) => (
                    <div key={plan.id} className={`rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 ${plan.highlight ? 'scale-105 z-10' : ''}`}
                        style={plan.highlight ? { background: 'linear-gradient(145deg, rgba(124,58,237,0.3), rgba(192,132,252,0.15))', border: '1px solid rgba(192,132,252,0.4)', backdropFilter: 'blur(24px)' }
                            : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)' }}>

                        {plan.highlight && <div className="text-center text-xs font-black uppercase tracking-widest py-2" style={{ background: 'linear-gradient(90deg, #7c3aed, #c084fc)', color: 'white' }}>✦ Most Popular</div>}

                        <div className="p-8 flex flex-col flex-1">
                            <h2 className="text-xl font-extrabold text-white mb-1 uppercase tracking-wide">{plan.name}</h2>
                            <p className="text-xs text-slate-500 mb-6">{plan.duration}</p>
                            <div className="mb-8"><span className="text-6xl font-extrabold text-white">{plan.price}</span></div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((f: string) => (
                                    <li key={f} className="flex items-center gap-3 text-sm text-slate-300"><span className="text-purple-400 font-black">✓</span>{f}</li>
                                ))}
                            </ul>

                            <button
                                onClick={() => setSelectedPlan(plan)}
                                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                                style={plan.highlight ? { background: 'linear-gradient(90deg, #7c3aed, #c084fc)', color: 'white' } : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
                            >
                                Purchase {plan.name}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <PaymentModal
                isOpen={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
                plan={selectedPlan}
                adId={adId}
            />
        </>
    )
}