import { createClient } from '@/lib/supabase/server'
import ReservaFlow from '@/components/reservas/ReservaFlow'

export default async function ReservarPage() {
  const supabase = await createClient()

  const { data: servicios } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('start_time')

  const { data: mesas } = await supabase
    .from('tables')
    .select('*')
    .eq('is_active', true)
    .order('capacity')

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">Reservar mesa</h1>
          <p className="text-muted-foreground mt-2">Completa los datos para hacer tu reserva</p>
        </div>
        <ReservaFlow servicios={servicios ?? []} mesas={mesas ?? []} />
      </div>
    </div>
  )
}