import { createClient } from '@/lib/supabase/server'
import { sendConfirmacionCliente, sendAvisoAdmin } from '@/lib/resend/emails'
import { NextResponse } from 'next/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { table_id, service_id, date, party_size, guest_name, guest_email, guest_phone, notes } = body

  // Comprobar disponibilidad
  const { data: existente } = await supabase
    .from('reservations')
    .select('id')
    .eq('table_id', table_id)
    .eq('service_id', service_id)
    .eq('date', date)
    .not('status', 'eq', 'cancelled')
    .single()

  if (existente) {
    return NextResponse.json(
      { error: 'Esta mesa ya está reservada para ese día y servicio.' },
      { status: 409 }
    )
  }

  // Guardar reserva en Supabase
  const { data: reserva, error } = await supabase
    .from('reservations')
    .insert({
      table_id,
      service_id,
      date,
      party_size,
      status: 'pending',
      guest_name,
      guest_email,
      guest_phone,
      notes,
    })
    .select(`*, tables(name), services(name)`)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enviar emails
  const fechaFormateada = format(new Date(date + 'T12:00:00'), "d 'de' MMMM yyyy", { locale: es })

  try {
    await Promise.all([
      sendConfirmacionCliente({
        guestName: guest_name,
        guestEmail: guest_email,
        fecha: fechaFormateada,
        servicio: reserva.services?.name ?? '',
        mesa: reserva.tables?.name ?? '',
        personas: party_size,
        notes,
      }),
      sendAvisoAdmin({
        guestName: guest_name,
        guestEmail: guest_email,
        fecha: fechaFormateada,
        servicio: reserva.services?.name ?? '',
        mesa: reserva.tables?.name ?? '',
        personas: party_size,
        notes,
      }),
    ])
  } catch (emailError) {
    console.error('Error enviando emails:', emailError)
  }

  return NextResponse.json({ success: true, reserva })
}