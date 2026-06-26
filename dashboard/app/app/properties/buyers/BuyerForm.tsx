'use client'

import { useState, useTransition } from 'react'
import { createBuyer, updateBuyer } from '@/lib/actions/buyers'
import type { BuyerBrief } from '@/types/buyers'
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from '@/types/buyers'

type Props = {
  buyer?: BuyerBrief
  onClose: () => void
  onSaved: () => void
}

function fmtMoney(n: number | null) {
  if (n == null || Number.isNaN(n)) return ''
  return n.toLocaleString('en-AU')
}

export default function BuyerForm({ buyer, onClose, onSaved }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [types, setTypes] = useState<string[]>(buyer?.property_types ?? [])

  const isEdit = !!buyer

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    // Ensure property_types are submitted as multiple values (browser does this from name="property_types")
    form.delete('property_types')
    types.forEach(t => form.append('property_types', t))

    startTransition(async () => {
      const action = isEdit ? updateBuyer.bind(null, buyer!.id) : createBuyer
      const result = await action(form)
      if (result?.error) {
        setError(result.error)
        return
      }
      onSaved()
    })
  }

  function toggleType(t: string) {
    setTypes(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-card-2)] w-full sm:max-w-2xl sm:rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border-w)] flex items-center justify-between bg-[var(--color-card)]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold)] mb-0.5">
              {isEdit ? 'Edit buyer' : 'New buyer'}
            </p>
            <h2 className="font-serif text-xl text-[var(--color-cream)]">
              {isEdit ? buyer!.name : 'Buyer brief'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-cream-dim)] hover:text-[var(--color-cream)] text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-6">

            {/* ── IDENTITY ─────────────────────────────────────────── */}
            <section>
              <SectionLabel>Who</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <Field label="Name" required>
                  <input
                    name="name" type="text" required defaultValue={buyer?.name}
                    placeholder="Sarah Chen"
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    name="phone" type="tel" defaultValue={buyer?.phone ?? ''}
                    placeholder="0412 345 678"
                    className={inputCls}
                  />
                </Field>
                <Field label="Email">
                  <input
                    name="email" type="email" defaultValue={buyer?.email ?? ''}
                    placeholder="sarah@example.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="Monday.com link">
                  <input
                    name="monday_link" type="url" defaultValue={buyer?.monday_link ?? ''}
                    placeholder="https://daniel-gierach.monday.com/..."
                    className={inputCls}
                  />
                </Field>
              </div>
            </section>

            {/* ── WHERE ────────────────────────────────────────────── */}
            <section>
              <SectionLabel>Where</SectionLabel>
              <Field label="Suburbs (comma-separated)" hint="e.g. Bulimba, Hawthorne, Morningside, Cannon Hill">
                <input
                  name="suburbs" type="text"
                  defaultValue={buyer?.suburbs.join(', ') ?? ''}
                  placeholder="Bulimba, Hawthorne, Morningside"
                  className={inputCls}
                />
              </Field>
            </section>

            {/* ── WHAT ─────────────────────────────────────────────── */}
            <section>
              <SectionLabel>What kind</SectionLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {PROPERTY_TYPES.map(t => (
                  <button
                    key={t} type="button" onClick={() => toggleType(t)}
                    className={[
                      'px-4 py-2 text-sm font-medium border-2 rounded-md transition-colors',
                      types.includes(t)
                        ? 'bg-[var(--color-cream)] text-[var(--color-card)] border-[var(--color-cream)]'
                        : 'bg-[var(--color-card)] text-[var(--color-cream)] border-[var(--color-border-w)] hover:border-[var(--color-cream-dim)]',
                    ].join(' ')}
                  >
                    {PROPERTY_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[var(--color-cream-x)] mt-2">Pick any that qualify. Leave all unselected = any type.</p>
            </section>

            {/* ── PRICE ────────────────────────────────────────────── */}
            <section>
              <SectionLabel>Budget</SectionLabel>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Field label="Min ($)">
                  <input
                    name="price_min" type="text" inputMode="numeric"
                    defaultValue={fmtMoney(buyer?.price_min ?? null)}
                    placeholder="900,000"
                    className={inputCls}
                  />
                </Field>
                <Field label="Max ($)">
                  <input
                    name="price_max" type="text" inputMode="numeric"
                    defaultValue={fmtMoney(buyer?.price_max ?? null)}
                    placeholder="1,400,000"
                    className={inputCls}
                  />
                </Field>
              </div>
            </section>

            {/* ── ATTRIBUTES ───────────────────────────────────────── */}
            <section>
              <SectionLabel>Minimums</SectionLabel>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <Field label="Beds">
                  <NumberStepper name="beds_min" defaultValue={buyer?.beds_min ?? 0} max={10} />
                </Field>
                <Field label="Baths">
                  <NumberStepper name="baths_min" defaultValue={buyer?.baths_min ?? 0} max={10} />
                </Field>
                <Field label="Car spaces">
                  <NumberStepper name="car_min" defaultValue={buyer?.car_min ?? 0} max={10} />
                </Field>
              </div>
              <p className="text-[11px] text-[var(--color-cream-x)] mt-2">0 = no minimum. Listings ≥ this number count toward score.</p>
            </section>

            {/* ── EXTRAS ───────────────────────────────────────────── */}
            <section>
              <SectionLabel>Must-haves & nice-to-haves</SectionLabel>
              <Field hint="Comma or newline-separated. Each keyword is checked against the listing description. Examples: pool, lock-up garage, north aspect, BSHS catchment, study, walk to ferry">
                <textarea
                  name="extras" rows={3}
                  defaultValue={buyer?.extras ?? ''}
                  placeholder="pool, lock-up garage, north aspect, BSHS catchment"
                  className={inputCls + ' resize-none font-sans'}
                />
              </Field>
            </section>

            {/* ── NOTES ────────────────────────────────────────────── */}
            <section>
              <SectionLabel>Private notes</SectionLabel>
              <Field hint="For your eyes only. Context about the buyer that doesn't fit the structured fields.">
                <textarea
                  name="notes" rows={3}
                  defaultValue={buyer?.notes ?? ''}
                  placeholder="Met at open home. Selling unit in Morningside first. Flexible on settlement."
                  className={inputCls + ' resize-none font-sans'}
                />
              </Field>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--color-border-w)] bg-[var(--color-card)] flex items-center justify-between sticky bottom-0">
            <div className="text-xs text-[#dc2626]">{error}</div>
            <div className="flex gap-3">
              <button
                type="button" onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[var(--color-cream-dim)] hover:text-[var(--color-cream)]"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={pending}
                className="px-5 py-2 text-sm font-semibold bg-[var(--color-cream)] text-[var(--color-bg)] rounded-md hover:bg-[var(--color-gold)] hover:text-[var(--color-cream)] disabled:opacity-50 transition-colors"
              >
                {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create buyer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls =
  'w-full bg-[var(--color-card)] border border-[var(--color-cream-x)] rounded-md px-3 py-2 text-sm text-[var(--color-cream)] placeholder:text-[var(--color-cream-x)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold-dim)]'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-cream)] pb-1 border-b border-[var(--color-border-w)]">
      {children}
    </p>
  )
}

