import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type ReservaEmailProps = {
  guestName: string
  guestEmail: string
  fecha: string
  servicio: string
  mesa: string
  personas: number
  notes?: string | null
}

export async function sendConfirmacionCliente(props: ReservaEmailProps) {
  await resend.emails.send({
    from: 'TableFlow <onboarding@resend.dev>',
    to: props.guestEmail,
    subject: 'Reserva recibida — TableFlow',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #111;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">¡Reserva recibida!</h1>
        <p style="color: #666; margin-bottom: 24px;">Hola ${props.guestName}, hemos recibido tu reserva correctamente.</p>
        
        <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 14px;">
            <tr style="margin-bottom: 8px;">
              <td style="color: #666; padding: 4px 0;">Fecha</td>
              <td style="font-weight: 500; text-align: right;">${props.fecha}</td>
            </tr>
            <tr>
              <td style="color: #666; padding: 4px 0;">Servicio</td>
              <td style="font-weight: 500; text-align: right;">${props.servicio}</td>
            </tr>
            <tr>
              <td style="color: #666; padding: 4px 0;">Mesa</td>
              <td style="font-weight: 500; text-align: right;">${props.mesa}</td>
            </tr>
            <tr>
              <td style="color: #666; padding: 4px 0;">Personas</td>
              <td style="font-weight: 500; text-align: right;">${props.personas}</td>
            </tr>
            ${props.notes ? `
            <tr>
              <td style="color: #666; padding: 4px 0;">Notas</td>
              <td style="font-weight: 500; text-align: right;">${props.notes}</td>
            </tr>` : ''}
          </table>
        </div>

        <p style="color: #666; font-size: 14px;">Te confirmaremos la reserva en breve. Si tienes alguna pregunta, responde a este email.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">TableFlow · Sistema de reservas</p>
      </div>
    `
  })
}

export async function sendAvisoAdmin(props: ReservaEmailProps) {
  await resend.emails.send({
    from: 'TableFlow <onboarding@resend.dev>',
    to: process.env.ADMIN_EMAIL!,
    subject: `Nueva reserva — ${props.guestName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #111;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Nueva reserva</h1>
        <p style="color: #666; margin-bottom: 24px;">Has recibido una nueva solicitud de reserva.</p>
        
        <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: #666; padding: 4px 0;">Cliente</td>
              <td style="font-weight: 500; text-align: right;">${props.guestName}</td>
            </tr>
            <tr>
              <td style="color: #666; padding: 4px 0;">Email</td>
              <td style="font-weight: 500; text-align: right;">${props.guestEmail}</td>
            </tr>
            <tr>
              <td style="color: #666; padding: 4px 0;">Fecha</td>
              <td style="font-weight: 500; text-align: right;">${props.fecha}</td>
            </tr>
            <tr>
              <td style="color: #666; padding: 4px 0;">Servicio</td>
              <td style="font-weight: 500; text-align: right;">${props.servicio}</td>
            </tr>
            <tr>
              <td style="color: #666; padding: 4px 0;">Mesa</td>
              <td style="font-weight: 500; text-align: right;">${props.mesa}</td>
            </tr>
            <tr>
              <td style="color: #666; padding: 4px 0;">Personas</td>
              <td style="font-weight: 500; text-align: right;">${props.personas}</td>
            </tr>
            ${props.notes ? `
            <tr>
              <td style="color: #666; padding: 4px 0;">Notas</td>
              <td style="font-weight: 500; text-align: right;">${props.notes}</td>
            </tr>` : ''}
          </table>
        </div>

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/reservas" 
           style="display: inline-block; background: #111; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
          Ver en el panel
        </a>
      </div>
    `
  })
}