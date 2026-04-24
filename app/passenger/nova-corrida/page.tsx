'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const PRICES = { moto: 7, carro: 15 }
const FEE_RATE = 0.10

export default function NovaCorrida() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [vehicleType, setVehicleType] = useState<'moto' | 'carro'>('moto')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const price = PRICES[vehicleType]
  const fee = price * FEE_RATE

  async function handleCreate() {
    if (!origin || !destination) {
      setError('Preencha origem e destino.')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { error: err } = await supabase.from('rides').insert({
      passenger_id: user.id,
      driver_id: null,
      origin,
      destination,
      vehicle_type: vehicleType,
      price,
      platform_fee: fee,
      status: 'pending',
    })

    if (err) {
      setError('Erro ao criar corrida. Tente novamente.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => { window.location.href = '/passenger' }, 2000)
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900">Corrida solicitada!</h2>
          <p className="text-gray-500 text-sm mt-2">Aguardando um motorista aceitar...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-3 mb-6 pt-2">
          <Link href="/passenger" className="text-gray-500 hover:text-gray-700">← Voltar</Link>
          <h1 className="text-lg font-bold text-gray-900">Nova corrida</h1>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

          {/* Tipo de veículo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de veículo</label>
            <div className="grid grid-cols-2 gap-3">
              {(['moto', 'carro'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setVehicleType(v)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    vehicleType === v
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{v === 'moto' ? '🏍️' : '🚗'}</div>
                  <div className="text-sm font-medium capitalize">{v === 'moto' ? 'Mototáxi' : 'Carro'}</div>
                  <div className="text-xs text-gray-500 mt-0.5">R$ {PRICES[v]},00</div>
                </button>
              ))}
            </div>
          </div>

          {/* Origem */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📍 Origem
            </label>
            <input
              type="text"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              placeholder="Ex: Praça Central"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Destino */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🏁 Destino
            </label>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Ex: Av. Brasil, 500"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Resumo de preço */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Valor da corrida</span>
              <span className="font-medium">R$ {price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Taxa da plataforma (10%)</span>
              <span className="text-gray-400">R$ {fee.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Solicitando...' : '🚗 Solicitar corrida'}
          </button>
        </div>
      </div>
    </main>
  )
}
