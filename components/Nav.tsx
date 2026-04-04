'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()

  return (
    <header className="relative z-10 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-sm sticky top-0">
      <nav className="max-w-3xl mx-auto px-4 h-12 flex items-center gap-1">
        <Link
          href="/"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            pathname === '/'
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          🪐 오늘의 퀴즈
        </Link>
        <Link
          href="/tracker"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            pathname === '/tracker'
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          🛸 ISS 트래커
        </Link>
      </nav>
    </header>
  )
}
