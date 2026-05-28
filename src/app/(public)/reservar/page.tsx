import { createClient } from '@/lib/supabase/server'
import ReservaFlow from '@/components/reservas/ReservaFlow'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reservar mesa',
  description: 'Completa el formulario para reservar tu mesa. Confirmación inmediata por email.',
}

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight hover:opacity-80 transition-opacity">
          TableFlow
        </Link>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Acceso admin
        </Link>
      </nav>

      {/* Contenido */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">Reservar mesa</h1>
          <p className="text-muted-foreground mt-2">Completa los datos para hacer tu reserva</p>
        </div>
        <ReservaFlow servicios={servicios ?? []} mesas={mesas ?? []} />
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">TableFlow</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}