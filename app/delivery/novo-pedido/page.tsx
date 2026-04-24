'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Restaurant, MenuItem, OrderItem } from '@/types/database'

const DELIVERY_FEE = 2
const PLATFORM_FEE = 2

export default function NovoPedido() {
  const searchParams = useSearchParams()
  const restaurantId = searchParams.get('restaurant')

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<Record<string, number>>({})
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!restaurantId) { window.location.href = '/delivery'; return }
    loadRestaurant()
  }, [restaurantId])

  async function loadRestaurant() {
    const { data: rest } = await supabase
      .from('restaurants').select('*').eq('id', restaurantId!).single()
    setRestaurant(rest)

    const { data: items } = await supabase
      .from('menu_items').select('*')
      .eq('restaurant_id', restaurantId!)
      .eq('available', true)
    setMenuItems(items || [])
    setLoading(false)
  }

  function addItem(id: string) {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }

  function removeItem(id: string) {
    setCart(prev => {
      const updated = { ...prev }
      if (updated[id] > 1) updated[id]--
      else delete updated[id]
      return updated
    })
  }

  const cartItems = menuItems.filter(i => cart[i.id])
  const subtotal = cartItems.reduce((acc, i) => acc + i.price * cart[i.id], 0)
  const total = subtotal + DELIVERY_FEE

  async function handleOrder() {
    if (cartItems.length === 0) { setError('Adicione ao menos um item.'); return }
    if (!address) { setError('Informe o endereço de entrega.'); return }
    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const orderItems: OrderItem[] = cartItems.map(i => ({
      menu_item_id: i.id,
      name: i.name,
      quantity: cart[i.id],
      unit_price: i.price,
    }))

    const { error: err } = await supabase.from('orders').insert({
      customer_id: user.id,
      motoboy_id: null,
      restaurant_id: restaurantId!,
      items: orderItems,
      total,
      delivery_fee: DELIVERY_FEE,
      platform_fee: PLATFORM_FEE,
      address,
      status: 'pending',
    })

    if (err) {
      setError('Erro ao fazer pedido. Tente novamente.')
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setTimeout(() => { window.location.href = '/delivery' }, 2500)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Carregando cardápio...</div>
      </div>
    )
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900">Pedido enviado!</h2>
          <p className="text-gray-500 text-sm mt-2">
            {restaurant?.name} está preparando seu pedido...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/delivery" className="text-gray-500 hover:text-gray-700">← Voltar</Link>
          <div>
            <h1 className="text-base font-bold text-gray-900">{restaurant?.name}</h1>
            <p className="text-xs text-gray-500">{restaurant?.category}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        {/* Cardápio */}
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Cardápio</h2>
        {menuItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm border border-gray-100">
            Nenhum item disponível
          </div>
        ) : (
          <div className="space-y-2 mb-5">
            {menuItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <p className="font-medium text-sm text-gray-800">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                  )}
                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    R$ {item.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {cart[item.id] ? (
                    <>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">{cart[item.id]}</span>
                    </>
                  ) : null}
                  <button
                    onClick={() => addItem(item.id)}
                    className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Endereço */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📍 Endereço de entrega
          </label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Ex: Rua das Flores, 123"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Rodapé fixo com resumo do pedido */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Taxa de entrega</span>
              <span>R$ {DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm mb-3">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleOrder}
              disabled={submitting}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Enviando pedido...' : `Fazer pedido • R$ ${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
