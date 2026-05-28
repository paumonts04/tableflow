import { createClient } from '@/lib/supabase/server'
import MesasClient from './mesas-client'

export default async function MesasPage() {
  const supabase = await createClient()
  const { data: mesas } = await supabase
    .from('tables')
    .select('*')
    .order('created_at', { ascending: true })

  return <MesasClient mesas={mesas ?? []} />
}