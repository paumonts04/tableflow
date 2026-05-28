'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Mesa = {
  id: string
  name: string
  capacity: number
  location: string | null
  is_active: boolean
}

export default function MesasClient({ mesas }: { mesas: Mesa[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    capacity: 2,
    location: 'interior',
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.from('tables').insert(form)
    setForm({ name: '', capacity: 2, location: 'interior' })
    setShowForm(false)
    setLoading(false)
    router.refresh()
  }

  async function handleToggle(id: string, current: boolean) {
    await supabase.from('tables').update({ is_active: !current }).eq('id', id)
    router.refresh()
  }

  async function handleDelete(id: string) {
    await supabase.from('tables').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mesas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las mesas del restaurante</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Cancelar' : 'Nueva mesa'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-medium">Nueva mesa</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Mesa 1"
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Capacidad</label>
              <input
                type="number"
                value={form.capacity === 0 ? '' : form.capacity}
                onChange={e => setForm({ ...form, capacity: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                min={1}
                max={20}
                required
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Ubicación</label>
              <select
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="interior">Interior</option>
                <option value="terraza">Terraza</option>
                <option value="privado">Privado</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar mesa'}
          </button>
        </form>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Capacidad</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ubicación</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mesas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No hay mesas creadas
                </td>
              </tr>
            )}
            {mesas.map(mesa => (
              <tr key={mesa.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{mesa.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{mesa.capacity} personas</td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{mesa.location}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    mesa.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {mesa.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(mesa.id, mesa.is_active)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {mesa.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(mesa.id)}
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