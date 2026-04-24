'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import type { Profile, Restaurant, Order } from '@/types/database'

export default function DeliveryPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { data: prof } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    setProfile(prof)

    const { data: rests } = await supabase
      .from('restaurants').select('*').order('name')
    setRestaurants(rests || [])

    const { data: orders } = await supabase
      .from('orders').select('*, restaurant:restaurants(name)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    setMyOrders(orders || [])

    setLoading(false)
  }

  const statusLabel: Record<string, string> = {
    pending:    '⏳ Aguardando',
    confirmed:  '✅ Confirmado',
    preparing:  '👨‍🍳 Preparando',
    collected:  '🏍️ Coletado',
    delivering: '🛵 A caminho',
    delivered:  '✅ Entregue',
    cancelled:  '❌ Cancelado',
  }

  const statusClass: Record<string, string> = {
    pending:    'status-pending',
    confirmed:  'status-accepted',
    preparing:  'status-preparing',
    collected:  'status-progress',
    delivering: 'status-delivering',
    delivered:  'status-delivered',
    cancelled:  'status-cancelled',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <>
      <Navbar role={profile?.role || 'passenger'} userName={profile?.name || ''} />
      <main className="max-w-lg mx-auto p-4">

        <div className="mb-5 pt-2">
          <h1 className="text-xl font-bold text-gray-900">🍔 Delivery</h1>
          <p className="text-gray-500 text-sm">Restaurantes da sua cidade</p>
        </div>

        {/* Pedido ativo */}
        {myOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).map(order => (
          <div key={order.id} className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm text-gray-800">
                  {(order as any).restaurant?.name || 'Restaurante'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'itens'} •
                  R$ {order.total.toFixed(2)}
                </p>
              </div>
              <span className={statusClass[order.status]}>{statusLabel[order.status]}</span>
            </div>
          </div>
        ))}

        {/* Restaurantes */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Restaurantes abertos</h2>
        {restaurants.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400 text-sm">
            Nenhum restaurante cadastrado ainda
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {restaurants.filter(r => r.is_open).map(rest => (
              <Link
                key={rest.id}
                href={`/delivery/novo-pedido?restaurant=${rest.id}`}
                className="block bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{rest.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{rest.category}</p>
                    <p className="text-xs text-gray-400">{rest.address}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      Aberto
                    </span>
                    <p className="text-xs text-gray-400 mt-1">Taxa R$ 2,00</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Histórico de pedidos */}
        {myOrders.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Últimos pedidos</h2>
            <div className="space-y-2">
              {myOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl p-3 border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {(order as any).restaurant?.name}
                    </p>
                    <p className="text-xs text-gray-400">R$ {order.total.toFixed(2)}</p>
                  </div>
                  <span className={statusClass[order.status]}>{statusLabel[order.status]}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  )
}
