'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

/* ── Types ──────────────────────────────────────── */

export interface PipelineSlice { name: string; value: number; colour: string }
export interface BarItem       { name: string; value: number; colour?: string }
export interface ScheduleDay   { day: string; date: string; posted: number; scheduled: number }

/* ── Content Pipeline Donut ─────────────────────── */

export function PipelineDonut({ data, total }: { data: PipelineSlice[]; total: number }) {
  const nonEmpty = data.filter(d => d.value > 0)
  if (nonEmpty.length === 0) return <EmptyChart label="No content yet" />

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={nonEmpty}
            cx="50%"
            cy="50%"
            innerRadius={44}
            outerRadius={64}
            paddingAngle={nonEmpty.length > 1 ? 2 : 0}
            dataKey="value"
            strokeWidth={0}
          >
            {nonEmpty.map((entry, i) => (
              <Cell key={i} fill={entry.colour} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{ color: '#f0ece4', fontSize: 11, fontFamily: 'Manrope, sans-serif' }}
            formatter={(v) => [`${v} posts`]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Centre label */}
      <div className="-ml-[130px] pointer-events-none flex flex-col items-center justify-center w-[140px] h-[140px] absolute">
        <span className="text-2xl font-sans font-bold text-[var(--color-cream)]">{total}</span>
        <span className="text-[10px] font-sans text-[var(--color-cream-x)]">posts</span>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.colour }} />
            <span className="text-[11px] font-sans text-[var(--color-cream-dim)] flex-1">{d.name}</span>
            <span className="text-[11px] font-sans font-semibold text-[var(--color-cream)] tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Horizontal Bars ─────────────────────────────── */

export function HorizBars({ data }: { data: BarItem[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex flex-col gap-2.5">
      {data.map(d => (
        <div key={d.name} className="flex items-center gap-3">
          <span className="text-[11px] font-sans text-[var(--color-cream-x)] w-20 text-right flex-shrink-0">
            {d.name}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-[rgba(28,25,23,0.08)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: d.colour ?? 'var(--color-gold)',
              }}
            />
          </div>
          <span className="text-[11px] font-sans font-semibold text-[var(--color-cream)] tabular-nums w-6 text-right flex-shrink-0">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Weekly Schedule Bar Chart ───────────────────── */

export function WeeklySchedule({ data }: { data: ScheduleDay[] }) {
  const hasData = data.some(d => d.posted + d.scheduled > 0)
  if (!hasData) return <EmptyChart label="Nothing scheduled this week" />

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={data} barSize={20} barGap={2}>
        <CartesianGrid vertical={false} stroke="rgba(28,25,23,0.06)" />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fontFamily: 'Manrope, sans-serif', fill: 'rgba(28,25,23,0.4)' }}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          itemStyle={{ color: '#f0ece4', fontSize: 11, fontFamily: 'Manrope, sans-serif' }}
          cursor={{ fill: 'rgba(28,25,23,0.04)' }}
        />
        <Bar dataKey="posted"    name="Posted"    stackId="a" fill="#3b82f6" radius={[0,0,2,2]} />
        <Bar dataKey="scheduled" name="Scheduled" stackId="a" fill="#22c55e" radius={[2,2,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ── Coverage Progress Bars ──────────────────────── */

export function CoverageProgress({
  total, full, partial,
}: {
  total: number; full: number; partial: number
}) {
  const missing = total - full - partial
  return (
    <div className="flex flex-col gap-3">
      {/* Combined bar */}
      <div className="h-2 rounded-full overflow-hidden flex bg-[rgba(28,25,23,0.08)]">
        <div style={{ width: `${(full / total) * 100}%`, background: '#22c55e' }} />
        <div style={{ width: `${(partial / total) * 100}%`, background: '#f97316' }} />
      </div>
      {/* Legend */}
      <div className="flex gap-4">
        {[
          { label: 'Full coverage', value: full,    colour: '#22c55e' },
          { label: 'In progress',   value: partial,  colour: '#f97316' },
          { label: 'Not started',   value: missing,  colour: 'rgba(28,25,23,0.15)' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.colour }} />
            <span className="text-[10px] font-sans text-[var(--color-cream-x)]">{s.label}</span>
            <span className="text-[10px] font-sans font-semibold text-[var(--color-cream)] tabular-nums">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────── */

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-20">
      <p className="text-[11px] font-sans text-[var(--color-cream-x)] italic">{label}</p>
    </div>
  )
}

const tooltipStyle = {
  background: '#1c1917',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  fontSize: 11,
  fontFamily: 'Manrope, sans-serif',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
}
