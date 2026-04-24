'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { UserRole } from '@/types/database'

export default function Register() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('passenger')
  const [vehicle, setVehicle] = useState('moto')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister() {
    if (!name || !email || !password || !phone) {
      setError('Preencha todos os campos.')
      return
    }
    setLoading(true)
    setError('')

    // 1. Cria usuário no Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // 2. Salva perfil na tabela profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user!.id,
      name,
      phone,
      role,
      vehicle_type: role !== 'passenger' ? vehicle : null,
      is_online: false,
    })

    if (profileError) {
      setError('Erro ao salvar perfil. Tente novamente.')
      setLoading(false)
      return
    }

    // Redireciona conforme o papel
    if (role === 'passenger') {
      window.location.href = '/passenger'
    } else {
      window.location.href = '/driver'
    }
  }

  const roles = [
    { value: 'passenger', label: 'Passageiro', icon: '👤', desc: 'Quero pedir corridas e comida' },
    { value: 'driver',    label: 'Motorista',  icon: '🚗', desc: 'Quero fazer corridas de carro' },
    { value: 'motoboy',   label: 'Motoboy',    icon: '🏍️', desc: 'Quero fazer corridas e entregas' },
  ]

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-sm w-full">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">🚗 CidadeApp</Link>
          <p className="text-gray-500 text-sm mt-1">Crie sua conta grátis</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Tipo de usuário */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quem sou eu</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value as UserRole)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${
                    role === r.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-2xl mb-1">{r.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="João da Silva"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(88) 99999-9999"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Veículo — só para motorista/motoboy */}
            {role !== 'passenger' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de veículo</label>
                <select
                  value={vehicle}
                  onChange={e => setVehicle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="moto">Motocicleta</option>
                  <option value="carro">Carro</option>
                </select>
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Já tem conta?{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
