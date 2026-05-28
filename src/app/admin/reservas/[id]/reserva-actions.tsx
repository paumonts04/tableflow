'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

const ACTIONS = [
  { status: 'confirmed', label: 'Confirmar reserva', style: 'bg-primary text-primary-foreground hover:bg-primary/90' },
  { status: 'cancelled', label: 'Cancelar reserva', style: 'border border-destructive text-destructive hover:bg-destructive/10' },
  { status: 'completed', label: 'Marcar como completada', style: 'border border-input hover:bg-accent' },
]

export default function ReservaActions({
  reservaId,
  currentStatus,
}: {
  reservaId: string
  currentStatus: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleStatus(status: string) {
    setLoading(status)
    await supabase.from('reservations').update({ status }).eq('id', reservaId)
    setLoading(null)
    router.refresh()
  }

  const availableActions = ACTIONS.filter(a => a.status !== currentStatus)

  return (
    <div className="flex gap-3">
      {availableActions.map(action => (
        <button
          key={action.status}
          onClick={() => handleStatus(action.status)}
          disabled={loading !== null}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${action.style}`}
        >
          {loading === action.status ? 'Guardando...' : action.label}
        </button>
      ))}
    </div>
  )
}