function Field({
  label, required, hint, children,
}: {
  label?: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <label className="block">
      {label && (
        <span className="block text-[11px] font-semibold text-[var(--color-cream)] mb-1.5">
          {label}
          {required && <span className="text-[var(--color-gold)] ml-0.5">*</span>}
        </span>
      )}
      {children}
      {hint && <p className="text-[11px] text-[var(--color-cream-x)] mt-1 leading-snug">{hint}</p>}
    </label>
  )
}

function NumberStepper({
  name, defaultValue, max,
}: { name: string; defaultValue: number; max: number }) {
  const [val, setVal] = useState(defaultValue)
  return (
    <div className="flex items-center gap-2">
      <button
        type="button" onClick={() => setVal(v => Math.max(0, v - 1))}
        className="w-8 h-9 flex items-center justify-center border border-[var(--color-border-w)] rounded-md hover:bg-[var(--color-card-2)] text-[var(--color-cream-dim)]"
      >−</button>
      <input
        name={name} type="number" value={val}
        onChange={e => setVal(Math.max(0, Math.min(max, parseInt(e.target.value || '0', 10))))}
        className="w-12 text-center bg-[var(--color-card)] border border-[var(--color-border-w)] rounded-md py-2 text-sm font-mono"
      />
      <button
        type="button" onClick={() => setVal(v => Math.min(max, v + 1))}
        className="w-8 h-9 flex items-center justify-center border border-[var(--color-border-w)] rounded-md hover:bg-[var(--color-card-2)] text-[var(--color-cream-dim)]"
      >+</button>
    </div>
  )
}
