'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Servicio = {
  id: string
  name: string
  start_time: string
  end_time: string
  days_of_week: number[]
  max_capacity: number | null
  is_active: boolean
}

const DAYS = [
  { label: 'L', value: 1 },
  { label: 'M', value: 2 },
  { label: 'X', value: 3 },
  { label: 'J', value: 4 },
  { label: 'V', value: 5 },
  { label: 'S', value: 6 },
  { label: 'D', value: 0 },
]

export default function ServiciosClient({ servicios }: { servicios: Servicio[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    start_time: '13:00',
    end_time: '16:00',
    days_of_week: [1, 2, 3, 4, 5] as number[],
    max_capacity: '',
  })

  function toggleDay(day: number) {
    setForm(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('services').insert({
      ...form,
      max_capacity: form.max_capacity ? parseInt(form.max_capacity) : null,
    })
    setForm({
      name: '',
      start_time: '13:00',
      end_time: '16:00',
      days_of_week: [1, 2, 3, 4, 5],
      max_capacity: '',
    })
    setShowForm(false)
    setLoading(false)
    router.refresh()
  }

  async function handleToggle(id: string, current: boolean) {
    await supabase.from('services').update({ is_active: !current }).eq('id', id)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await supabase.from('services').delete().eq('id', id)
    router.refresh()
  }

  function formatDays(days: number[]) {
    return DAYS.filter(d => days.includes(d.value)).map(d => d.label).join(' ')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Servicios</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona los turnos del restaurante</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Cancelar' : 'Nuevo servicio'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-medium">Nuevo servicio</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Comida"
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Hora inicio</label>
              <input
                type="time"
                value={form.start_time}
                onChange={e => setForm({ ...form, start_time: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Hora fin</label>
              <input
                type="time"
                value={form.end_time}
                onChange={e => setForm({ ...form, end_time: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Días de la semana</label>
            <div className="flex gap-2">
              {DAYS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    form.days_of_week.includes(day.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-input text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 w-1/3">
            <label className="text-xs text-muted-foreground">Capacidad máxima (opcional)</label>
            <input
              type="number"
              value={form.max_capacity}
              onChange={e => setForm({ ...form, max_capacity: e.target.value })}
              placeholder="Sin límite"
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar servicio'}
          </button>
        </form>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Horario</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Días</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Capacidad</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No hay servicios creados
                </td>
              </tr>
            )}
            {servicios.map(servicio => (
              <tr key={servicio.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{servicio.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {servicio.start_time.slice(0, 5)} — {servicio.end_time.slice(0, 5)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDays(servicio.days_of_week)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {servicio.max_capacity ?? 'Sin límite'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    servicio.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {servicio.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(servicio.id, servicio.is_active)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {servicio.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(servicio.id)}
                      className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}