'use client'

import { useMemo, useState } from 'react'

const currency = (n: number) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(Math.round(n))

const compactCurrency = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}k`
  return currency(n)
}

function SectionHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <h2 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[var(--color-cream-dim)] whitespace-nowrap">
          {label}
        </h2>
        <div className="flex-1 border-t border-[var(--color-border-w)]" />
      </div>
      {sub && <p className="text-[12px] text-[var(--color-cream-dim)] mt-1.5 leading-snug">{sub}</p>}
    </div>
  )
}

function PartHeader({ tag, title, blurb }: { tag: string; title: string; blurb: string }) {
  return (
    <div className="border-l-2 border-[var(--color-gold)] pl-4 py-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)] mb-1">{tag}</p>
      <h2 className="font-serif text-2xl text-[var(--color-cream)] mb-1">{title}</h2>
      <p className="text-sm text-[var(--color-cream-dim)] leading-relaxed">{blurb}</p>
    </div>
  )
}

function Field({
  label,
  suffix,
  value,
  onChange,
  step,
  hint,
}: {
  label: string
  suffix: string
  value: number
  onChange: (n: number) => void
  step: number
  hint?: string
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] mb-1.5">
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-md py-2.5 pl-3 pr-12 text-[var(--color-cream)] font-mono text-base focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold-dim)]"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-cream-dim)] font-mono">
          {suffix}
        </span>
      </div>
      {hint && <p className="text-[11px] text-[var(--color-cream-x)] mt-1.5 leading-snug">{hint}</p>}
    </label>
  )
}

function MoneyField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  hint?: string
}) {
  const formatted = value > 0 ? value.toLocaleString('en-AU') : ''
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] mb-1.5">
        {label}
      </span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-[var(--color-cream-dim)] font-mono pointer-events-none">
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={formatted}
          placeholder="0"
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, '')
            onChange(raw ? Number(raw) : 0)
          }}
          className="w-full bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-md py-2.5 pl-7 pr-3 text-[var(--color-cream)] font-mono text-base focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold-dim)]"
        />
      </div>
      {hint && <p className="text-[11px] text-[var(--color-cream-x)] mt-1.5 leading-snug">{hint}</p>}
    </label>
  )
}

function Slider({
  min,
  max,
  step,
  value,
  onChange,
  ticks,
  label,
}: {
  min: number
  max: number
  step: number
  value: number
  onChange: (n: number) => void
  ticks: string[]
  label?: string
}) {
  return (
    <div className="mt-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-gold)] cursor-pointer"
        aria-label={label}
      />
      <div className="flex justify-between text-[10px] font-mono text-[var(--color-cream-x)] mt-1 px-0.5">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  accent,
  big,
  dim,
}: {
  label: string
  value: string
  accent?: boolean
  big?: boolean
  dim?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 border-b border-[var(--color-border-w)] last:border-b-0">
      <span
        className={[
          big ? 'text-base font-semibold' : 'text-sm',
          dim ? 'text-[var(--color-cream-dim)]' : 'text-[var(--color-cream)]',
        ].join(' ')}
      >
        {label}
      </span>
      <span
        className={[
          'font-mono tabular-nums',
          big ? 'text-2xl font-semibold' : 'text-base',
          accent ? 'text-[var(--color-gold)]' : 'text-[var(--color-cream)]',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  )
}

function AgentCard({
  who,
  pct,
  takeHome,
  perMonth,
  perDeal,
  highlight,
}: {
  who: string
  pct: number
  takeHome: number
  perMonth?: number
  perDeal?: number
  highlight?: boolean
}) {
  return (
    <div
      className={[
        'rounded-lg p-5 border',
        highlight
          ? 'bg-[var(--color-card)] border-[var(--color-gold)]'
          : 'bg-[var(--color-card)] border-[var(--color-border-w)]',
      ].join(' ')}
    >
      <div className="flex items-baseline justify-between mb-3">
        <p
          className={[
            'text-[10px] font-semibold uppercase tracking-[0.14em]',
            highlight ? 'text-[var(--color-gold)]' : 'text-[var(--color-cream-dim)]',
          ].join(' ')}
        >
          {who}
        </p>
        <span className="font-mono tabular-nums text-xs text-[var(--color-cream-dim)]">{pct}% of net</span>
      </div>
      <p
        className={[
          'font-mono tabular-nums text-3xl font-semibold mb-1',
          highlight ? 'text-[var(--color-gold)]' : 'text-[var(--color-cream)]',
        ].join(' ')}
      >
        {currency(takeHome)}
      </p>
      {(perMonth !== undefined || perDeal !== undefined) && (
        <div className="border-t border-[var(--color-border-w)] mt-3 pt-3 flex justify-between gap-4 text-[11px]">
          {perMonth !== undefined && (
            <div>
              <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">/ month</p>
              <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                {currency(perMonth)}
              </p>
            </div>
          )}
          {perDeal !== undefined && (
            <div>
              <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">/ deal avg</p>
              <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                {currency(perDeal)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CommissionPage() {
  // ── Shared ──────────────────────────────────────────────────────────
  const [agencySplit, setAgencySplit] = useState(50)

  // ── Annual plan ─────────────────────────────────────────────────────
  const [avgSalePrice, setAvgSalePrice] = useState(1_500_000)
  const [avgCommission, setAvgCommission] = useState(2.5)
  const [dealsPerYear, setDealsPerYear] = useState(12)
  const [planYourShare, setPlanYourShare] = useState(50)
  const [incomeTarget, setIncomeTarget] = useState(0)

  // ── Single deal ─────────────────────────────────────────────────────
  const [dealSalePrice, setDealSalePrice] = useState(1_500_000)
  const [dealCommission, setDealCommission] = useState(2.5)
  const [dealYourShare, setDealYourShare] = useState(50)

  // ── Annual math ─────────────────────────────────────────────────────
  const plan = useMemo(() => {
    const volume = avgSalePrice * dealsPerYear
    const gci = volume * (avgCommission / 100)
    const agencyCut = gci * (agencySplit / 100)
    const netAgents = gci - agencyCut
    const yourTake = netAgents * (planYourShare / 100)
    const partnerTake = netAgents - yourTake
    const yourPerMonth = yourTake / 12
    const partnerPerMonth = partnerTake / 12
    const yourPerDeal = dealsPerYear > 0 ? yourTake / dealsPerYear : 0
    const partnerPerDeal = dealsPerYear > 0 ? partnerTake / dealsPerYear : 0
    const dealsPerMonth = dealsPerYear / 12

    const perDealYourTakeAtAvg =
      avgSalePrice * (avgCommission / 100) * ((100 - agencySplit) / 100) * (planYourShare / 100)
    const requiredDeals =
      incomeTarget > 0 && perDealYourTakeAtAvg > 0 ? incomeTarget / perDealYourTakeAtAvg : 0
    const gap = incomeTarget > 0 ? yourTake - incomeTarget : 0
    const onTrack = incomeTarget > 0 && gap >= 0

    // Levers to hit target
    const requiredAvgSale =
      incomeTarget > 0 && dealsPerYear > 0 && avgCommission > 0
        ? incomeTarget /
          (dealsPerYear *
            (avgCommission / 100) *
            ((100 - agencySplit) / 100) *
            (planYourShare / 100))
        : 0
    const requiredAvgCommission =
      incomeTarget > 0 && dealsPerYear > 0 && avgSalePrice > 0
        ? (incomeTarget /
            (dealsPerYear *
              avgSalePrice *
              ((100 - agencySplit) / 100) *
              (planYourShare / 100))) *
          100
        : 0

    return {
      volume,
      gci,
      agencyCut,
      netAgents,
      yourTake,
      partnerTake,
      yourPerMonth,
      partnerPerMonth,
      yourPerDeal,
      partnerPerDeal,
      dealsPerMonth,
      requiredDeals,
      requiredAvgSale,
      requiredAvgCommission,
      gap,
      onTrack,
    }
  }, [avgSalePrice, avgCommission, dealsPerYear, agencySplit, planYourShare, incomeTarget])

  // ── Single deal math ────────────────────────────────────────────────
  const deal = useMemo(() => {
    const gross = dealSalePrice * (dealCommission / 100)
    const agencyCut = gross * (agencySplit / 100)
    const netAgents = gross - agencyCut
    const yourTake = netAgents * (dealYourShare / 100)
    const partnerTake = netAgents - yourTake
    return { gross, agencyCut, netAgents, yourTake, partnerTake }
  }, [dealSalePrice, dealCommission, agencySplit, dealYourShare])

  // ── Split sensitivity (50/50 → 80/20) ───────────────────────────────
  const sensitivity = useMemo(
    () =>
      [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80].map((yourPct) => {
        const you = deal.netAgents * (yourPct / 100)
        const partner = deal.netAgents - you
        return { yourPct, partnerPct: 100 - yourPct, you, partner, diff: you - partner }
      }),
    [deal.netAgents],
  )

  // ── "Every deal this year at this split" projection ─────────────────
  const projected = useMemo(() => {
    const perDealYou = deal.netAgents * (dealYourShare / 100)
    const perDealPartner = deal.netAgents - perDealYou
    const yourAnnual = perDealYou * dealsPerYear
    const partnerAnnual = perDealPartner * dealsPerYear
    const deltaVsDefault = yourAnnual - plan.netAgents * (planYourShare / 100)
    return { yourAnnual, partnerAnnual, deltaVsDefault }
  }, [deal.netAgents, dealYourShare, dealsPerYear, plan.netAgents, planYourShare])

  // Highlight nearest 5% bucket in sensitivity table
  const highlightedSplit = Math.round(dealYourShare / 5) * 5

  return (
    <div className="flex flex-col gap-10 max-w-7xl">
      <header className="flex flex-col gap-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-gold)] mb-2">
            Ray White Bulimba · Two-agent partnership
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--color-cream)] mb-2">
            Team Commission Planner
          </h1>
          <p className="text-sm text-[var(--color-cream-dim)] leading-relaxed max-w-3xl">
            A two-part model for Dan Gierach and Connie. <span className="text-[var(--color-cream)] font-medium">Part 1</span>{' '}
            sets a yearly plan: how many homes you list together, at what average price and commission, and
            what each of you takes home.{' '}
            <span className="text-[var(--color-cream)] font-medium">Part 2</span> stress-tests the per-property
            split: what changes if a given deal is 50/50 vs 60/40 vs 70/30. All figures are{' '}
            <span className="text-[var(--color-cream)] font-medium">AUD, exclusive of GST</span>. Inputs are
            live; nothing is saved.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] border-t border-[var(--color-border-w)] pt-4">
          <span className="text-[var(--color-cream-dim)]">
            <span className="font-semibold text-[var(--color-cream)]">GCI</span> = gross commission income
            (pre-office cut)
          </span>
          <span className="text-[var(--color-cream-dim)]">
            <span className="font-semibold text-[var(--color-cream)]">Net to agents</span> = GCI minus the
            office cut
          </span>
          <span className="text-[var(--color-cream-dim)]">
            <span className="font-semibold text-[var(--color-cream)]">Take-home</span> = each agent's share of
            net
          </span>
        </div>
      </header>

      {/* ─── Shared setting (toolbar) ───────────────────────────── */}
      <section>
        <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
              Shared setting · Office cut
            </p>
            <p className="text-sm text-[var(--color-cream-dim)] leading-snug">
              Ray White Bulimba's share off the top of every deal. Applied to both the plan and the single-deal
              modeller.
            </p>
          </div>
          <div className="sm:w-48 shrink-0">
            <Field
              label="Agency split"
              suffix="%"
              value={agencySplit}
              onChange={setAgencySplit}
              step={1}
            />
          </div>
        </div>
      </section>

      {/* ─── PART 1 — THE YEAR ────────────────────────────────────── */}
      <PartHeader
        tag="Part 1"
        title="The year"
        blurb="Set average sale price, average commission, and how many deals you plan to settle together. The plan shows the team's GCI and what each of you takes home — at whatever default split you've agreed for the year."
      />

      <div className="grid lg:grid-cols-[minmax(420px,460px)_minmax(0,1fr)] gap-10 items-start">
        <div className="lg:sticky lg:top-6 flex flex-col gap-6">
      <section>
        <SectionHeader label="Annual assumptions" />
        <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5 flex flex-col gap-6">
          <div>
            <MoneyField label="Average sale price" value={avgSalePrice} onChange={setAvgSalePrice} />
            <Slider
              min={500_000}
              max={2_500_000}
              step={25_000}
              value={avgSalePrice}
              onChange={setAvgSalePrice}
              ticks={['$500k', '$1M', '$1.5M', '$2M', '$2.5M']}
              label="Average sale price"
            />
          </div>
          <div>
            <Field
              label="Average commission"
              suffix="%"
              value={avgCommission}
              onChange={setAvgCommission}
              step={0.05}
              hint="The blended rate you expect across the year."
            />
            <Slider
              min={1}
              max={4}
              step={0.05}
              value={avgCommission}
              onChange={setAvgCommission}
              ticks={['1%', '2%', '3%', '4%']}
              label="Average commission"
            />
          </div>
          <div>
            <Field
              label="Number of sales"
              suffix="/yr"
              value={dealsPerYear}
              onChange={setDealsPerYear}
              step={1}
              hint="Total deals settled together this year."
            />
            <Slider
              min={1}
              max={100}
              step={1}
              value={dealsPerYear}
              onChange={setDealsPerYear}
              ticks={['1', '25', '50', '75', '100']}
              label="Deals per year"
            />
          </div>
          <div>
            <Field
              label={`Default split — Dan ${planYourShare}% / Connie ${100 - planYourShare}%`}
              suffix="%"
              value={planYourShare}
              onChange={setPlanYourShare}
              step={1}
              hint="Dan's share of the net agent pool. The yearly headline assumes every deal uses this."
            />
            <Slider
              min={0}
              max={100}
              step={1}
              value={planYourShare}
              onChange={setPlanYourShare}
              ticks={['0', '25', '50', '75', '100']}
              label="Default split"
            />
          </div>
          <div className="border-t border-[var(--color-border-w)] pt-5">
            <MoneyField
              label="Dan's annual take-home goal (optional)"
              value={incomeTarget}
              onChange={setIncomeTarget}
              hint="Leave blank to plan freely. Set a target to see the gap and the three levers to close it."
            />
          </div>
        </div>
      </section>
        </div>

        <div className="flex flex-col gap-8 min-w-0">
      <section>
        <SectionHeader
          label="Annual take-home"
          sub={`What Dan and Connie each pocket this year at the default ${planYourShare}/${100 - planYourShare} split.`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AgentCard
            who="Dan"
            pct={planYourShare}
            takeHome={plan.yourTake}
            perMonth={plan.yourPerMonth}
            perDeal={plan.yourPerDeal}
            highlight
          />
          <AgentCard
            who="Connie"
            pct={100 - planYourShare}
            takeHome={plan.partnerTake}
            perMonth={plan.partnerPerMonth}
            perDeal={plan.partnerPerDeal}
          />
        </div>
      </section>

      <section>
        <SectionHeader label="Team metrics" sub={`${plan.dealsPerMonth.toFixed(1)} deals per month · ${(dealsPerYear / 52).toFixed(2)} per week.`} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
              Sales volume
            </p>
            <p className="font-mono tabular-nums text-2xl font-semibold text-[var(--color-cream)]">
              {compactCurrency(plan.volume)}
            </p>
            <p className="text-[11px] text-[var(--color-cream-x)] mt-1.5">
              {dealsPerYear} × {compactCurrency(avgSalePrice)}
            </p>
          </div>
          <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
              Team GCI
            </p>
            <p className="font-mono tabular-nums text-2xl font-semibold text-[var(--color-cream)]">
              {currency(plan.gci)}
            </p>
            <p className="text-[11px] text-[var(--color-cream-x)] mt-1.5">{avgCommission}% of volume</p>
          </div>
          <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
              Net to agents
            </p>
            <p className="font-mono tabular-nums text-2xl font-semibold text-[var(--color-cream)]">
              {currency(plan.netAgents)}
            </p>
            <p className="text-[11px] text-[var(--color-cream-x)] mt-1.5">After {agencySplit}% office cut</p>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader label="Full breakdown" />
        <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5">
          <Row label="Total sales volume" value={currency(plan.volume)} />
          <Row label={`Gross commission (${avgCommission}% of volume)`} value={currency(plan.gci)} />
          <Row label={`Less: agency split (${agencySplit}%)`} value={`− ${currency(plan.agencyCut)}`} dim />
          <Row label="Net to agents (annual)" value={currency(plan.netAgents)} big />
        </div>
      </section>

      {incomeTarget > 0 && (
        <section>
          <SectionHeader label="Goal status" />
          <div
            className={[
              'rounded-lg p-5 border',
              plan.onTrack
                ? 'bg-[var(--color-card)] border-[var(--color-success)]'
                : 'bg-[var(--color-card)] border-[var(--color-border-w)]',
            ].join(' ')}
          >
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <div>
                <p
                  className={[
                    'text-[10px] font-semibold uppercase tracking-[0.14em] mb-0.5',
                    plan.onTrack ? 'text-[var(--color-success)]' : 'text-[var(--color-cream-dim)]',
                  ].join(' ')}
                >
                  {plan.onTrack ? 'On track' : 'Shortfall'}
                </p>
                <p className="text-sm text-[var(--color-cream)]">
                  Plan delivers <span className="font-mono font-semibold">{currency(plan.yourTake)}</span> for
                  Dan vs goal of <span className="font-mono font-semibold">{currency(incomeTarget)}</span>
                </p>
              </div>
              <span
                className={[
                  'font-mono tabular-nums text-xl font-semibold',
                  plan.onTrack ? 'text-[var(--color-success)]' : 'text-[var(--color-cream)]',
                ].join(' ')}
              >
                {plan.gap >= 0 ? '+' : '−'}
                {currency(Math.abs(plan.gap))}
              </span>
            </div>
            <div className="border-t border-[var(--color-border-w)] pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
                  Deals needed at this avg
                </p>
                <p className="font-mono tabular-nums text-lg font-semibold text-[var(--color-cream)]">
                  {plan.requiredDeals > 0 ? plan.requiredDeals.toFixed(1) : '—'}
                </p>
                <p className="text-[11px] text-[var(--color-cream-x)] mt-0.5">
                  ≈ {(plan.requiredDeals / 12).toFixed(1)} per month
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
                  Or lift avg sale to
                </p>
                <p className="font-mono tabular-nums text-lg font-semibold text-[var(--color-cream)]">
                  {plan.requiredAvgSale > 0 ? currency(plan.requiredAvgSale) : '—'}
                </p>
                <p className="text-[11px] text-[var(--color-cream-x)] mt-0.5">
                  at {dealsPerYear} deals, {avgCommission}%
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
                  Or lift avg commission to
                </p>
                <p className="font-mono tabular-nums text-lg font-semibold text-[var(--color-cream)]">
                  {plan.requiredAvgCommission > 0 ? `${plan.requiredAvgCommission.toFixed(2)}%` : '—'}
                </p>
                <p className="text-[11px] text-[var(--color-cream-x)] mt-0.5">
                  at {dealsPerYear} deals, {compactCurrency(avgSalePrice)} avg
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
        </div>
      </div>

      {/* ─── PART 2 — A SINGLE PROPERTY ──────────────────────────── */}
      <PartHeader
        tag="Part 2"
        title="One property"
        blurb="Pick a specific listing. Drag the split slider to see what Dan and Connie each take home at 50/50, 60/40, 70/30 or anywhere in between. Helps decide a fair per-property split based on who sourced, who pitched, who'll run the campaign."
      />

      <div className="grid lg:grid-cols-[minmax(420px,460px)_minmax(0,1fr)] gap-10 items-start">
        <div className="lg:sticky lg:top-6 flex flex-col gap-6">
      <section>
        <SectionHeader label="Deal inputs" />
        <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5 flex flex-col gap-6">
          <div>
            <MoneyField label="Sale price" value={dealSalePrice} onChange={setDealSalePrice} />
            <Slider
              min={500_000}
              max={2_500_000}
              step={25_000}
              value={dealSalePrice}
              onChange={setDealSalePrice}
              ticks={['$500k', '$1M', '$1.5M', '$2M', '$2.5M']}
              label="Sale price"
            />
          </div>
          <div>
            <Field
              label="Commission rate"
              suffix="%"
              value={dealCommission}
              onChange={setDealCommission}
              step={0.05}
              hint="The rate agreed with this vendor."
            />
            <Slider
              min={1}
              max={4}
              step={0.05}
              value={dealCommission}
              onChange={setDealCommission}
              ticks={['1%', '2%', '3%', '4%']}
              label="Commission rate"
            />
          </div>
          <div className="border-t border-[var(--color-border-w)] pt-5">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)]">
                Split for this property
              </span>
              <span className="font-mono tabular-nums text-sm text-[var(--color-cream)]">
                Dan {dealYourShare}% / Connie {100 - dealYourShare}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={dealYourShare}
              onChange={setDealYourShare}
              ticks={['0', '20', '40', '50', '60', '80', '100']}
              label="Dan's share"
            />
            <p className="text-[11px] text-[var(--color-cream-x)] mt-2 leading-snug">
              Drag to model the split. The sensitivity table below highlights the closest 5% bucket.
            </p>
          </div>
        </div>
      </section>
        </div>

        <div className="flex flex-col gap-8 min-w-0">
      <section>
        <SectionHeader label="Take-home from this deal" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AgentCard who="Dan" pct={dealYourShare} takeHome={deal.yourTake} highlight />
          <AgentCard who="Connie" pct={100 - dealYourShare} takeHome={deal.partnerTake} />
        </div>
        <div className="mt-4 bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5">
          <Row label={`Gross commission (${dealCommission}% of sale)`} value={currency(deal.gross)} />
          <Row label={`Less: agency split (${agencySplit}%)`} value={`− ${currency(deal.agencyCut)}`} dim />
          <Row label="Net to agents" value={currency(deal.netAgents)} />
          <Row label={`Dan's share (${dealYourShare}% of net)`} value={currency(deal.yourTake)} accent big />
          <Row label={`Connie's share (${100 - dealYourShare}% of net)`} value={currency(deal.partnerTake)} />
        </div>
      </section>

      <section>
        <SectionHeader
          label="Split sensitivity"
          sub={`Each row shows what Dan and Connie take home from this property at a different split — plus what that same split projects to annually if all ${dealsPerYear} planned deals used it.`}
        />
        {deal.netAgents <= 0 ? (
          <div className="bg-[var(--color-card)] border border-dashed border-[var(--color-border-w)] rounded-lg p-8 text-center">
            <p className="text-sm text-[var(--color-cream-dim)] leading-relaxed">
              Enter a sale price and commission rate above to see how different splits affect Dan and Connie's
              take-home.
            </p>
          </div>
        ) : (
          <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-w)] bg-[var(--color-card-2)]">
                  <th rowSpan={2} className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3 align-bottom">
                    Split
                  </th>
                  <th colSpan={2} className="text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 pt-3 pb-1 border-b border-[var(--color-border-w)]">
                    This property
                  </th>
                  <th colSpan={2} className="text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 pt-3 pb-1 border-b border-[var(--color-border-w)]">
                    Projected annual ({dealsPerYear} deals)
                  </th>
                  <th rowSpan={2} className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3 align-bottom">
                    Δ per deal
                  </th>
                </tr>
                <tr className="border-b border-[var(--color-border-w)] bg-[var(--color-card-2)]">
                  <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 pb-2">
                    Dan
                  </th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 pb-2">
                    Connie
                  </th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 pb-2">
                    Dan
                  </th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 pb-2">
                    Connie
                  </th>
                </tr>
              </thead>
              <tbody>
                {sensitivity.map((s) => {
                  const isCurrent = s.yourPct === highlightedSplit
                  return (
                    <tr
                      key={s.yourPct}
                      onClick={() => setDealYourShare(s.yourPct)}
                      className={[
                        'border-b border-[var(--color-border-w)] last:border-b-0 cursor-pointer transition-colors',
                        isCurrent ? 'bg-[var(--color-gold-dim)]' : 'hover:bg-[var(--color-card-2)]',
                      ].join(' ')}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={[
                            'font-mono text-sm',
                            isCurrent ? 'text-[var(--color-gold)] font-semibold' : 'text-[var(--color-cream)]',
                          ].join(' ')}
                        >
                          {s.yourPct} / {s.partnerPct}
                        </span>
                      </td>
                      <td className="text-right px-4 py-3 font-mono tabular-nums text-[var(--color-cream)]">
                        {currency(s.you)}
                      </td>
                      <td className="text-right px-4 py-3 font-mono tabular-nums text-[var(--color-cream)]">
                        {currency(s.partner)}
                      </td>
                      <td
                        className={[
                          'text-right px-4 py-3 font-mono tabular-nums border-l border-[var(--color-border-w)]',
                          isCurrent ? 'text-[var(--color-gold)] font-semibold' : 'text-[var(--color-cream-dim)]',
                        ].join(' ')}
                      >
                        {currency(s.you * dealsPerYear)}
                      </td>
                      <td className={[
                        'text-right px-4 py-3 font-mono tabular-nums',
                        isCurrent ? 'text-[var(--color-cream)] font-semibold' : 'text-[var(--color-cream-dim)]',
                      ].join(' ')}>
                        {currency(s.partner * dealsPerYear)}
                      </td>
                      <td className="text-right px-4 py-3 font-mono tabular-nums text-[var(--color-cream-x)] border-l border-[var(--color-border-w)]">
                        {currency(Math.abs(s.diff))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="text-[11px] text-[var(--color-cream-x)] mt-2 leading-relaxed space-y-1">
          <p>
            <span className="font-semibold text-[var(--color-cream-dim)]">How to read this:</span> the
            combined take-home for both agents is constant ({currency(deal.netAgents)} per deal · {currency(deal.netAgents * dealsPerYear)}/yr at {dealsPerYear} deals) — only the split between Dan and Connie changes.
          </p>
          <p>
            <span className="font-semibold text-[var(--color-cream-dim)]">Tip:</span> click any row to set the
            split for the deal modeller above.
          </p>
        </div>
      </section>

      <section>
        <SectionHeader
          label="If every deal this year used this split"
          sub={`Projecting Part 2's ${dealYourShare}/${100 - dealYourShare} split across Part 1's ${dealsPerYear} deals.`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AgentCard who="Dan — projected annual" pct={dealYourShare} takeHome={projected.yourAnnual} highlight />
          <AgentCard
            who="Connie — projected annual"
            pct={100 - dealYourShare}
            takeHome={projected.partnerAnnual}
          />
        </div>
        {Math.abs(projected.deltaVsDefault) > 1 && (
          <p className="text-[12px] text-[var(--color-cream-dim)] mt-3 leading-relaxed">
            That's{' '}
            <span
              className={[
                'font-mono font-semibold',
                projected.deltaVsDefault >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-cream)]',
              ].join(' ')}
            >
              {projected.deltaVsDefault >= 0 ? '+' : '−'}
              {currency(Math.abs(projected.deltaVsDefault))}
            </span>{' '}
            for Dan vs the default {planYourShare}/{100 - planYourShare} plan above.
          </p>
        )}
      </section>
        </div>
      </div>

      <p className="text-[11px] text-[var(--color-cream-x)] leading-relaxed">
        Estimates only. Excludes GST, marketing rebates, referral fees, mentor splits, and any deal-specific
        bonuses. Numbers are for planning, not invoices.
      </p>
    </div>
  )
}
