import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const service_id = searchParams.get('service_id')

  if (!date || !service_id) {
    return NextResponse.json({ mesasOcupadas: [] })
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from('reservations')
    .select('table_id')
    .eq('date', date)
    .eq('service_id', service_id)
    .not('status', 'eq', 'cancelled')

  const mesasOcupadas = data?.map(r => r.table_id) ?? []

  return NextResponse.json({ mesasOcupadas })
}