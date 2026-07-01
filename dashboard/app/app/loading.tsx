// Renders instantly for the Today page.

export default function TodayLoading() {
  return (
    <div className="flex flex-col h-full text-[var(--color-cream)] font-sans">
      <header className="px-6 py-5 border-b border-[var(--color-card-2)] flex items-baseline justify-between flex-wrap gap-3">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-[var(--color-card-2)] rounded animate-pulse" />
          <div className="h-3 w-40 bg-[var(--color-card)] rounded animate-pulse" />
        </div>
        <div className="h-5 w-32 bg-[var(--color-card)] rounded animate-pulse" />
      </header>
      <div className="flex-1 overflow-hidden px-4 sm:px-6 py-4 space-y-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-12 bg-[var(--color-card)] rounded-lg animate-pulse"
            style={{ animationDelay: `${i * 40}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
