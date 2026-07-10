import React, { useState, useEffect, useCallback } from 'react'
import * as api from '../../utils/attendanceApi'
import { formatMinutes, formatTime, elapsedSince } from '../../utils/attendanceFormat'

export default function EmployeeView({ token, employee }) {
  const [state, setState] = useState(null) // { clockedIn, since, todayMinutes, today[] }
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [, forceTick] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const data = await api.status(token)
      setState(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { refresh() }, [refresh])

  // Tick every 30s so the "on the clock" timer stays live.
  useEffect(() => {
    if (!state || !state.clockedIn) return
    const t = setInterval(() => forceTick(x => x + 1), 30000)
    return () => clearInterval(t)
  }, [state])

  async function handleClock(type) {
    setBusy(true)
    setError('')
    try {
      await api.clock(token, type)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const clockedIn = state && state.clockedIn

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="rounded-2xl border border-[#e8e0d0] bg-white/80 p-8 text-center">
        <p className="text-xs font-medium tracking-widest uppercase text-muted mb-2">
          {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h2 className="font-fraunces font-bold text-2xl mb-6">Hi, {employee.name.split(' ')[0]}</h2>

        {loading ? (
          <p className="text-muted text-sm py-8">Loading…</p>
        ) : (
          <>
            <div className="mb-6">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${
                  clockedIn ? 'bg-forest/10 text-forest' : 'bg-[#efe7d4] text-muted'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${clockedIn ? 'bg-forest' : 'bg-muted'}`} />
                {clockedIn ? 'On the clock' : 'Clocked out'}
              </span>
              {clockedIn && state.since && (
                <p className="text-muted text-sm mt-3">
                  Since {formatTime(state.since)} · {elapsedSince(state.since)} so far
                </p>
              )}
            </div>

            <button
              onClick={() => handleClock(clockedIn ? 'out' : 'in')}
              disabled={busy}
              className={`w-full inline-flex items-center justify-center rounded-full font-medium px-6 py-4 text-base transition disabled:opacity-50 disabled:cursor-not-allowed ${
                clockedIn
                  ? 'bg-ink text-white hover:bg-ink/90'
                  : 'bg-terra text-white hover:bg-terra/90'
              }`}
            >
              {busy ? 'One moment…' : clockedIn ? 'Clock out' : 'Clock in'}
            </button>

            <p className="text-muted text-sm mt-6">
              Today: <span className="font-medium text-ink">{formatMinutes(state.todayMinutes)}</span> worked
            </p>

            {state.today && state.today.length > 0 && (
              <div className="mt-6 text-left border-t border-[#e8e0d0] pt-4">
                <p className="text-xs font-medium tracking-widest uppercase text-muted mb-3">Today's punches</p>
                <ul className="space-y-1.5">
                  {state.today.map((p, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className={p.type === 'in' ? 'text-forest' : 'text-terra'}>
                        {p.type === 'in' ? 'Clocked in' : 'Clocked out'}
                      </span>
                      <span className="text-muted tabular-nums">{formatTime(p.timestamp)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {error && <p className="text-sm text-terra mt-5">{error}</p>}
      </div>
    </div>
  )
}
