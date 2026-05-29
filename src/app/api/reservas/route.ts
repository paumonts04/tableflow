import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendConfirmacionCliente, sendAvisoAdmin } from '@/lib/resend/emails'
import { NextResponse } from 'next/server'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { z } from 'zod'

const reservaSchema = z.object({
  table_id: z.string().uuid(),
  service_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  party_size: z.number().int().min(1).max(20),
  guest_name: z.string().min(2).max(100),
  guest_email: z.string().email(),
  guest_phone: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export async function POST(request: Request) {
  // Validar datos de entrada
  let body
  try {
    const raw = await request.json()
    body = reservaSchema.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  }

  const { table_id, service_id, date, party_size, guest_name, guest_email, guest_phone, notes } = body

  // Comprobar que la fecha no es pasada
  const today = format(new Date(), 'yyyy-MM-dd')
  if (date <= today) {
    return NextResponse.json({ error: 'La fecha debe ser futura.' }, { status: 400 })
  }

  const supabase = createAdminClient()

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

  // Guardar reserva
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
    .select('*, tables(name), services(name)')
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