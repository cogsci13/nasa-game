'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()
  const links = [
    { href: '/', label: '🛰️ 미션 허브', active: pathname === '/' },
    { href: '/daily', label: '🪐 오늘의 미션', active: pathname === '/daily' },
    { href: '/play', label: '🚀 빠른 탐사', active: pathname === '/play' },
    { href: '/collection', label: '🏆 컬렉션', active: pathname === '/collection' },
    { href: '/tracker', label: '🛸 트래커', active: pathname === '/tracker' },
  ]

  return (
    <header className="relative z-10 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-sm sticky top-0">
      <nav className="mx-auto flex h-12 max-w-5xl items-center gap-1 overflow-x-auto px-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              link.active
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
