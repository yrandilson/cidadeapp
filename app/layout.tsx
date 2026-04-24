import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CidadeApp — Transporte & Entregas',
  description: 'Plataforma local de transporte e delivery',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
