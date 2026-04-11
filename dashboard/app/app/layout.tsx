import Link from 'next/link'
import { logout } from '@/lib/actions/auth'

const NAV = [
  { href: '/app',          label: 'Dashboard' },
  { href: '/app/calendar', label: 'Calendar' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border-w)] bg-[var(--color-card)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[var(--color-gold)] text-[10px] tracking-[0.2em] uppercase font-sans leading-none mb-0.5">
              Ray White Bulimba
            </p>
            <p className="text-[var(--color-cream)] text-sm font-serif leading-none">
              Daniel Gierach
            </p>
          </div>
          <nav className="flex gap-1">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[var(--color-cream-dim)] hover:text-[var(--color-cream)] text-sm font-sans px-3 py-1.5 rounded-lg hover:bg-[var(--color-card-2)] transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-[var(--color-cream-x)] hover:text-[var(--color-cream-dim)] text-xs font-sans transition-colors"
          >
            Sign out
          </button>
        </form>
      </header>
      <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
