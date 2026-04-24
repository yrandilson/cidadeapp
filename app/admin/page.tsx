'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Ride, Order } from '@/types/database'

export default function AdminDashboard() {
  const [rides, setRides] = useState<Ride[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: r } = await supabase
      .from('rides').select('*').order('created_at', { ascending: false }).limit(50)
    const { data: o } = await supabase
      .from('orders').select('*, restaurant:restaurants(name)').order('created_at', { ascending: false }).limit(50)
    setRides(r || [])
    setOrders(o || [])
    setLoading(false)
  }

  const totalRideRevenue = rides
    .filter(r => r.status === 'finished')
    .reduce((acc, r) => acc + r.platform_fee, 0)

  const totalOrderRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((acc, o) => acc + o.platform_fee, 0)

  const statusBadge: Record<string, string> = {
    pending:     'status-pending',
    accepted:    'status-accepted',
    in_progress: 'status-progress',
    finished:    'status-finished',
    cancelled:   'status-cancelled',
    confirmed:   'status-accepted',
    preparing:   'status-preparing',
    collected:   'status-progress',
    delivering:  'status-delivering',
    delivered:   'status-delivered',
  }

  const statusLabel: Record<string, string> = {
    pending: 'Pendente', accepted: 'Aceita', in_progress: 'Em curso',
    finished: 'Finalizada', cancelled: 'Cancelada', confirmed: 'Confirmado',
    preparing: 'Preparando', collected: 'Coletado',
    delivering: 'A caminho', delivered: 'Entregue',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Carregando painel...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">⚙️ Admin</h1>
            <p className="text-gray-500 text-sm">Painel de controle</p>
          </div>
          <button
            onClick={() => { supabase.auth.signOut(); window.location.href = '/' }}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Sair
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">{rides.length}</div>
            <div className="text-xs text-gray-500 mt-1">Total corridas</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-orange-600">{orders.length}</div>
            <div className="text-xs text-gray-500 mt-1">Total pedidos</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">
              R$ {totalRideRevenue.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Taxa corridas</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">
              R$ {totalOrderRevenue.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Taxa delivery</div>
          </div>
        </div>

        {/* Corridas */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Corridas recentes ({rides.length})
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {rides.length === 0 ? (
              <p className="text-center text-gray-400 text-sm p-6">Nenhuma corrida</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Origem → Destino</th>
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Veículo</th>
                    <th className="text-right p-3 text-xs text-gray-500 font-medium">Valor</th>
                    <th className="text-right p-3 text-xs text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((ride, i) => (
                    <tr key={ride.id} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
                      <td className="p-3 text-gray-700">
                        <span className="font-medium">{ride.origin}</span>
                        <span className="text-gray-400"> → </span>
                        {ride.destination}
                      </td>
                      <td className="p-3 text-gray-500 text-xs">
                        {ride.vehicle_type === 'moto' ? '🏍️' : '🚗'}
                      </td>
                      <td className="p-3 text-right font-medium">
                        R$ {ride.price.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <span className={statusBadge[ride.status]}>
                          {statusLabel[ride.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pedidos */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Pedidos recentes ({orders.length})
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {orders.length === 0 ? (
              <p className="text-center text-gray-400 text-sm p-6">Nenhum pedido</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Restaurante</th>
                    <th className="text-left p-3 text-xs text-gray-500 font-medium">Endereço</th>
                    <th className="text-right p-3 text-xs text-gray-500 font-medium">Total</th>
                    <th className="text-right p-3 text-xs text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={order.id} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
                      <td className="p-3 text-gray-700 font-medium">
                        {(order as any).restaurant?.name || '—'}
                      </td>
                      <td className="p-3 text-gray-500 text-xs truncate max-w-[120px]">
                        {order.address}
                      </td>
                      <td className="p-3 text-right font-medium">
                        R$ {order.total.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <span className={statusBadge[order.status]}>
                          {statusLabel[order.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
