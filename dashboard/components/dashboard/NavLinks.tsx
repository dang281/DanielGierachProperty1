'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/app',           label: 'Dashboard', exact: true },
  { href: '/app/social',    label: 'Social' },
  { href: '/app/seo',       label: 'SEO' },
  { href: '/app/projects',  label: 'Projects' },
  { href: '/app/calendar',  label: 'Calendar' },
  { href: '/app/brand',     label: 'Brand' },
  { href: '/app/workflow',  label: 'Workflow' },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-0.5">
      {NAV.map(({ href, label, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={[
              'relative px-3 py-1.5 rounded-lg text-[13px] font-sans font-medium transition-colors',
              isActive
                ? 'text-[var(--color-cream)] bg-[var(--color-card-2)]'
                : 'text-[var(--color-cream-dim)] hover:text-[var(--color-cream)] hover:bg-[var(--color-card-2)]',
            ].join(' ')}
          >
            {label}
            {isActive && (
              <span
                className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                style={{ background: 'var(--color-gold)' }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
