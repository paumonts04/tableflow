import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import ReservaActions from './reserva-actions'

export default async function ReservaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: reserva } = await supabase
    .from('reservations')
    .select('*, tables(name, capacity, location), services(name, start_time, end_time)')
    .eq('id', id)
    .single()

  if (!reserva) notFound()

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada',
  }

  const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-muted text-muted-foreground',
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/reservas"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Reservas
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{reserva.guest_name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reserva del {format(new Date(reserva.created_at), "d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[reserva.status]}`}>
          {STATUS_LABELS[reserva.status]}
        </span>
      </div>

      {/* Datos de la reserva */}
      <div className="border border-border rounded-lg divide-y divide-border">
        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Fecha</p>
            <p className="text-sm font-medium">
              {format(new Date(reserva.date + 'T12:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Servicio</p>
            <p className="text-sm font-medium">
              {reserva.services?.name} · {reserva.services?.start_time.slice(0, 5)} — {reserva.services?.end_time.slice(0, 5)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Mesa</p>
            <p className="text-sm font-medium">
              {reserva.tables?.name} · hasta {reserva.tables?.capacity} personas · {reserva.tables?.location}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Personas</p>
            <p className="text-sm font-medium">{reserva.party_size}</p>
          </div>
        </div>

        {/* Datos del cliente */}
        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <a href={`mailto:${reserva.guest_email}`} className="text-sm font-medium hover:underline">
              {reserva.guest_email}
            </a>
          </div>
          {reserva.guest_phone && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
              <a href={`tel:${reserva.guest_phone}`} className="text-sm font-medium hover:underline">
                {reserva.guest_phone}
              </a>
            </div>
          )}
        </div>

        {/* Notas */}
        {reserva.notes && (
          <div className="px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Notas</p>
            <p className="text-sm">{reserva.notes}</p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <ReservaActions reservaId={reserva.id} currentStatus={reserva.status} />
    </div>
  )
}