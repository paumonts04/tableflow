'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type Reserva = {
  id: string
  date: string
  party_size: number
  status: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  notes: string | null
  created_at: string
  tables: { name: string } | null
  services: { name: string } | null
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-muted text-muted-foreground',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
}

export default function ReservasClient({ reservas }: { reservas: Reserva[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [filter, setFilter] = useState('all')

  async function handleStatus(id: string, status: string) {
    await supabase.from('reservations').update({ status }).eq('id', id)
    router.refresh()
  }

  const filtered = filter === 'all'
    ? reservas
    : reservas.filter(r => r.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reservas</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona las reservas del restaurante</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-primary-foreground'
                : 'border border-input text-muted-foreground hover:text-foreground'
            }`}
          >
            {status === 'all' ? 'Todas' : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Servicio</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mesa</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Personas</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No hay reservas
                </td>
              </tr>
            )}
            {filtered.map(reserva => (
              <tr key={reserva.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{reserva.guest_name}</p>
                  <p className="text-xs text-muted-foreground">{reserva.guest_email}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {format(new Date(reserva.date), "d MMM yyyy", { locale: es })}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {reserva.services?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {reserva.tables?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {reserva.party_size}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[reserva.status]}`}>
                    {STATUS_LABELS[reserva.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={reserva.status}
                    onChange={e => handleStatus(reserva.id, e.target.value)}
                    className="text-xs border border-input rounded-md px-2 py-1 bg-background outline-none"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmar</option>
                    <option value="cancelled">Cancelar</option>
                    <option value="completed">Completada</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}