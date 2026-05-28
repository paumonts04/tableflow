import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TableFlow — Reserva tu mesa online',
  description: 'Reserva tu mesa de forma rápida y sencilla. Elige fecha, servicio y mesa. Sin llamadas, sin esperas.',
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: servicios } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('start_time')

  const DAYS_MAP: Record<number, string> = {
    0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-semibold tracking-tight">TableFlow</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Acceso admin
          </Link>
          <Link
            href="/reservar"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Reservar
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <p className="text-sm text-muted-foreground mb-4 tracking-widest uppercase">Bienvenido</p>
        <h1 className="text-5xl font-semibold tracking-tight mb-6 leading-tight">
          Reserva tu mesa<br />en segundos
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10">
          Elige fecha, servicio y mesa. Sin llamadas, sin esperas. Tu reserva confirmada al instante.
        </p>
        <Link
          href="/reservar"
          className="inline-flex px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Hacer una reserva
        </Link>
      </section>

      {/* Cómo funciona */}
      <section className="border-t border-border py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-center mb-12">Cómo funciona</h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Elige fecha', desc: 'Selecciona el día y el número de comensales.' },
              { step: '02', title: 'Selecciona mesa', desc: 'Consulta las mesas disponibles y elige la que prefieras.' },
              { step: '03', title: 'Confirma', desc: 'Introduce tus datos y recibe la confirmación por email.' },
            ].map(item => (
              <div key={item.step} className="space-y-3">
                <span className="text-xs font-mono text-muted-foreground">{item.step}</span>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      {servicios && servicios.length > 0 && (
        <section className="border-t border-border py-20">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-center mb-12">Nuestros servicios</h2>
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
              {servicios.map(s => (
                <div key={s.id} className="border border-border rounded-lg p-6 space-y-2">
                  <h3 className="font-medium">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {s.start_time.slice(0, 5)} — {s.end_time.slice(0, 5)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.days_of_week.sort().map((d: number) => DAYS_MAP[d]).join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="border-t border-border py-20 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">¿Listo para reservar?</h2>
          <p className="text-muted-foreground mb-8">Consulta disponibilidad y reserva tu mesa ahora.</p>
          <Link
            href="/reservar"
            className="inline-flex px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Reservar ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>TableFlow</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}