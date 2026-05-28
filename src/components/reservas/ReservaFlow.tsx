'use client'

import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

type Servicio = {
  id: string
  name: string
  start_time: string
  end_time: string
  days_of_week: number[]
}

type Mesa = {
  id: string
  name: string
  capacity: number
  location: string | null
}

type Props = {
  servicios: Servicio[]
  mesas: Mesa[]
}

type Step = 'datetime' | 'mesa' | 'datos' | 'confirmado'

export default function ReservaFlow({ servicios, mesas }: Props) {
  const [step, setStep] = useState<Step>('datetime')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mesasOcupadas, setMesasOcupadas] = useState<string[]>([])

  const [fecha, setFecha] = useState('')
  const [personas, setPersonas] = useState(2)
  const [servicioId, setServicioId] = useState('')
  const [mesaId, setMesaId] = useState('')
  const [form, setForm] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    notes: '',
  })

  const serviciosFiltrados = fecha
    ? servicios.filter(s => {
        const dayOfWeek = new Date(fecha + 'T12:00:00').getDay()
        return s.days_of_week.includes(dayOfWeek)
      })
    : servicios

  const mesasFiltradas = mesas.filter(m =>
    m.capacity >= personas && !mesasOcupadas.includes(m.id)
  )

  const servicioSeleccionado = servicios.find(s => s.id === servicioId)
  const mesaSeleccionada = mesas.find(m => m.id === mesaId)

  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  async function irAMesas() {
    const res = await fetch(`/api/disponibilidad?date=${fecha}&service_id=${servicioId}`)
    const data = await res.json()
    setMesasOcupadas(data.mesasOcupadas)
    setMesaId('')
    setStep('mesa')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_id: mesaId,
        service_id: servicioId,
        date: fecha,
        party_size: personas,
        ...form,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Ha ocurrido un error. Inténtalo de nuevo.')
      setLoading(false)
      return
    }

    setStep('confirmado')
    setLoading(false)
  }

  if (step === 'confirmado') {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-4xl">✓</div>
        <h2 className="text-2xl font-semibold">¡Reserva realizada!</h2>
        <p className="text-muted-foreground">
          Hemos recibido tu reserva para el{' '}
          {fecha && format(new Date(fecha + 'T12:00:00'), "d 'de' MMMM", { locale: es })} —{' '}
          {servicioSeleccionado?.name} — {mesaSeleccionada?.name}
        </p>
        <p className="text-sm text-muted-foreground">Te confirmaremos por email en breve.</p>
        <button
          onClick={() => {
            setStep('datetime')
            setFecha('')
            setServicioId('')
            setMesaId('')
            setMesasOcupadas([])
            setForm({ guest_name: '', guest_email: '', guest_phone: '', notes: '' })
          }}
          className="mt-4 px-4 py-2 border border-input rounded-md text-sm hover:bg-accent transition-colors"
        >
          Hacer otra reserva
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Indicador de pasos */}
      <div className="flex items-center gap-2">
        {(['datetime', 'mesa', 'datos'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              step === s
                ? 'bg-primary text-primary-foreground'
                : ['datetime', 'mesa', 'datos'].indexOf(step) > i
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {i + 1}
            </div>
            {i < 2 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {step === 'datetime' && 'Fecha y servicio'}
          {step === 'mesa' && 'Selecciona mesa'}
          {step === 'datos' && 'Tus datos'}
        </span>
      </div>

      {/* Paso 1: Fecha, personas y servicio */}
      {step === 'datetime' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha</label>
              <input
                type="date"
                value={fecha}
                min={minDate}
                onChange={e => { setFecha(e.target.value); setServicioId('') }}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Número de personas</label>
              <select
                value={personas}
                onChange={e => setPersonas(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                ))}
              </select>
            </div>
          </div>

          {fecha && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Servicio</label>
              {serviciosFiltrados.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay servicios disponibles para este día.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {serviciosFiltrados.map(servicio => (
                    <button
                      key={servicio.id}
                      type="button"
                      onClick={() => setServicioId(servicio.id)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        servicioId === servicio.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <p className="font-medium text-sm">{servicio.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {servicio.start_time.slice(0, 5)} — {servicio.end_time.slice(0, 5)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={irAMesas}
            disabled={!fecha || !servicioId}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            Continuar
          </button>
        </div>
      )}

      {/* Paso 2: Seleccionar mesa */}
      {step === 'mesa' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mesa disponible</label>
            {mesasFiltradas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay mesas disponibles para {personas} personas en este servicio.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {mesasFiltradas.map(mesa => (
                  <button
                    key={mesa.id}
                    type="button"
                    onClick={() => setMesaId(mesa.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      mesaId === mesa.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-foreground/30'
                    }`}
                  >
                    <p className="font-medium text-sm">{mesa.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hasta {mesa.capacity} personas · {mesa.location}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('datetime')}
              className="flex-1 py-2 px-4 border border-input rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              Atrás
            </button>
            <button
              onClick={() => setStep('datos')}
              disabled={!mesaId}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Datos del cliente */}
      {step === 'datos' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-1 text-sm">
            <p><span className="text-muted-foreground">Fecha:</span> {fecha && format(new Date(fecha + 'T12:00:00'), "d 'de' MMMM yyyy", { locale: es })}</p>
            <p><span className="text-muted-foreground">Servicio:</span> {servicioSeleccionado?.name}</p>
            <p><span className="text-muted-foreground">Mesa:</span> {mesaSeleccionada?.name}</p>
            <p><span className="text-muted-foreground">Personas:</span> {personas}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre completo</label>
              <input
                type="text"
                value={form.guest_name}
                onChange={e => setForm({ ...form, guest_name: e.target.value })}
                placeholder="Tu nombre"
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={form.guest_email}
                onChange={e => setForm({ ...form, guest_email: e.target.value })}
                placeholder="tu@email.com"
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono <span className="text-muted-foreground">(opcional)</span></label>
              <input
                type="tel"
                value={form.guest_phone}
                onChange={e => setForm({ ...form, guest_phone: e.target.value })}
                placeholder="+34 600 000 000"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas <span className="text-muted-foreground">(opcional)</span></label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Alergias, celebraciones, peticiones especiales..."
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('mesa')}
              className="flex-1 py-2 px-4 border border-input rounded-md text-sm font-medium hover:bg-accent transition-colors"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enviando...' : 'Confirmar reserva'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}