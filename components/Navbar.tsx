'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface NavbarProps {
  role: 'passenger' | 'driver' | 'motoboy'
  userName: string
}

export default function Navbar({ role, userName }: NavbarProps) {
  const pathname = usePathname()

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const passengerLinks = [
    { href: '/passenger',            label: '🏠 Início' },
    { href: '/passenger/nova-corrida', label: '🚗 Corrida' },
    { href: '/delivery',             label: '🍔 Delivery' },
  ]

  const driverLinks = [
    { href: '/driver',   label: '🏠 Painel' },
    { href: '/delivery', label: '🍔 Entregas' },
  ]

  const links = role === 'passenger' ? passengerLinks : driverLinks

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-gray-900 text-sm">🚗 CidadeApp</Link>

        <div className="flex gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:block">{userName}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}
