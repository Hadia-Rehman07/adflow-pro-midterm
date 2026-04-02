import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 py-8 px-6 flex justify-center text-center text-xs mt-auto" style={{ background: 'rgba(10, 10, 26, 0.6)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500">
        <p className="font-medium">
          &copy; {new Date().getFullYear()} <span style={{ color: '#c084fc' }}>AdFlow Pro</span>. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
          <Link href="/faq" className="hover:text-slate-300 transition-colors">FAQ</Link>
        </div>
      </div>
    </footer>
  )
}

