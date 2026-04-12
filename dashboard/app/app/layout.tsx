import NavLinks from '@/components/dashboard/NavLinks'
import { logout } from '@/lib/actions/auth'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-[var(--color-bg)]">
      <header
        className="sticky top-0 z-40 border-b border-[var(--color-border-w)] px-6 flex items-center justify-between h-12"
        style={{ backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.92)' }}
      >
        <div className="flex items-center gap-5">
          {/* Wordmark */}
          <div className="flex items-baseline gap-1.5 select-none flex-shrink-0">
            <span
              className="text-[11px] font-sans font-semibold tracking-[0.18em] uppercase"
              style={{ color: 'var(--color-gold)' }}
            >
              Daniel Gierach
            </span>
            <span className="text-[10px] font-sans text-[var(--color-cream-x)] tracking-wide hidden sm:block">
              · Property
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-[var(--color-border-w)] flex-shrink-0" />

          <NavLinks />
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="text-[var(--color-cream-x)] hover:text-[var(--color-cream-dim)] text-[12px] font-sans"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="flex-1 px-6 py-6 max-w-[1440px] mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
