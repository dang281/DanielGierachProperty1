'use client'

import { useState, useTransition } from 'react'
import { login } from '@/lib/actions/auth'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="text-[var(--color-gold)] text-xs tracking-[0.2em] uppercase mb-2 font-sans">
            Ray White Bulimba
          </p>
          <h1 className="font-serif text-[var(--color-cream)] text-2xl">
            Daniel Gierach Property
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-8 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[var(--color-cream-dim)] text-xs tracking-wide uppercase font-sans">
              Email
            </label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="bg-[var(--color-bg)] border border-[var(--color-border-w)] text-[var(--color-cream)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-gold)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[var(--color-cream-dim)] text-xs tracking-wide uppercase font-sans">
              Password
            </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="bg-[var(--color-bg)] border border-[var(--color-border-w)] text-[var(--color-cream)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-gold)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 bg-[var(--color-gold)] text-[var(--color-bg)] font-sans font-semibold text-sm rounded-lg py-2.5 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
