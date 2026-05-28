import { createClient } from '@/lib/supabase/server'
import ReservasClient from './reservas-client'

export default async function ReservasPage() {
  const supabase = await createClient()
  const { data: reservas } = await supabase
    .from('reservations')
    .select(`
      *,
      tables (name),
      services (name)
    `)
    .order('date', { ascending: false })

  return <ReservasClient reservas={reservas ?? []} />
}