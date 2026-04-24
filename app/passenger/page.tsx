'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import RideCard from '@/components/RideCard'
import Link from 'next/link'
import type { Profile, Ride } from '@/types/database'

export default function PassengerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    subscribeToRides()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { data: prof } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    setProfile(prof)

    const { data: rideList } = await supabase
      .from('rides')
      .select('*')
      .eq('passenger_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    setRides(rideList || [])
    setLoading(false)
  }

  function subscribeToRides() {
    const channel = supabase
      .channel('passenger-rides')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'rides'
      }, () => { loadData() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const activeRide = rides.find(r =>
    ['pending', 'accepted', 'in_progress'].includes(r.status)
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <>
      <Navbar role="passenger" userName={profile?.name || ''} />
      <main className="max-w-lg mx-auto p-4">

        {/* Boas vindas */}
        <div className="mb-6 pt-2">
          <h1 className="text-xl font-bold text-gray-900">
            Olá, {profile?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm">O que você precisa hoje?</p>
        </div>

        {/* Corrida ativa */}
        {activeRide && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Corrida em andamento</h2>
            <RideCard ride={activeRide} />
          </div>
        )}

        {/* Ações rápidas */}
        {!activeRide && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link
              href="/passenger/nova-corrida"
              className="bg-blue-600 text-white rounded-2xl p-5 flex flex-col gap-2 hover:bg-blue-700 transition-colors"
            >
              <span className="text-3xl">🚗</span>
              <span className="font-semibold text-sm">Pedir corrida</span>
              <span className="text-blue-200 text-xs">Mototáxi ou carro</span>
            </Link>
            <Link
              href="/delivery"
              className="bg-orange-500 text-white rounded-2xl p-5 flex flex-col gap-2 hover:bg-orange-600 transition-colors"
            >
              <span className="text-3xl">🍔</span>
              <span className="font-semibold text-sm">Pedir comida</span>
              <span className="text-orange-200 text-xs">Restaurantes locais</span>
            </Link>
          </div>
        )}

        {/* Histórico */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Últimas corridas</h2>
          {rides.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              Você ainda não fez nenhuma corrida
            </div>
          ) : (
            rides.map(ride => <RideCard key={ride.id} ride={ride} />)
          )}
        </div>
      </main>
    </>
  )
}
