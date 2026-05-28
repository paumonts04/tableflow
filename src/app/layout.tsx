import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'TableFlow — Reservas de restaurante',
    template: '%s | TableFlow',
  },
  description: 'Reserva tu mesa de forma rápida y sencilla. Sin llamadas, sin esperas.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}