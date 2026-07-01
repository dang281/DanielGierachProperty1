export default function FunnelLoading() {
  return (
    <div className="flex flex-col h-full text-[var(--color-cream)] font-sans">
      <header className="px-6 py-5 border-b border-[var(--color-card-2)]">
        <div className="h-8 w-32 bg-[var(--color-card-2)] rounded animate-pulse mb-2" />
        <div className="h-3 w-72 bg-[var(--color-card)] rounded animate-pulse" />
      </header>
      <div className="flex-1 px-6 py-6 space-y-8 max-w-5xl">
        {Array.from({ length: 3 }).map((_, section) => (
          <div key={section}>
            <div className="h-3 w-32 bg-[var(--color-card)] rounded animate-pulse mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((__, i) => (
                <div key={i} className="h-20 bg-[var(--color-card)] rounded-lg animate-pulse" style={{ animationDelay: `${(section * 4 + i) * 30}ms` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
