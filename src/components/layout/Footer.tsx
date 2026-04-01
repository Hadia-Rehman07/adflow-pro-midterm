import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs bg-gray-50 mt-auto">
      <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
        <p>
          &copy; {new Date().getFullYear()} AdFlow Pro. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/faq" className="hover:underline">FAQ</Link>
        </div>
      </div>
    </footer>
  )
}
