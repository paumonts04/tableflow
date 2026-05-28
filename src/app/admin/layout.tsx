import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-lg font-semibold tracking-tight">TableFlow</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Panel de administración</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/admin" label="Dashboard" />
          <NavItem href="/admin/reservas" label="Reservas" />
          <NavItem href="/admin/mesas" label="Mesas" />
          <NavItem href="/admin/servicios" label="Servicios" />
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {label}
    </Link>
  )
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Cerrar sesión
      </button>
    </form>
  )
}