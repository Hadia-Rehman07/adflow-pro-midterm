import { selectPackageAction } from './actions'

export default async function PackagesPage(props: { searchParams?: Promise<{ ad_id?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const adId = searchParams?.ad_id;

  const plans = [
    {
      id: 'pkg-basic',
      name: 'Basic',
      price: '$10',
      priceRaw: '10.00',
      duration: '7 Days Duration',
      features: ['7 Days Duration', 'Standard Visibility', 'Category Listing', 'Basic Search Placement'],
      highlight: false,
      amount: '10.00',
    },
    {
      id: 'pkg-standard',
      name: 'Standard',
      price: '$25',
      priceRaw: '25.00',
      duration: '15 Days Duration',
      features: ['15 Days Duration', '2x Priority Weight', 'Category Priority', 'Manual Refresh', 'Verified Badge'],
      highlight: true,
      amount: '25.00',
    },
    {
      id: 'pkg-premium',
      name: 'Premium',
      price: '$49',
      priceRaw: '49.00',
      duration: '30 Days Duration',
      features: ['30 Days Duration', '3x Priority Weight', 'Homepage Featured', 'Auto-Refresh Every 3 Days', 'Verified Badge', 'Priority Support'],
      highlight: false,
      amount: '49.00',
    },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col px-6 py-20 mb-24">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-96 rounded-full blur-[100px] opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(192, 132, 252, 0.1)', border: '1px solid rgba(192, 132, 252, 0.25)', color: '#c084fc' }}>
          ✦ Flexible Pricing
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-white mb-4">
          Choose Your Perfect Plan
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed">
          Rank higher and gain better visibility. Dynamic scheduling and exposure packages for every business tier.
        </p>
        {!adId && (
          <div className="mt-6 inline-block text-sm px-4 py-2 rounded-lg" style={{ background: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.2)', color: '#fb923c' }}>
            ⚠️ Visit this page from an Ad to link the package to your listing.
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 ${plan.highlight ? 'scale-105 z-10' : ''}`}
            style={plan.highlight ? {
              background: 'linear-gradient(145deg, rgba(124,58,237,0.3), rgba(192,132,252,0.15))',
              border: '1px solid rgba(192,132,252,0.4)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 0 40px rgba(192,132,252,0.15), 0 20px 40px rgba(0,0,0,0.4)',
            } : {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {plan.highlight && (
              <div className="text-center text-xs font-black uppercase tracking-widest py-2" style={{ background: 'linear-gradient(90deg, #7c3aed, #c084fc)', color: 'white' }}>
                ✦ Most Popular
              </div>
            )}
            <div className="p-8 flex flex-col flex-1">
              <h2 className="text-xl font-extrabold text-white uppercase tracking-wide mb-1">{plan.name}</h2>
              <p className="text-xs text-slate-500 mb-6">{plan.duration}</p>

              <div className="mb-8">
                <span className="text-6xl font-extrabold text-white">{plan.price}</span>
                <span className="text-slate-500 ml-1 text-sm">/ listing</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="text-base font-black" style={{ color: '#c084fc' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <form action={selectPackageAction}>
                <input type="hidden" name="ad_id" value={adId || ''} />
                <input type="hidden" name="package_id" value={plan.id} />
                <input type="hidden" name="package_name" value={plan.name} />
                <input type="hidden" name="amount" value={plan.amount} />

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                  style={plan.highlight ? {
                    background: 'linear-gradient(90deg, #7c3aed, #c084fc)',
                    color: 'white',
                    cursor: 'pointer'
                  } : {
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Purchase {plan.name}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}