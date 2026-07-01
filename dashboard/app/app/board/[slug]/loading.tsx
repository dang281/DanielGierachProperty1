// Renders instantly when the user clicks Properties / Buyers / Contacts /
// Referrals. The real page streams in once Supabase + Monday-column metadata
// are loaded — but the user sees this shape immediately so the tab change
// feels snappy.

export default function BoardLoading() {
  return (
    <div className="flex flex-col h-full text-[var(--color-cream)] font-sans">
      <header className="px-6 py-4 border-b border-[var(--color-card-2)] flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-[var(--color-card-2)] rounded animate-pulse" />
          <div className="h-3 w-56 bg-[var(--color-card)] rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-[var(--color-card)] rounded-lg animate-pulse" />
          <div className="h-8 w-24 bg-[var(--color-card)] rounded-lg animate-pulse" />
          <div className="h-8 w-48 bg-[var(--color-card)] rounded-lg animate-pulse" />
        </div>
      </header>
      <div className="flex-1 overflow-hidden px-6 py-4 space-y-1.5">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="h-6 bg-[var(--color-card)] rounded animate-pulse"
            style={{ animationDelay: `${i * 30}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
