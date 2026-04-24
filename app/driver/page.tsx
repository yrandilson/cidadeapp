'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import RideCard from '@/components/RideCard'
import type { Profile, Ride } from '@/types/database'

export default function DriverDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isOnline, setIsOnline] = useState(false)
  const [availableRides, setAvailableRides] = useState<Ride[]>([])
  const [myRides, setMyRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!isOnline) return
    const channel = supabase
      .channel('driver-rides')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => {
        loadRides()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [isOnline])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { data: prof } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()

    if (!prof || prof.role === 'passenger') {
      window.location.href = '/passenger'; return
    }

    setProfile(prof)
    setIsOnline(prof.is_online || false)
    await loadRides(user.id)
    setLoading(false)
  }

  async function loadRides(userId?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    const uid = userId || user?.id
    if (!uid) return

    const { data: available } = await supabase
      .from('rides')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    const { data: mine } = await supabase
      .from('rides')
      .select('*')
      .eq('driver_id', uid)
      .order('created_at', { ascending: false })
      .limit(10)

    setAvailableRides(available || [])
    setMyRides(mine || [])
  }

  async function toggleOnline() {
    if (!profile) return
    setToggling(true)
    const newStatus = !isOnline

    await supabase
      .from('profiles')
      .update({ is_online: newStatus })
      .eq('id', profile.id)

    setIsOnline(newStatus)
    if (newStatus) loadRides()
    setToggling(false)
  }

  async function acceptRide(rideId: string) {
    if (!profile) return
    await supabase.from('rides').update({
      driver_id: profile.id,
      status: 'accepted',
    }).eq('id', rideId)
    loadRides()
  }

  async function startRide(rideId: string) {
    await supabase.from('rides').update({ status: 'in_progress' }).eq('id', rideId)
    loadRides()
  }

  async function finishRide(rideId: string) {
    await supabase.from('rides').update({ status: 'finished' }).eq('id', rideId)
    loadRides()
  }

  const activeRide = myRides.find(r => ['accepted', 'in_progress'].includes(r.status))

  // Ganhos do dia
  const todayEarnings = myRides
    .filter(r => r.status === 'finished' && new Date(r.created_at).toDateString() === new Date().toDateString())
    .reduce((acc, r) => acc + (r.price - r.platform_fee), 0)

  const totalRides = myRides.filter(r => r.status === 'finished').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <>
      <Navbar role="driver" userName={profile?.name || ''} />
      <main className="max-w-lg mx-auto p-4">

        {/* Header */}
        <div className="mb-5 pt-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Olá, {profile?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm">
              {profile?.vehicle_type === 'moto' ? '🏍️ Mototáxi' : '🚗 Carro'}
            </p>
          </div>

          {/* Toggle online/offline */}
          <button
            onClick={toggleOnline}
            disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              isOnline
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {toggling ? '...' : isOnline ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">
              R$ {todayEarnings.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Ganhos hoje</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalRides}</div>
            <div className="text-xs text-gray-500 mt-1">Corridas feitas</div>
          </div>
        </div>

        {!isOnline ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <div className="text-4xl mb-3">😴</div>
            <p className="text-gray-600 font-medium">Você está offline</p>
            <p className="text-gray-400 text-sm mt-1">Ative para receber corridas</p>
            <button
              onClick={toggleOnline}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Ficar online
            </button>
          </div>
        ) : (
          <>
            {/* Corrida ativa */}
            {activeRide && (
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">🔥 Corrida em andamento</h2>
                <RideCard
                  ride={activeRide}
                  showActions
                  onProgress={startRide}
                  onFinish={finishRide}
                />
              </div>
            )}

            {/* Corridas disponíveis */}
            {!activeRide && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-gray-700">
                    Corridas disponíveis
                  </h2>
                  <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {availableRides.length}
                  </span>
                </div>

                {availableRides.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="text-gray-500 text-sm">Aguardando novas corridas...</p>
                  </div>
                ) : (
                  availableRides.map(ride => (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      showActions
                      onAccept={acceptRide}
                    />
                  ))
                )}
              </div>
            )}

            {/* Histórico */}
            <div className="mt-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Histórico</h2>
              {myRides.filter(r => r.status === 'finished').slice(0, 5).map(ride => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  )
}
