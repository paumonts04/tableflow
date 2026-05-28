import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [
    { count: totalHoy },
    { count: pendientes },
    { count: confirmadas },
    { count: totalMes },
    { data: proximasReservas },
  ] = await Promise.all([
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('date', today),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('reservations').select('*', { count: 'exact', head: true }).gte('date', format(new Date(), 'yyyy-MM-01')),
    supabase.from('reservations')
      .select('*, tables(name), services(name)')
      .gte('date', today)
      .not('status', 'eq', 'cancelled')
      .order('date', { ascending: true })
      .limit(5),
  ])

  const stats = [
    { label: 'Reservas hoy', value: totalHoy ?? 0, color: 'text-foreground' },
    { label: 'Pendientes', value: pendientes ?? 0, color: 'text-yellow-600' },
    { label: 'Confirmadas', value: confirmadas ?? 0, color: 'text-green-600' },
    { label: 'Este mes', value: totalMes ?? 0, color: 'text-foreground' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="border border-border rounded-lg p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-3xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Próximas reservas */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Próximas reservas</h2>
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
              </tr>
            </thead>
            <tbody>
              {!proximasReservas?.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No hay reservas próximas
                  </td>
                </tr>
              )}
              {proximasReservas?.map((r: any) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.guest_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(r.date + 'T12:00:00'), "d MMM", { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.services?.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.tables?.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.party_size}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      r.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {r.status === 'pending' ? 'Pendiente' :
                       r.status === 'confirmed' ? 'Confirmada' : r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}