import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <p className="text-sm font-mono text-muted-foreground">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Página no encontrada</h1>
        <p className="text-muted-foreground text-sm">La página que buscas no existe.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            href="/reservar"
            className="px-4 py-2 border border-input rounded-md text-sm font-medium hover:bg-accent transition-colors"
          >
            Reservar mesa
          </Link>
        </div>
      </div>
    </div>
  )
}