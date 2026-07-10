import React, { useState } from 'react'

export default function LoginForm({ onLogin, busy, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    onLogin(email.trim(), password)
  }

  return (
    <div className="min-h-screen bg-cream text-ink font-sans flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs font-medium tracking-widest uppercase text-terra mb-3 text-center">Cadence Cafehouse</p>
        <h1 className="font-fraunces font-bold text-3xl mb-2 text-center">Staff Attendance</h1>
        <p className="text-muted text-sm mb-8 text-center">Sign in to clock in and out.</p>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#e8e0d0] bg-white/80 p-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#e8e0d0] bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[#e8e0d0] bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
            />
          </div>

          {error && <p className="text-sm text-terra">{error}</p>}

          <button
            type="submit"
            disabled={busy || !email.trim() || !password}
            className="w-full inline-flex items-center justify-center rounded-full bg-terra text-white font-medium px-6 py-3 text-sm transition hover:bg-terra/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
