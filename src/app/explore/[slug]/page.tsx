"use client"

import { createClient } from '@/utils/supabase/client'
import { notFound } from 'next/navigation'
import { useEffect, useState, use } from 'react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function AdDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const supabase = createClient();

  const [ad, setAd] = useState<any>(null);
  const [sellerDisplayName, setSellerDisplayName] = useState("AdFlow User");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [address, setAddress] = useState("Flat 3B, Clifton Block 5, Karachi");
  const [phone, setPhone] = useState("0300-9999999");

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('ads')
        .select('*, ad_media(*), packages(name), categories(name)')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        setAd(data);
        const { data: seller } = await supabase
          .from('seller_profiles')
          .select('display_name')
          .eq('user_id', data.user_id)
          .maybeSingle();
        if (seller?.display_name) setSellerDisplayName(seller.display_name);
      }
    }
    fetchData();
  }, [slug]);

  if (!ad) return <div className="p-24 text-center text-white">Loading...</div>;

  const handleSendMessage = async () => {
    if (!msg) return;
    const { error } = await supabase.from('notifications').insert([
      {
        user_id: ad.user_id,
        title: 'New Inquiry',
        message: `Message for ${ad.title}: ${msg}`,
        type: 'message'
      }
    ]);
    if (!error) {
      alert("Message Sent to Seller!");
      setMsg("");
      setIsChatOpen(false);
    }
  };

  const handleConfirmPurchase = async () => {
    const totalAmount = ad.price + (ad.price * 0.02);
    const randomRef = `TXN-${Math.floor(Math.random() * 1000000)}`;

    const { error: payError } = await supabase.from('payments').insert([
      {
        ad_id: ad.id,
        amount: totalAmount,
        status: 'verified',
        method: 'Card',
        transaction_ref: randomRef
      }
    ]);

    if (payError) {
      alert("Payment Error: " + payError.message);
      return;
    }

    const { error: notifyError } = await supabase.from('notifications').insert([
      {
        user_id: ad.user_id,
        title: 'Item Sold!',
        message: `Sold! ${ad.title} purchased for $${totalAmount}. Address: ${address}, Phone: ${phone}`,
        type: 'sale'
      }
    ]);

    if (!notifyError) {
      alert("Purchase Successful! Record stored in Supabase.");
      setIsPurchaseOpen(false);
    }
  };

  const publishDate = ad.created_at
    ? new Date(ad.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Recently Published';

  return (
    <div
      className="w-full min-h-screen font-sans text-white"
      style={{ background: 'linear-gradient(145deg, rgba(124,58,237,0.2), rgba(192,132,252,0.15))' }}
    >

      {/* --- CONTACT MODAL --- */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0c0f1d] border border-white/10 rounded-[28px] w-full max-w-[440px] shadow-2xl flex flex-col h-[520px]">
            <div className="p-6 border-b border-white/5 flex justify-between">
              <div><h3 className="text-sm font-black uppercase">Contact Seller</h3><p className="text-[10px] text-slate-500">Responds in 1 hour</p></div>
              <button onClick={() => setIsChatOpen(false)}>✕</button>
            </div>
            <div className="flex-1 p-10 flex flex-col items-center justify-center text-center">
              <p className="text-slate-400 font-medium mb-4">Chatting with <span className="text-white font-bold">{sellerDisplayName}</span></p>
            </div>
            <div className="p-4 border-t border-white/5 bg-[#0a0d18]">
              <div className="relative">
                <input value={msg} onChange={(e) => setMsg(e.target.value)} type="text" placeholder="Type message..." className="w-full py-4 pl-6 pr-16 bg-[#060810] border border-white/5 rounded-full outline-none" />
                <button onClick={handleSendMessage} className="absolute right-2 top-2 w-10 h-10 bg-purple-600 rounded-full">➤</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PURCHASE MODAL --- */}
      {isPurchaseOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#0d101a] border border-white/10 rounded-[32px] w-full max-w-[500px] shadow-2xl p-8">
            <h3 className="text-2xl font-black uppercase mb-2">Complete Purchase</h3>
            <div className="space-y-4 my-6">
              <div className="flex justify-between text-slate-400"><span>Item Price</span><span className="text-white font-bold">${ad.price}</span></div>
              <div className="flex justify-between text-slate-400"><span>Service Fee (2%)</span><span className="text-purple-400 font-bold">${(ad.price * 0.02).toFixed(2)}</span></div>
              <div className="flex justify-between pt-4 border-t border-white/5"><span className="text-lg font-black">Total to Pay</span><span className="text-3xl font-black">${(ad.price + (ad.price * 0.02)).toLocaleString()}</span></div>
            </div>
            <div className="space-y-4 mb-6">
              <div><label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">DELIVERY ADDRESS</label><input value={address} onChange={(e) => setAddress(e.target.value)} type="text" className="w-full py-3 pl-4 bg-[#111421] border border-white/5 rounded-lg text-sm text-slate-200" /></div>
              <div><label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">PHONE NUMBER</label><input value={phone} onChange={(e) => setPhone(e.target.value)} type="text" className="w-full py-3 pl-4 bg-[#111421] border border-white/5 rounded-lg text-sm text-slate-200" /></div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsPurchaseOpen(false)} className="flex-1 py-4 bg-white/5 rounded-xl font-bold">Cancel</button>
              <button onClick={handleConfirmPurchase} className="flex-1 py-4 bg-[#818cf8] hover:bg-[#a5b4fc] rounded-xl font-black">Confirm Purchase</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PAGE CONTENT --- */}
      <div className="w-full pt-20 pb-10 px-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">{ad.title}</h1>
          <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Published on: {publishDate}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-8">
          <div className="rounded-3xl overflow-hidden aspect-video bg-purple-500/5 border border-purple-500/20 flex items-center justify-center relative backdrop-blur-sm">
            {ad.ad_media && ad.ad_media.length > 0 ? (
              <img src={ad.ad_media[0].original_url} className="w-full h-full object-cover" alt={ad.title} />
            ) : (
              <div className="text-center">
                <span className="text-8xl block mb-4">🖼️</span>
                <p className="text-slate-500 text-sm">No Image Available</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl p-10 bg-white/5 border border-white/10 backdrop-blur-md">
            <h3 className="text-[10px] font-black uppercase text-purple-400 mb-6">Description</h3>
            <p className="text-slate-200 text-lg leading-relaxed">{ad.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoTile label="Category" value={ad.categories?.name} emoji="📦" />
            <InfoTile label="Media Files" value={`${ad.ad_media?.length || 0} Images`} emoji="🖼️" />
            <InfoTile label="Verified Seller" value={sellerDisplayName} emoji="👤" />
          </div>
        </div>

        <aside className="w-full lg:w-[400px]">
          <div className="rounded-[40px] p-10 sticky top-24 bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <p className="text-[10px] text-purple-400 font-black uppercase mb-3 tracking-widest">Asking Price</p>
            <h2 className="text-5xl font-black mb-10">${ad.price?.toLocaleString()}</h2>
            <div className="space-y-4">
              <button onClick={() => setIsPurchaseOpen(true)} className="w-full py-5 bg-purple-600 hover:bg-purple-500 rounded-2xl font-black text-xs uppercase shadow-xl transition-all">🛍️ Instant Purchase</button>
              <button onClick={() => setIsChatOpen(true)} className="w-full py-5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold text-xs uppercase transition-all">📞 Contact Seller</button>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-4">Quick Specs</p>
              <div className="flex justify-between text-xs py-2 border-b border-white/5"><span className="text-slate-400">Ad Status</span><span>{ad.status || 'Active'}</span></div>
              <div className="flex justify-between text-xs py-2 border-b border-white/5"><span className="text-slate-400">Package</span><span>{ad.packages?.name || 'Standard'}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function InfoTile({ label, value, emoji }: any) {
  return (
    <div className="p-6 rounded-2xl flex items-center gap-4 bg-white/5 border border-white/10 hover:border-white/20 transition-all">
      <div className="text-xl opacity-60">{emoji}</div>
      <div>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{label}</p>
        <p className="text-sm font-black truncate">{value || 'N/A'}</p>
      </div>
    </div>
  )
}