import type { Ride } from '@/types/database'

const statusLabel: Record<string, string> = {
  pending:     'Aguardando',
  accepted:    'Aceita',
  in_progress: 'Em andamento',
  finished:    'Finalizada',
  cancelled:   'Cancelada',
}

const statusClass: Record<string, string> = {
  pending:     'status-pending',
  accepted:    'status-accepted',
  in_progress: 'status-progress',
  finished:    'status-finished',
  cancelled:   'status-cancelled',
}

interface RideCardProps {
  ride: Ride
  onAccept?: (id: string) => void
  onProgress?: (id: string) => void
  onFinish?: (id: string) => void
  showActions?: boolean
}

export default function RideCard({ ride, onAccept, onProgress, onFinish, showActions }: RideCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs text-gray-500">
            {ride.vehicle_type === 'moto' ? '🏍️' : '🚗'} {ride.vehicle_type}
          </span>
        </div>
        <span className={statusClass[ride.status]}>{statusLabel[ride.status]}</span>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
          <span className="text-gray-700 font-medium">{ride.origin}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
          <span className="text-gray-700 font-medium">{ride.destination}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900">
          R$ {ride.price.toFixed(2)}
        </span>
        <span className="text-xs text-gray-400">
          Taxa: R$ {ride.platform_fee.toFixed(2)}
        </span>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
          {ride.status === 'pending' && onAccept && (
            <button
              onClick={() => onAccept(ride.id)}
              className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Aceitar corrida
            </button>
          )}
          {ride.status === 'accepted' && onProgress && (
            <button
              onClick={() => onProgress(ride.id)}
              className="flex-1 bg-purple-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-purple-700 transition-colors"
            >
              Iniciar corrida
            </button>
          )}
          {ride.status === 'in_progress' && onFinish && (
            <button
              onClick={() => onFinish(ride.id)}
              className="flex-1 bg-green-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors"
            >
              Finalizar corrida
            </button>
          )}
        </div>
      )}
    </div>
  )
}
