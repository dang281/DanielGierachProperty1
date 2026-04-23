// Static reference — no client state needed

const GOLD    = '#c4912a'
const CREAM   = 'var(--color-cream)'
const DIMMED  = 'var(--color-cream-x)'
const DIMMER  = 'var(--color-cream-dim)'
const BORDER  = 'var(--color-border-w)'
const CARD    = 'var(--color-card)'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-sans font-bold tracking-[0.18em] uppercase" style={{ color: GOLD }}>
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  )
}

function Row({ dot, dotColour, label, description }: {
  dot?: string
  dotColour?: string
  label: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      {dot !== undefined ? (
        <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: dotColour }} />
      ) : (
        <span className="w-2 h-2 flex-shrink-0 mt-1" />
      )}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] font-sans font-semibold" style={{ color: CREAM }}>{label}</span>
        <span className="text-[10px] font-sans leading-relaxed" style={{ color: DIMMED }}>{description}</span>
      </div>
    </div>
  )
}

function Badge({ colour, label, description }: { colour: string; label: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[8px] font-sans font-bold uppercase tracking-wide px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
        style={{ color: colour, background: `${colour}22` }}>
        {label}
      </span>
      <span className="text-[10px] font-sans leading-relaxed" style={{ color: DIMMED }}>{description}</span>
    </div>
  )
}

export default function CalendarGlossary() {
  return (
    <div className="rounded-xl border p-5 flex flex-col gap-6"
      style={{ background: CARD, borderColor: BORDER }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase" style={{ color: DIMMER }}>
          Calendar Reference
        </p>
        <p className="text-[10px] font-sans" style={{ color: DIMMER }}>
          Hover any post to access actions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* ── Statuses ── */}
        <Section title="Post status">
          <Row
            dot="" dotColour="#c4912a"
            label="Needs Review"
            description="The agent has written this post. Review the caption and visual before approving it to Scheduled."
          />
          <Row
            dot="" dotColour="#22c55e"
            label="Scheduled"
            description="You have approved this post. Caption and visual are done and it is sitting in the queue ready to publish."
          />
          <Row
            dot="" dotColour="#3b82f6"
            label="Posted"
            description="Published to the platform. Mark posts as posted after they go live."
          />
          <Row
            dot="" dotColour="#ef4444"
            label="Rejected"
            description="Reviewed and declined. This post will not be published and will not return."
          />
          <Row
            dot="" dotColour="#6b5a3e"
            label="Archived"
            description="Permanently removed from the calendar. Happens when you delete a post. Hidden and cannot be rescheduled."
          />
        </Section>

        {/* ── Actions ── */}
        <Section title="Post actions">
          <Row
            label="Create Visual"
            description="Generates the post's LinkedIn graphic using Daniel's charcoal/gold brand template. The 1080×1080 PNG is created and attached to the post automatically."
          />
          <Row
            label="Give another option"
            description="Finds the next queued post of the same type (market, article, etc.) and offers to swap it into this slot. The current post moves back to the holding queue. Use when the content doesn't fit the week."
          />
          <Row
            label="Check accuracy"
            description="Sends a fact-check request to the social media agent. The agent re-verifies all statistics, claims, and time-sensitive data, updates notes with any corrections, and flags anything that has changed for your re-approval."
          />
        </Section>

        {/* ── Visual status ── */}
        <Section title="Visual status (dot)">
          <Row
            dot="" dotColour="#9ca3af"
            label="Visual needed"
            description="No graphic has been generated yet. Use Create Visual to generate one."
          />
          <Row
            dot="" dotColour="#818cf8"
            label="Design ready"
            description="A visual has been created and is attached to the post."
          />
          <Row
            dot="" dotColour="#f97316"
            label="Needs revision"
            description="The current visual has been flagged for changes."
          />
          <Row
            dot="" dotColour="#22c55e"
            label="Visual approved"
            description="Visual is confirmed and ready to accompany the post when it publishes."
          />
        </Section>

        {/* ── Post types ── */}
        <Section title="Post type (badge)">
          <Badge colour="#10b981" label="Market"    description="Data-led market update. Publishes Tuesday 07:30 AEST." />
          <Badge colour="#06b6d4" label="Authority" description="Daniel's opinion or expertise. Publishes Tuesday 07:30 AEST." />
          <Badge colour="#8b5cf6" label="Poll"      description="LinkedIn poll. Publishes Wednesday 07:30 AEST." />
          <Badge colour="#f59e0b" label="Article"   description="Suburb spotlight or long-form feature. Publishes Thursday 07:30 AEST." />
          <Badge colour="#6b7280" label="Post"      description="General post without a specific sub-type." />
        </Section>

      </div>
    </div>
  )
}
