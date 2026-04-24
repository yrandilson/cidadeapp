import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="max-w-sm w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="text-5xl mb-3">🚗</div>
          <h1 className="text-3xl font-bold text-gray-900">CidadeApp</h1>
          <p className="text-gray-500 mt-2">Transporte + Entregas da sua cidade</p>
        </div>

        {/* Cards de serviço */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">🏍️</div>
            <div className="font-semibold text-sm text-gray-800">Transporte</div>
            <div className="text-xs text-gray-500 mt-1">Mototáxi e carro</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">🍔</div>
            <div className="font-semibold text-sm text-gray-800">Delivery</div>
            <div className="text-xs text-gray-500 mt-1">Restaurantes locais</div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Entrar na conta
          </Link>
          <Link
            href="/register"
            className="w-full bg-white text-gray-800 py-3 rounded-xl font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Criar conta grátis
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Plataforma local para sua cidade
        </p>
      </div>
    </main>
  )
}
