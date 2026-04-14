export default function WorkflowPage() {
  return (
    <div className="space-y-10 pb-16">

      {/* Header */}
      <div>
        <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase mb-2" style={{ color: 'var(--color-gold)' }}>
          System Overview
        </p>
        <h1 className="text-2xl font-serif font-normal" style={{ color: 'var(--color-cream)' }}>
          How Everything Works
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-cream-x)' }}>
          Three agents, one approval loop. Your job is marked in gold.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 flex-wrap">
        {[
          { color: '#c4912a', label: 'Daniel (you)' },
          { color: '#6366f1', label: 'CEO Agent' },
          { color: '#0d9488', label: 'SEO Agent' },
          { color: '#8b5cf6', label: 'Social Agent' },
          { color: '#64748b', label: 'Automated' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-xs font-sans" style={{ color: 'var(--color-cream-dim)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Workflow 1: Proposal Approval ── */}
      <WorkflowSection
        title="1. Proposal Approval"
        subtitle="How new work gets approved before any agent starts"
        steps={[
          { actor: 'ceo',    icon: '💡', label: 'CEO generates idea', note: 'Runs weekly. Checks agents have work before creating proposals.' },
          { actor: 'ceo',    icon: '📋', label: 'Proposal created', note: 'Appears in Projects tab with estimated tokens and agent.' },
          { actor: 'daniel', icon: '👁', label: 'You review in Projects', note: 'Read the proposal. Approve or dismiss.' },
          { actor: 'daniel', icon: '✅', label: 'You approve', note: 'Click Approve. CEO picks it up next heartbeat.' },
          { actor: 'ceo',    icon: '📌', label: 'Task created + assigned', note: 'CEO creates a task and assigns to SEO or Social agent.' },
          { actor: 'auto',   icon: '▶', label: 'Agent picks it up', note: 'Agent sees it in their inbox and starts on next heartbeat.' },
        ]}
      />

      {/* ── Workflow 2: SEO Article Pipeline ── */}
      <WorkflowSection
        title="2. SEO Article Pipeline"
        subtitle="From approved task to live article — max 4 per week, staged in calendar"
        steps={[
          { actor: 'seo',    icon: '✍', label: 'SEO agent writes article', note: 'Copies template, writes content, sets draft: true (noindex).' },
          { actor: 'seo',    icon: '📅', label: 'Scheduled in calendar', note: 'Assigned a future Mon/Tue/Thu/Fri publish date. Max 4/week. Max 8 in queue.' },
          { actor: 'auto',   icon: '🔒', label: 'Staged on site (noindex)', note: 'URL exists but Google cannot index it. Shown as teal in calendar.' },
          { actor: 'daniel', icon: '👁', label: 'You see it in calendar', note: 'Review upcoming articles any time. Request changes if needed.' },
          { actor: 'auto',   icon: '📆', label: 'Publish date arrives', note: 'SEO agent checks daily. Removes draft flag on the scheduled date.' },
          { actor: 'seo',    icon: '🚀', label: 'Article goes live', note: 'Draft removed. Added to insights index. Google can now index it. Shown as dark green.' },
        ]}
      />

      {/* ── Workflow 3: Social Media Pipeline ── */}
      <WorkflowSection
        title="3. Social Media Pipeline"
        subtitle="Three LinkedIn posts per week — you approve Monday, post manually Tue/Wed/Thu"
        steps={[
          { actor: 'social', icon: '🔍', label: 'Sunday: agent researches', note: 'Searches for Brisbane property news, picks poll from library, picks an insights article to feature.' },
          { actor: 'social', icon: '✍',  label: 'Writes 3 posts', note: 'Tue: Market/Authority. Wed: Poll. Thu: Article Feature linking to danielgierach.com/insights.' },
          { actor: 'social', icon: '📤', label: 'Staged by Sunday 17:00', note: 'All 3 committed to dashboard marked Ready for Review.' },
          { actor: 'daniel', icon: '☀',  label: 'Monday morning review', note: 'Open Social tab. Read all 3 posts. Approve or leave a one-line amendment note.' },
          { actor: 'daniel', icon: '📲', label: 'You post manually', note: 'Copy caption into LinkedIn. Attach Canva PNG. Schedule for Tue/Wed/Thu 07:30.' },
          { actor: 'social', icon: '🔄', label: 'Amendments picked up next run', note: 'If you left a note, agent revises and resubmits for next Monday review.' },
        ]}
      />

      {/* ── Workflow 4: Fact-check + Quality ── */}
      <WorkflowSection
        title="4. Quality Control"
        subtitle="How errors get flagged and fixed"
        steps={[
          { actor: 'daniel', icon: '🚩', label: 'You spot an issue', note: 'Wrong stat, outdated legislation, inaccurate FAQ.' },
          { actor: 'daniel', icon: '💬', label: 'Flag in dashboard or chat', note: 'Tell Claude Code directly. An issue is created for the SEO agent.' },
          { actor: 'seo',    icon: '🔎', label: 'SEO agent verifies', note: 'Searches current legislation, CoreLogic, Domain for accurate data.' },
          { actor: 'seo',    icon: '✏',  label: 'Corrects the article', note: 'Targeted edit only. Commits and pushes immediately.' },
          { actor: 'auto',   icon: '🚀', label: 'Live within minutes', note: 'Vercel redeploys automatically on push.' },
        ]}
      />

      {/* ── Schedule Summary ── */}
      <div>
        <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase mb-4" style={{ color: 'var(--color-gold)' }}>
          Weekly Schedule at a Glance
        </p>
        <div className="grid grid-cols-7 gap-2">
          {[
            { day: 'MON', items: [
              { color: '#c4912a', text: 'Review social posts (10 min)' },
              { color: '#c4912a', text: 'Post approved content to LinkedIn' },
              { color: '#0d9488', text: 'SEO article may go live' },
            ]},
            { day: 'TUE', items: [
              { color: '#8b5cf6', text: 'LinkedIn: Market/Authority post' },
              { color: '#0d9488', text: 'SEO article may go live' },
            ]},
            { day: 'WED', items: [
              { color: '#8b5cf6', text: 'LinkedIn: Poll' },
            ]},
            { day: 'THU', items: [
              { color: '#8b5cf6', text: 'LinkedIn: Article Feature' },
              { color: '#0d9488', text: 'SEO article may go live' },
            ]},
            { day: 'FRI', items: [
              { color: '#0d9488', text: 'SEO article may go live' },
            ]},
            { day: 'SAT', items: [] },
            { day: 'SUN', items: [
              { color: '#8b5cf6', text: 'Social agent writes next week\'s 3 posts (by 17:00)' },
              { color: '#6366f1', text: 'CEO reviews agent queues' },
            ]},
          ].map(({ day, items }) => (
            <div key={day} className="rounded-xl p-3 min-h-[120px]" style={{ background: 'var(--color-card)' }}>
              <p className="text-[10px] font-sans font-bold tracking-widest mb-2" style={{ color: 'var(--color-cream-x)' }}>{day}</p>
              <div className="space-y-1.5">
                {items.length === 0 && (
                  <p className="text-[10px]" style={{ color: 'var(--color-cream-x)', opacity: 0.4 }}>No scheduled output</p>
                )}
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-[10px] font-sans leading-tight" style={{ color: 'var(--color-cream-dim)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Key Rules ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RuleCard
          title="SEO Caps"
          color="#0d9488"
          rules={[
            'Max 4 new articles staged per week',
            'Max 1 article published per day',
            'Max 8 articles in the staged queue',
            'Publish days: Mon, Tue, Thu, Fri only',
            'Draft:true = noindex. Google cannot see it',
          ]}
        />
        <RuleCard
          title="Social Caps"
          color="#8b5cf6"
          rules={[
            '3 posts per week, no more',
            'Tuesday: Market/Authority post',
            'Wednesday: Poll',
            'Thursday: Article Feature',
            'All staged by Sunday 17:00 for Monday review',
          ]}
        />
        <RuleCard
          title="Your Actions"
          color="#c4912a"
          rules={[
            'Approve/dismiss proposals in Projects tab',
            'Review social posts Monday morning',
            'Post to LinkedIn manually (Tue/Wed/Thu)',
            'Flag any errors here or in Claude Code',
            'Calendar = source of truth for what\'s live',
          ]}
        />
      </div>

    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

type Actor = 'daniel' | 'ceo' | 'seo' | 'social' | 'auto'

const ACTOR_COLOUR: Record<Actor, string> = {
  daniel: '#c4912a',
  ceo:    '#6366f1',
  seo:    '#0d9488',
  social: '#8b5cf6',
  auto:   '#64748b',
}

const ACTOR_LABEL: Record<Actor, string> = {
  daniel: 'You',
  ceo:    'CEO Agent',
  seo:    'SEO Agent',
  social: 'Social Agent',
  auto:   'Automated',
}

function WorkflowSection({ title, subtitle, steps }: {
  title: string
  subtitle: string
  steps: { actor: Actor; icon: string; label: string; note: string }[]
}) {
  return (
    <div>
      <p className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase mb-1" style={{ color: 'var(--color-gold)' }}>
        {title}
      </p>
      <p className="text-xs mb-5" style={{ color: 'var(--color-cream-x)' }}>{subtitle}</p>

      <div className="flex items-start gap-0 flex-wrap">
        {steps.map((step, i) => {
          const color = ACTOR_COLOUR[step.actor]
          const label = ACTOR_LABEL[step.actor]
          const isLast = i === steps.length - 1
          return (
            <div key={i} className="flex items-start">
              {/* Step card */}
              <div className="w-40 rounded-xl p-3.5" style={{ background: 'var(--color-card)', border: `1px solid ${color}30` }}>
                {/* Actor badge */}
                <span
                  className="inline-block text-[9px] font-sans font-bold tracking-wider uppercase rounded-full px-2 py-0.5 mb-2"
                  style={{ background: `${color}18`, color }}
                >
                  {label}
                </span>
                {/* Icon + label */}
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-base leading-none flex-shrink-0">{step.icon}</span>
                  <span className="text-[12px] font-sans font-semibold leading-tight" style={{ color: 'var(--color-cream)' }}>
                    {step.label}
                  </span>
                </div>
                {/* Note */}
                <p className="text-[10px] font-sans leading-relaxed" style={{ color: 'var(--color-cream-x)' }}>
                  {step.note}
                </p>
              </div>

              {/* Arrow */}
              {!isLast && (
                <div className="flex items-center self-center px-1 flex-shrink-0" style={{ marginTop: '-8px' }}>
                  <div className="w-5 h-px" style={{ background: 'var(--color-border-w)' }} />
                  <div
                    className="w-0 h-0"
                    style={{
                      borderTop: '4px solid transparent',
                      borderBottom: '4px solid transparent',
                      borderLeft: '6px solid var(--color-border-w)',
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RuleCard({ title, color, rules }: { title: string; color: string; rules: string[] }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--color-card)', border: `1px solid ${color}25` }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <p className="text-[11px] font-sans font-bold tracking-wider uppercase" style={{ color }}>{title}</p>
      </div>
      <ul className="space-y-1.5">
        {rules.map((rule, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] font-sans" style={{ color: 'var(--color-cream-dim)' }}>
            <span className="flex-shrink-0 mt-1" style={{ color }}>›</span>
            {rule}
          </li>
        ))}
      </ul>
    </div>
  )
}
