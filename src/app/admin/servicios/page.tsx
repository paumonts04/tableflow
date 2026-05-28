import { createClient } from '@/lib/supabase/server'
import ServiciosClient from './servicios-client'

export default async function ServiciosPage() {
  const supabase = await createClient()
  const { data: servicios } = await supabase
    .from('services')
    .select('*')
    .order('start_time', { ascending: true })

  return <ServiciosClient servicios={servicios ?? []} />
}