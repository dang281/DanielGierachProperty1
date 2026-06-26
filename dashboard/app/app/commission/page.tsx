'use client'

import { useMemo, useState } from 'react'

const BONUS_TIER_GCI = 300_000
const BONUS_PER_TIER = 17_500

// Ray White franchise fixtures — fixed across all deals.
const CORP_CUT_PCT = 9 // Ray White Corporate's cut off the top of GCI
const SUPER_RATE_PCT = 12 // Statutory super (Australia, FY26) on agent cash

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
  superAmount,
  perMonth,
  highlight,
}: {
  who: string
  pct: number
  takeHome: number
  superAmount?: number
  perMonth?: number
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
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-cream-x)] mb-0.5">
        Pre-tax cash
      </p>
      <p
        className={[
          'font-mono tabular-nums text-3xl font-semibold mb-1',
          highlight ? 'text-[var(--color-gold)]' : 'text-[var(--color-cream)]',
        ].join(' ')}
      >
        {currency(takeHome)}
      </p>
      {superAmount !== undefined && superAmount > 0 && (
        <p className="text-[11px] text-[var(--color-cream-x)] font-mono tabular-nums">
          + {currency(superAmount)} super
        </p>
      )}
      {perMonth !== undefined && (
        <div className="border-t border-[var(--color-border-w)] mt-3 pt-3 flex justify-between gap-4 text-[11px]">
          <div>
            <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">Pre-tax / month</p>
            <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
              {currency(perMonth)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CommissionPage() {
  // ── Shared deal cascade ────────────────────────────────────────────
  // 100% GCI → fixed 9% to RW Corporate → from the rest, agentShare goes to the
  // agent team (cash, pre-tax) → fixed 12% super on that cash → remainder to RW
  // Bulimba. Corporate cut and super rate are franchise fixtures; only the
  // agent share is a knob the team negotiates each deal.
  const corpCut = CORP_CUT_PCT
  const superRate = SUPER_RATE_PCT
  const [agentShare, setAgentShare] = useState(55)

  // Derived: agent cash as a fraction of GCI (used in income-target maths).
  const agentCashFracOfGci = ((100 - corpCut) / 100) * (agentShare / 100)

  // ── Annual plan ─────────────────────────────────────────────────────
  const [avgSalePrice, setAvgSalePrice] = useState(1_500_000)
  const [avgCommission, setAvgCommission] = useState(2.5)
  const [dealsPerYear, setDealsPerYear] = useState(12)
  const [planYourShare, setPlanYourShare] = useState(50)

  // ── Single deal ─────────────────────────────────────────────────────
  const [dealSalePrice, setDealSalePrice] = useState(1_500_000)
  const [dealCommission, setDealCommission] = useState(2.5)
  const [dealYourShare, setDealYourShare] = useState(50)

  // ── Lead-agent forecast (Part 3) ────────────────────────────────────
  const [leadAgentShare, setLeadAgentShare] = useState(20)
  const [danLeadDeals, setDanLeadDeals] = useState(6)
  const [connieLeadDeals, setConnieLeadDeals] = useState(6)

  // ── Annual math ─────────────────────────────────────────────────────
  const plan = useMemo(() => {
    const volume = avgSalePrice * dealsPerYear
    const gci = volume * (avgCommission / 100)

    // Cascade: GCI → Corporate cut → Agent cash + Agent super → Bulimba retention
    const corpAmount = gci * (corpCut / 100)
    const postCorp = gci - corpAmount
    const agentCash = postCorp * (agentShare / 100)
    const agentSuper = agentCash * (superRate / 100)
    const bulimbaRetention = postCorp - agentCash - agentSuper

    // "Net to agents" = agent cash pool that's split between Dan and Connie.
    // Super follows the same Dan/Connie split into each agent's super fund.
    const netAgents = agentCash
    const yourTake = netAgents * (planYourShare / 100)
    const partnerTake = netAgents - yourTake
    const yourSuper = agentSuper * (planYourShare / 100)
    const partnerSuper = agentSuper - yourSuper

    // GCI bonus: $17,500 joint bonus for every $300k in team GCI.
    // Bonus is paid net to agents (skips the cascade — no Corp cut, no super).
    const bonusTiers = Math.floor(gci / BONUS_TIER_GCI)
    const bonusTotal = bonusTiers * BONUS_PER_TIER
    const yourBonus = bonusTotal * (planYourShare / 100)
    const partnerBonus = bonusTotal - yourBonus
    const nextTierAt = (bonusTiers + 1) * BONUS_TIER_GCI
    const gciIntoTier = gci - bonusTiers * BONUS_TIER_GCI
    const gciToNextTier = Math.max(0, nextTierAt - gci)
    const tierProgress = Math.min(1, gciIntoTier / BONUS_TIER_GCI)

    const yourTotal = yourTake + yourBonus
    const partnerTotal = partnerTake + partnerBonus

    const yourPerMonth = yourTake / 12
    const partnerPerMonth = partnerTake / 12
    const yourTotalPerMonth = yourTotal / 12
    const partnerTotalPerMonth = partnerTotal / 12
    const dealsPerMonth = dealsPerYear / 12

    return {
      volume,
      gci,
      corpAmount,
      postCorp,
      agentCash,
      agentSuper,
      bulimbaRetention,
      netAgents,
      yourTake,
      partnerTake,
      yourSuper,
      partnerSuper,
      bonusTiers,
      bonusTotal,
      yourBonus,
      partnerBonus,
      nextTierAt,
      gciToNextTier,
      tierProgress,
      yourTotal,
      partnerTotal,
      yourPerMonth,
      partnerPerMonth,
      yourTotalPerMonth,
      partnerTotalPerMonth,
      dealsPerMonth,
    }
  }, [
    avgSalePrice,
    avgCommission,
    dealsPerYear,
    corpCut,
    agentShare,
    superRate,
    planYourShare,
  ])

  // ── Single deal math ────────────────────────────────────────────────
  const deal = useMemo(() => {
    const gross = dealSalePrice * (dealCommission / 100)
    const corpAmount = gross * (corpCut / 100)
    const postCorp = gross - corpAmount
    const agentCash = postCorp * (agentShare / 100)
    const agentSuper = agentCash * (superRate / 100)
    const bulimbaRetention = postCorp - agentCash - agentSuper
    const netAgents = agentCash
    const yourTake = netAgents * (dealYourShare / 100)
    const partnerTake = netAgents - yourTake
    const yourSuper = agentSuper * (dealYourShare / 100)
    const partnerSuper = agentSuper - yourSuper
    return {
      gross,
      corpAmount,
      postCorp,
      agentCash,
      agentSuper,
      bulimbaRetention,
      netAgents,
      yourTake,
      partnerTake,
      yourSuper,
      partnerSuper,
    }
  }, [dealSalePrice, dealCommission, corpCut, agentShare, superRate, dealYourShare])

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
    const perDealYourSuper = deal.agentSuper * (dealYourShare / 100)
    const perDealPartnerSuper = deal.agentSuper - perDealYourSuper
    const yourAnnual = perDealYou * dealsPerYear
    const partnerAnnual = perDealPartner * dealsPerYear
    const yourAnnualSuper = perDealYourSuper * dealsPerYear
    const partnerAnnualSuper = perDealPartnerSuper * dealsPerYear
    const deltaVsDefault = yourAnnual - plan.netAgents * (planYourShare / 100)
    return {
      yourAnnual,
      partnerAnnual,
      yourAnnualSuper,
      partnerAnnualSuper,
      deltaVsDefault,
    }
  }, [deal.netAgents, deal.agentSuper, dealYourShare, dealsPerYear, plan.netAgents, planYourShare])

  // Highlight nearest 5% bucket in sensitivity table
  const highlightedSplit = Math.round(dealYourShare / 5) * 5

  // ── Lead-agent forecast math ────────────────────────────────────────
  const forecast = useMemo(() => {
    const otherShare = 100 - leadAgentShare
    const grossPerDeal = avgSalePrice * (avgCommission / 100)
    // Net per deal = agent cash after RW Corporate cut and Bulimba retention
    const netPerDeal = grossPerDeal * agentCashFracOfGci
    const superPerDeal = netPerDeal * (superRate / 100)
    const leadCutPerDeal = netPerDeal * (leadAgentShare / 100)
    const otherCutPerDeal = netPerDeal - leadCutPerDeal
    const leadSuperPerDeal = superPerDeal * (leadAgentShare / 100)
    const otherSuperPerDeal = superPerDeal - leadSuperPerDeal

    const totalDeals = danLeadDeals + connieLeadDeals
    const totalGci = totalDeals * grossPerDeal
    const totalNetToAgents = totalDeals * netPerDeal
    const totalSuper = totalDeals * superPerDeal

    const danFromLead = danLeadDeals * leadCutPerDeal
    const danFromSupport = connieLeadDeals * otherCutPerDeal
    const danCommission = danFromLead + danFromSupport
    const danSuper = danLeadDeals * leadSuperPerDeal + connieLeadDeals * otherSuperPerDeal

    const connieFromLead = connieLeadDeals * leadCutPerDeal
    const connieFromSupport = danLeadDeals * otherCutPerDeal
    const connieCommission = connieFromLead + connieFromSupport
    const connieSuper = connieLeadDeals * leadSuperPerDeal + danLeadDeals * otherSuperPerDeal

    // Bonus split 50/50 since it is a joint bonus (no cascade — paid net to agents)
    const bonusTiers = Math.floor(totalGci / BONUS_TIER_GCI)
    const bonusTotal = bonusTiers * BONUS_PER_TIER
    const danBonus = bonusTotal / 2
    const connieBonus = bonusTotal / 2
    const nextTierAt = (bonusTiers + 1) * BONUS_TIER_GCI
    const gciToNext = Math.max(0, nextTierAt - totalGci)

    const danTotal = danCommission + danBonus
    const connieTotal = connieCommission + connieBonus

    return {
      otherShare,
      grossPerDeal,
      netPerDeal,
      superPerDeal,
      leadCutPerDeal,
      otherCutPerDeal,
      leadSuperPerDeal,
      otherSuperPerDeal,
      totalDeals,
      totalGci,
      totalNetToAgents,
      totalSuper,
      danFromLead,
      danFromSupport,
      danCommission,
      danSuper,
      connieFromLead,
      connieFromSupport,
      connieCommission,
      connieSuper,
      bonusTiers,
      bonusTotal,
      danBonus,
      connieBonus,
      nextTierAt,
      gciToNext,
      danTotal,
      connieTotal,
    }
  }, [
    leadAgentShare,
    danLeadDeals,
    connieLeadDeals,
    avgSalePrice,
    avgCommission,
    agentCashFracOfGci,
    superRate,
  ])

  // Scenarios: hold total deals constant, vary Dan's share of leads
  const forecastScenarios = useMemo(() => {
    const total = forecast.totalDeals
    if (total <= 0) return []
    return [0, 0.25, 0.5, 0.75, 1].map((pct) => {
      const danLeads = Math.round(total * pct)
      const connieLeads = total - danLeads
      const dan = danLeads * forecast.leadCutPerDeal + connieLeads * forecast.otherCutPerDeal
      const connie = connieLeads * forecast.leadCutPerDeal + danLeads * forecast.otherCutPerDeal
      const danWithBonus = dan + forecast.danBonus
      const connieWithBonus = connie + forecast.connieBonus
      return { pct, danLeads, connieLeads, dan, connie, danWithBonus, connieWithBonus }
    })
  }, [forecast])

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
            Models the real Ray White cascade: every deal flows{' '}
            <span className="text-[var(--color-cream)] font-medium">100% GCI → Ray White Corporate cut → agent
            cash + super → Ray White Bulimba retention</span>. <span className="text-[var(--color-cream)] font-medium">Part 1</span>{' '}
            sets a yearly plan for Dan and Connie.{' '}
            <span className="text-[var(--color-cream)] font-medium">Part 2</span> stress-tests the per-property
            split (50/50 vs 60/40 vs 70/30). <span className="text-[var(--color-cream)] font-medium">Part 3</span>{' '}
            forecasts year one with a lead/support model. All figures are{' '}
            <span className="text-[var(--color-cream)] font-medium">AUD, exclusive of GST</span>. Inputs are
            live; nothing is saved.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] border-t border-[var(--color-border-w)] pt-4">
          <span className="text-[var(--color-cream-dim)]">
            <span className="font-semibold text-[var(--color-cream)]">GCI</span> = gross commission income
            (pre-cascade)
          </span>
          <span className="text-[var(--color-cream-dim)]">
            <span className="font-semibold text-[var(--color-cream)]">Net to agents</span> = agent cash pool
            after RW Corporate and Bulimba retention
          </span>
          <span className="text-[var(--color-cream-dim)]">
            <span className="font-semibold text-[var(--color-cream)]">Take-home</span> = each agent's cash
            share of net (super shown separately)
          </span>
          <span className="text-[var(--color-cream-dim)]">
            <span className="font-semibold text-[var(--color-gold)]">Bonus</span> = joint $17,500 unlocked for
            every $300,000 of team GCI (paid net, no cascade)
          </span>
        </div>
      </header>

      {/* ─── Shared setting (toolbar) — Deal cascade ──────────────── */}
      <section>
        <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5 flex flex-col gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
              Shared setting · Deal cascade
            </p>
            <p className="text-sm text-[var(--color-cream-dim)] leading-snug">
              Every deal flows through a fixed waterfall.{' '}
              <span className="text-[var(--color-cream)] font-medium">{corpCut}%</span> goes to Ray White
              Corporate off the top of GCI. Of what's left, the agent team takes their share as{' '}
              <span className="text-[var(--color-cream)] font-medium">pre-tax cash</span>, the agency adds
              statutory super (<span className="text-[var(--color-cream)] font-medium">{superRate}%</span>)
              on that cash into the agents' super funds, and Ray White Bulimba retains the remainder. The
              only knob below is the agent share — Corporate cut and super are franchise fixtures.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-4 items-end">
            <Field
              label="Agent share"
              suffix="%"
              value={agentShare}
              onChange={setAgentShare}
              step={1}
              hint="Of post-corporate. Bulimba keeps the rest."
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] bg-[var(--color-card-2)] border border-[var(--color-border-w)] rounded-md p-3">
              <div>
                <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">RW Corporate</p>
                <p className="font-mono tabular-nums text-[var(--color-cream-dim)] text-sm font-semibold">
                  {corpCut}% of GCI
                </p>
              </div>
              <div>
                <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">Agent cash pool</p>
                <p className="font-mono tabular-nums text-[var(--color-gold)] text-sm font-semibold">
                  {(((100 - corpCut) * agentShare) / 100).toFixed(2)}% of GCI
                </p>
              </div>
              <div>
                <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">Agent super</p>
                <p className="font-mono tabular-nums text-[var(--color-cream-dim)] text-sm font-semibold">
                  {(((100 - corpCut) * agentShare * superRate) / 10000).toFixed(2)}% of GCI
                </p>
              </div>
              <div>
                <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">RW Bulimba retains</p>
                <p className="font-mono tabular-nums text-[var(--color-cream-dim)] text-sm font-semibold">
                  {(
                    100 -
                    corpCut -
                    ((100 - corpCut) * agentShare * (1 + superRate / 100)) / 100
                  ).toFixed(2)}
                  % of GCI
                </p>
              </div>
            </div>
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
        </div>
      </section>
        </div>

        <div className="flex flex-col gap-8 min-w-0">
      <section>
        <SectionHeader
          label="Annual pre-tax cash"
          sub={`What Dan and Connie each take pre-tax this year at the default ${planYourShare}/${100 - planYourShare} split. Super is paid separately into each agent's super fund.`}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AgentCard
            who="Dan"
            pct={planYourShare}
            takeHome={plan.yourTake}
            superAmount={plan.yourSuper}
            perMonth={plan.yourPerMonth}
            highlight
          />
          <AgentCard
            who="Connie"
            pct={100 - planYourShare}
            takeHome={plan.partnerTake}
            superAmount={plan.partnerSuper}
            perMonth={plan.partnerPerMonth}
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
            <p className="text-[11px] text-[var(--color-cream-x)] mt-1.5">
              After {corpCut}% RW Corporate + Bulimba retention · plus {currency(plan.agentSuper)} super
            </p>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          label="GCI bonus tiers"
          sub="A joint $17,500 bonus unlocks for every $300,000 in team GCI. Split using the default share above."
        />
        <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
                Tiers unlocked
              </p>
              <p
                className={[
                  'font-mono tabular-nums text-2xl font-semibold',
                  plan.bonusTiers > 0 ? 'text-[var(--color-gold)]' : 'text-[var(--color-cream-dim)]',
                ].join(' ')}
              >
                {plan.bonusTiers}
              </p>
              <p className="text-[11px] text-[var(--color-cream-x)] mt-1.5">
                $17.5k per $300k of GCI
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
                Joint bonus pool
              </p>
              <p
                className={[
                  'font-mono tabular-nums text-2xl font-semibold',
                  plan.bonusTotal > 0 ? 'text-[var(--color-gold)]' : 'text-[var(--color-cream-dim)]',
                ].join(' ')}
              >
                {currency(plan.bonusTotal)}
              </p>
              <p className="text-[11px] text-[var(--color-cream-x)] mt-1.5">
                {plan.bonusTiers} × {currency(BONUS_PER_TIER)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
                Next tier at
              </p>
              <p className="font-mono tabular-nums text-2xl font-semibold text-[var(--color-cream)]">
                {compactCurrency(plan.nextTierAt)}
              </p>
              <p className="text-[11px] text-[var(--color-cream-x)] mt-1.5">
                {currency(plan.gciToNextTier)} of GCI to go
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-mono text-[var(--color-cream-x)] mb-1.5">
              <span>
                {compactCurrency(plan.bonusTiers * BONUS_TIER_GCI)} (tier {plan.bonusTiers})
              </span>
              <span>{Math.round(plan.tierProgress * 100)}% through tier {plan.bonusTiers + 1}</span>
              <span>{compactCurrency(plan.nextTierAt)} (tier {plan.bonusTiers + 1})</span>
            </div>
            <div className="h-2 bg-[var(--color-border-w)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-gold)] transition-all"
                style={{ width: `${Math.round(plan.tierProgress * 100)}%` }}
              />
            </div>
          </div>

          <div className="border-t border-[var(--color-border-w)] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold)] mb-1">
                Dan's bonus share ({planYourShare}%)
              </p>
              <p className="font-mono tabular-nums text-xl font-semibold text-[var(--color-gold)]">
                {currency(plan.yourBonus)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
                Connie's bonus share ({100 - planYourShare}%)
              </p>
              <p className="font-mono tabular-nums text-xl font-semibold text-[var(--color-cream)]">
                {currency(plan.partnerBonus)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          label="Tier ladder"
          sub="Each step is one full bonus payout. Steps already unlocked are filled gold."
        />
        <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-w)] bg-[var(--color-card-2)]">
                <th className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3">
                  Tier
                </th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3">
                  GCI required
                </th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3">
                  Joint bonus
                </th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3">
                  Dan ({planYourShare}%)
                </th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3">
                  Connie ({100 - planYourShare}%)
                </th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.max(6, plan.bonusTiers + 3) }, (_, i) => {
                const tier = i + 1
                const tierGci = tier * BONUS_TIER_GCI
                const cumulativeBonus = tier * BONUS_PER_TIER
                const unlocked = tier <= plan.bonusTiers
                const isNext = tier === plan.bonusTiers + 1
                return (
                  <tr
                    key={tier}
                    className={[
                      'border-b border-[var(--color-border-w)] last:border-b-0',
                      unlocked ? 'bg-[var(--color-gold-dim)]' : isNext ? 'bg-[var(--color-card-2)]' : '',
                    ].join(' ')}
                  >
                    <td className="px-4 py-3 font-mono">
                      <span className={unlocked ? 'text-[var(--color-gold)] font-semibold' : 'text-[var(--color-cream)]'}>
                        Tier {tier}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3 font-mono tabular-nums text-[var(--color-cream-dim)]">
                      {compactCurrency(tierGci)}
                    </td>
                    <td className="text-right px-4 py-3 font-mono tabular-nums text-[var(--color-cream)]">
                      {currency(cumulativeBonus)}
                    </td>
                    <td className="text-right px-4 py-3 font-mono tabular-nums text-[var(--color-cream-dim)]">
                      {currency(cumulativeBonus * (planYourShare / 100))}
                    </td>
                    <td className="text-right px-4 py-3 font-mono tabular-nums text-[var(--color-cream-dim)]">
                      {currency(cumulativeBonus * ((100 - planYourShare) / 100))}
                    </td>
                    <td className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.12em]">
                      {unlocked ? (
                        <span className="text-[var(--color-gold)] font-semibold">Unlocked</span>
                      ) : isNext ? (
                        <span className="text-[var(--color-cream)]">
                          {currency(plan.gciToNextTier)} away
                        </span>
                      ) : (
                        <span className="text-[var(--color-cream-x)]">Locked</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionHeader
          label="Total annual income"
          sub="Pre-tax commission cash plus bonus, at the default split. Super shown separately above."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg p-5 border bg-[var(--color-card)] border-[var(--color-gold)]">
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold)]">
                Dan
              </p>
              <span className="font-mono tabular-nums text-xs text-[var(--color-cream-dim)]">
                commission + bonus
              </span>
            </div>
            <p className="font-mono tabular-nums text-3xl font-semibold text-[var(--color-gold)] mb-3">
              {currency(plan.yourTotal)}
            </p>
            <div className="border-t border-[var(--color-border-w)] pt-3 grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">Commission</p>
                <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                  {currency(plan.yourTake)}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">Bonus</p>
                <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                  {currency(plan.yourBonus)}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">/ month</p>
                <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                  {currency(plan.yourTotalPerMonth)}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">vs commission only</p>
                <p
                  className={[
                    'font-mono tabular-nums text-sm font-semibold',
                    plan.yourBonus > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-cream-dim)]',
                  ].join(' ')}
                >
                  {plan.yourBonus > 0 ? `+${currency(plan.yourBonus)}` : '—'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg p-5 border bg-[var(--color-card)] border-[var(--color-border-w)]">
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)]">
                Connie
              </p>
              <span className="font-mono tabular-nums text-xs text-[var(--color-cream-dim)]">
                commission + bonus
              </span>
            </div>
            <p className="font-mono tabular-nums text-3xl font-semibold text-[var(--color-cream)] mb-3">
              {currency(plan.partnerTotal)}
            </p>
            <div className="border-t border-[var(--color-border-w)] pt-3 grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">Commission</p>
                <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                  {currency(plan.partnerTake)}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">Bonus</p>
                <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                  {currency(plan.partnerBonus)}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">/ month</p>
                <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                  {currency(plan.partnerTotalPerMonth)}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">vs commission only</p>
                <p
                  className={[
                    'font-mono tabular-nums text-sm font-semibold',
                    plan.partnerBonus > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-cream-dim)]',
                  ].join(' ')}
                >
                  {plan.partnerBonus > 0 ? `+${currency(plan.partnerBonus)}` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader label="Full breakdown" />
        <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5">
          <Row label="Total sales volume" value={currency(plan.volume)} />
          <Row label={`Gross commission (${avgCommission}% of volume)`} value={currency(plan.gci)} />
          <Row
            label={`Less: RW Corporate cut (${corpCut}%)`}
            value={`− ${currency(plan.corpAmount)}`}
            dim
          />
          <Row label="Post-corporate pool" value={currency(plan.postCorp)} />
          <Row
            label={`Less: RW Bulimba retention`}
            value={`− ${currency(plan.bulimbaRetention)}`}
            dim
          />
          <Row label="Net to agents (cash, annual)" value={currency(plan.netAgents)} big />
          <Row
            label={`Plus: super on agent cash (${superRate}%, paid into super funds)`}
            value={`+ ${currency(plan.agentSuper)}`}
            dim
          />
          <Row
            label={`Plus: GCI bonus (${plan.bonusTiers} × ${currency(BONUS_PER_TIER)})`}
            value={`+ ${currency(plan.bonusTotal)}`}
            accent
          />
          <Row
            label="Total to agents (cash + super + bonus)"
            value={currency(plan.netAgents + plan.agentSuper + plan.bonusTotal)}
            big
            accent
          />
        </div>
      </section>

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
        <SectionHeader label="Pre-tax cash from this deal" sub="Plus super paid separately into each agent's super fund." />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AgentCard
            who="Dan"
            pct={dealYourShare}
            takeHome={deal.yourTake}
            superAmount={deal.yourSuper}
            highlight
          />
          <AgentCard
            who="Connie"
            pct={100 - dealYourShare}
            takeHome={deal.partnerTake}
            superAmount={deal.partnerSuper}
          />
        </div>
        <div className="mt-4 bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5">
          <Row label={`Gross commission (${dealCommission}% of sale)`} value={currency(deal.gross)} />
          <Row
            label={`Less: RW Corporate cut (${corpCut}%)`}
            value={`− ${currency(deal.corpAmount)}`}
            dim
          />
          <Row label="Post-corporate pool" value={currency(deal.postCorp)} />
          <Row
            label={`Less: RW Bulimba retention`}
            value={`− ${currency(deal.bulimbaRetention)}`}
            dim
          />
          <Row label="Net to agents (cash)" value={currency(deal.netAgents)} />
          <Row
            label={`Plus: super on agent cash (${superRate}%)`}
            value={`+ ${currency(deal.agentSuper)}`}
            dim
          />
          <Row
            label={`Dan's cash share (${dealYourShare}% of net)`}
            value={currency(deal.yourTake)}
            accent
            big
          />
          <Row
            label={`Dan's super share (${dealYourShare}%)`}
            value={currency(deal.yourSuper)}
            dim
          />
          <Row label={`Connie's cash share (${100 - dealYourShare}% of net)`} value={currency(deal.partnerTake)} />
          <Row
            label={`Connie's super share (${100 - dealYourShare}%)`}
            value={currency(deal.partnerSuper)}
            dim
          />
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
              pre-tax cash.
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
            combined pre-tax cash for both agents is constant ({currency(deal.netAgents)} per deal ·{' '}
            {currency(deal.netAgents * dealsPerYear)}/yr at {dealsPerYear} deals). Super follows the same
            split and is paid into super on top. Only the Dan/Connie split changes between rows.
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
          <AgentCard
            who="Dan — projected annual"
            pct={dealYourShare}
            takeHome={projected.yourAnnual}
            superAmount={projected.yourAnnualSuper}
            highlight
          />
          <AgentCard
            who="Connie — projected annual"
            pct={100 - dealYourShare}
            takeHome={projected.partnerAnnual}
            superAmount={projected.partnerAnnualSuper}
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

      {/* ─── PART 3 — LEAD-AGENT FORECAST ─────────────────────────── */}
      <PartHeader
        tag="Part 3"
        title="Lead-agent forecast"
        blurb={`Year-one forecast where each deal has a lead agent. Lead agent takes ${leadAgentShare}% of net commission, the other takes ${100 - leadAgentShare}%. Slide the lead share to flip it. Uses Part 1's average sale price (${compactCurrency(avgSalePrice)}) and commission (${avgCommission}%).`}
      />

      <div className="grid lg:grid-cols-[minmax(420px,460px)_minmax(0,1fr)] gap-10 items-start">
        <div className="lg:sticky lg:top-6 flex flex-col gap-6">
          <section>
            <SectionHeader label="Forecast inputs" />
            <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5 flex flex-col gap-6">
              <div>
                <Field
                  label={`Lead agent share — lead ${leadAgentShare}% / other ${100 - leadAgentShare}%`}
                  suffix="%"
                  value={leadAgentShare}
                  onChange={setLeadAgentShare}
                  step={1}
                  hint="The lead agent's share of net commission on their own deal. The other agent gets the rest."
                />
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={leadAgentShare}
                  onChange={setLeadAgentShare}
                  ticks={['0', '20', '50', '80', '100']}
                  label="Lead agent share"
                />
              </div>
              <div>
                <Field
                  label="Deals Dan leads"
                  suffix="/yr"
                  value={danLeadDeals}
                  onChange={setDanLeadDeals}
                  step={1}
                  hint="Dan is primary on these listings."
                />
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={danLeadDeals}
                  onChange={setDanLeadDeals}
                  ticks={['0', '10', '20', '30', '40', '50']}
                  label="Dan lead deals"
                />
              </div>
              <div>
                <Field
                  label="Deals Connie leads"
                  suffix="/yr"
                  value={connieLeadDeals}
                  onChange={setConnieLeadDeals}
                  step={1}
                  hint="Connie is primary on these listings."
                />
                <Slider
                  min={0}
                  max={50}
                  step={1}
                  value={connieLeadDeals}
                  onChange={setConnieLeadDeals}
                  ticks={['0', '10', '20', '30', '40', '50']}
                  label="Connie lead deals"
                />
              </div>
              <div className="border-t border-[var(--color-border-w)] pt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
                    Total deals
                  </p>
                  <p className="font-mono tabular-nums text-lg font-semibold text-[var(--color-cream)]">
                    {forecast.totalDeals}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
                    Forecast GCI
                  </p>
                  <p className="font-mono tabular-nums text-lg font-semibold text-[var(--color-cream)]">
                    {compactCurrency(forecast.totalGci)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-8 min-w-0">
          {forecast.totalDeals === 0 ? (
            <div className="bg-[var(--color-card)] border border-dashed border-[var(--color-border-w)] rounded-lg p-8 text-center">
              <p className="text-sm text-[var(--color-cream-dim)] leading-relaxed">
                Add some lead deals for Dan and Connie to see the forecast.
              </p>
            </div>
          ) : (
            <>
              <section>
                <SectionHeader
                  label="Year-one pre-tax cash"
                  sub={`Each lead deal pays the lead ${currency(forecast.leadCutPerDeal)} and the other ${currency(forecast.otherCutPerDeal)} in net commission. Bonus split 50/50 since it is a joint payout.`}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg p-5 border bg-[var(--color-card)] border-[var(--color-gold)]">
                    <div className="flex items-baseline justify-between mb-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold)]">
                        Dan
                      </p>
                      <span className="font-mono tabular-nums text-xs text-[var(--color-cream-dim)]">
                        {danLeadDeals} lead · {connieLeadDeals} support
                      </span>
                    </div>
                    <p className="font-mono tabular-nums text-3xl font-semibold text-[var(--color-gold)] mb-1">
                      {currency(forecast.danTotal)}
                    </p>
                    <p className="text-[11px] text-[var(--color-cream-x)] mb-3">
                      commission + bonus
                    </p>
                    <div className="border-t border-[var(--color-border-w)] pt-3 grid grid-cols-3 gap-3 text-[11px]">
                      <div>
                        <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">As lead</p>
                        <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                          {currency(forecast.danFromLead)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">As support</p>
                        <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                          {currency(forecast.danFromSupport)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">Bonus</p>
                        <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                          {currency(forecast.danBonus)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg p-5 border bg-[var(--color-card)] border-[var(--color-border-w)]">
                    <div className="flex items-baseline justify-between mb-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)]">
                        Connie
                      </p>
                      <span className="font-mono tabular-nums text-xs text-[var(--color-cream-dim)]">
                        {connieLeadDeals} lead · {danLeadDeals} support
                      </span>
                    </div>
                    <p className="font-mono tabular-nums text-3xl font-semibold text-[var(--color-cream)] mb-1">
                      {currency(forecast.connieTotal)}
                    </p>
                    <p className="text-[11px] text-[var(--color-cream-x)] mb-3">
                      commission + bonus
                    </p>
                    <div className="border-t border-[var(--color-border-w)] pt-3 grid grid-cols-3 gap-3 text-[11px]">
                      <div>
                        <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">As lead</p>
                        <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                          {currency(forecast.connieFromLead)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">As support</p>
                        <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                          {currency(forecast.connieFromSupport)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[var(--color-cream-x)] uppercase tracking-wider mb-0.5">Bonus</p>
                        <p className="font-mono tabular-nums text-[var(--color-cream)] text-sm font-semibold">
                          {currency(forecast.connieBonus)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <SectionHeader label="Per-deal economics" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
                      Gross per deal
                    </p>
                    <p className="font-mono tabular-nums text-xl font-semibold text-[var(--color-cream)]">
                      {currency(forecast.grossPerDeal)}
                    </p>
                    <p className="text-[11px] text-[var(--color-cream-x)] mt-1.5">
                      {avgCommission}% of {compactCurrency(avgSalePrice)}
                    </p>
                  </div>
                  <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold)] mb-1">
                      Lead agent ({leadAgentShare}%)
                    </p>
                    <p className="font-mono tabular-nums text-xl font-semibold text-[var(--color-gold)]">
                      {currency(forecast.leadCutPerDeal)}
                    </p>
                    <p className="text-[11px] text-[var(--color-cream-x)] mt-1.5">per lead deal</p>
                  </div>
                  <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-cream-dim)] mb-1">
                      Other agent ({100 - leadAgentShare}%)
                    </p>
                    <p className="font-mono tabular-nums text-xl font-semibold text-[var(--color-cream)]">
                      {currency(forecast.otherCutPerDeal)}
                    </p>
                    <p className="text-[11px] text-[var(--color-cream-x)] mt-1.5">per support deal</p>
                  </div>
                </div>
              </section>

              <section>
                <SectionHeader
                  label="Forecast breakdown"
                  sub={`${forecast.totalDeals} deals × ${currency(forecast.grossPerDeal)} = ${currency(forecast.totalGci)} GCI.`}
                />
                <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg p-5">
                  <Row label="Total GCI" value={currency(forecast.totalGci)} />
                  <Row
                    label={`Less: RW Corporate + Bulimba retention`}
                    value={`− ${currency(forecast.totalGci - forecast.totalNetToAgents)}`}
                    dim
                  />
                  <Row label="Net to agents (cash)" value={currency(forecast.totalNetToAgents)} big />
                  <Row
                    label={`Plus: agent super (${superRate}%, paid into super funds)`}
                    value={`+ ${currency(forecast.totalSuper)}`}
                    dim
                  />
                  <Row label={`Dan from lead deals (${danLeadDeals} × ${currency(forecast.leadCutPerDeal)})`} value={currency(forecast.danFromLead)} />
                  <Row label={`Dan from support deals (${connieLeadDeals} × ${currency(forecast.otherCutPerDeal)})`} value={currency(forecast.danFromSupport)} />
                  <Row
                    label={`Dan super (cash × ${superRate}%)`}
                    value={currency(forecast.danSuper)}
                    dim
                  />
                  <Row label={`Connie from lead deals (${connieLeadDeals} × ${currency(forecast.leadCutPerDeal)})`} value={currency(forecast.connieFromLead)} />
                  <Row label={`Connie from support deals (${danLeadDeals} × ${currency(forecast.otherCutPerDeal)})`} value={currency(forecast.connieFromSupport)} />
                  <Row
                    label={`Connie super (cash × ${superRate}%)`}
                    value={currency(forecast.connieSuper)}
                    dim
                  />
                  <Row
                    label={`Plus: GCI bonus (${forecast.bonusTiers} × ${currency(BONUS_PER_TIER)}, split 50/50)`}
                    value={`+ ${currency(forecast.bonusTotal)}`}
                    accent
                  />
                  <Row label="Dan total (cash + bonus)" value={currency(forecast.danTotal)} accent big />
                  <Row label="Connie total (cash + bonus)" value={currency(forecast.connieTotal)} big />
                </div>
                {forecast.gciToNext > 0 && (
                  <p className="text-[11px] text-[var(--color-cream-x)] mt-2 leading-relaxed">
                    {currency(forecast.gciToNext)} more GCI unlocks the next {currency(BONUS_PER_TIER)} bonus
                    tier ({currency(BONUS_PER_TIER / 2)} each).
                  </p>
                )}
              </section>

              <section>
                <SectionHeader
                  label="Scenarios"
                  sub={`Holding total at ${forecast.totalDeals} deals, vary who leads. Click a row to apply that split.`}
                />
                <div className="bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border-w)] bg-[var(--color-card-2)]">
                        <th className="text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3">
                          Lead mix
                        </th>
                        <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3">
                          Dan leads
                        </th>
                        <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3">
                          Connie leads
                        </th>
                        <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3">
                          Dan total
                        </th>
                        <th className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cream-dim)] px-4 py-3">
                          Connie total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastScenarios.map((s) => {
                        const isCurrent = s.danLeads === danLeadDeals && s.connieLeads === connieLeadDeals
                        return (
                          <tr
                            key={s.pct}
                            onClick={() => {
                              setDanLeadDeals(s.danLeads)
                              setConnieLeadDeals(s.connieLeads)
                            }}
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
                                Dan {Math.round(s.pct * 100)}% / Connie {Math.round((1 - s.pct) * 100)}%
                              </span>
                            </td>
                            <td className="text-right px-4 py-3 font-mono tabular-nums text-[var(--color-cream-dim)]">
                              {s.danLeads}
                            </td>
                            <td className="text-right px-4 py-3 font-mono tabular-nums text-[var(--color-cream-dim)]">
                              {s.connieLeads}
                            </td>
                            <td
                              className={[
                                'text-right px-4 py-3 font-mono tabular-nums',
                                isCurrent ? 'text-[var(--color-gold)] font-semibold' : 'text-[var(--color-cream)]',
                              ].join(' ')}
                            >
                              {currency(s.danWithBonus)}
                            </td>
                            <td
                              className={[
                                'text-right px-4 py-3 font-mono tabular-nums',
                                isCurrent ? 'text-[var(--color-cream)] font-semibold' : 'text-[var(--color-cream)]',
                              ].join(' ')}
                            >
                              {currency(s.connieWithBonus)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-[var(--color-cream-x)] mt-2 leading-relaxed">
                  Bonus is fixed at {currency(forecast.bonusTotal)} for this row because total GCI does not
                  change (same total deals × same average price).
                </p>
              </section>
            </>
          )}
        </div>
      </div>

      <p className="text-[11px] text-[var(--color-cream-x)] leading-relaxed">
        Estimates only. Excludes GST, marketing rebates, referral fees, and mentor splits. The cascade
        defaults to 9% Ray White Corporate / 55% agent / 12% super — adjust if your franchise terms differ.
        The GCI bonus tier ($17,500 per $300k of team GCI) is paid net to agents (no cascade, no super) and
        is split at the default share. Numbers are for planning, not invoices.
      </p>
    </div>
  )
}
