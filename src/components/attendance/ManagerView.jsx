import React, { useState, useEffect, useCallback } from 'react'
import * as api from '../../utils/attendanceApi'
import {
  formatMinutes, formatTime, elapsedSince,
  todayStr, daysAgoStr, downloadCsv,
} from '../../utils/attendanceFormat'

const TABS = [
  { id: 'whoIsIn', label: "Who's in" },
  { id: 'timesheets', label: 'Timesheets' },
  { id: 'team', label: 'Team' },
]

export default function ManagerView({ token }) {
  const [tab, setTab] = useState('whoIsIn')

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex gap-1 rounded-full border border-[#e8e0d0] bg-white/60 p-1 mb-8 w-fit mx-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.id ? 'bg-terra text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'whoIsIn' && <WhoIsIn token={token} />}
      {tab === 'timesheets' && <Timesheets token={token} />}
      {tab === 'team' && <Team token={token} />}
    </div>
  )
}

// ── Who's in ──────────────────────────────────────────────────────────────
function WhoIsIn({ token }) {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const data = await api.whoIsIn(token)
      setList(data.employees)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }, [token])

  useEffect(() => {
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [load])

  return (
    <Card title="On the clock now" action={<RefreshButton onClick={load} />}>
      {error && <p className="text-sm text-terra">{error}</p>}
      {!list ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : list.length === 0 ? (
        <p className="text-muted text-sm">Nobody is clocked in right now.</p>
      ) : (
        <ul className="divide-y divide-[#e8e0d0]">
          {list.map(e => (
            <li key={e.id} className="flex items-center justify-between py-3">
              <span className="flex items-center gap-2.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-forest" />
                {e.name}
              </span>
              <span className="text-muted text-sm">
                since {formatTime(e.since)} · {elapsedSince(e.since)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

// ── Timesheets ────────────────────────────────────────────────────────────
function Timesheets({ token }) {
  const [from, setFrom] = useState(daysAgoStr(6))
  const [to, setTo] = useState(todayStr())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setData(await api.report(token, from, to))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, from, to])

  useEffect(() => { run() }, []) // initial load only; re-run is manual via button

  function exportCsv() {
    if (!data) return
    downloadCsv(
      `cadence-hours_${from}_to_${to}.csv`,
      ['Employee', 'Total hours', 'Total minutes', 'Punches'],
      data.summary.map(s => [s.name, (s.minutes / 60).toFixed(2), s.minutes, s.punches])
    )
  }

  function exportPunchesCsv() {
    if (!data) return
    downloadCsv(
      `cadence-punches_${from}_to_${to}.csv`,
      ['Employee', 'Type', 'Timestamp'],
      data.rows.map(r => [r.employee, r.type, r.timestamp])
    )
  }

  return (
    <Card title="Hours by employee">
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <label className="text-sm">
          <span className="block text-muted mb-1">From</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="rounded-lg border border-[#e8e0d0] bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40" />
        </label>
        <label className="text-sm">
          <span className="block text-muted mb-1">To</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="rounded-lg border border-[#e8e0d0] bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40" />
        </label>
        <button onClick={run} disabled={loading}
          className="rounded-full bg-ink text-white font-medium px-5 py-2 text-sm transition hover:bg-ink/90 disabled:opacity-50">
          {loading ? 'Loading…' : 'Run'}
        </button>
      </div>

      {error && <p className="text-sm text-terra mb-4">{error}</p>}

      {data && (
        <>
          {data.summary.length === 0 ? (
            <p className="text-muted text-sm">No hours recorded in this range.</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b border-[#e8e0d0]">
                    <th className="py-2 font-medium">Employee</th>
                    <th className="py-2 font-medium text-right">Hours</th>
                    <th className="py-2 font-medium text-right">Punches</th>
                  </tr>
                </thead>
                <tbody>
                  {data.summary.map(s => (
                    <tr key={s.id} className="border-b border-[#f0e9db] last:border-0">
                      <td className="py-2.5 font-medium">{s.name}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatMinutes(s.minutes)}</td>
                      <td className="py-2.5 text-right tabular-nums text-muted">{s.punches}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-wrap gap-4 mt-6">
                <button onClick={exportCsv} className="text-sm font-medium text-terra hover:underline">
                  ↓ Export hours (CSV)
                </button>
                <button onClick={exportPunchesCsv} className="text-sm font-medium text-terra hover:underline">
                  ↓ Export raw punches (CSV)
                </button>
              </div>
            </>
          )}
        </>
      )}
    </Card>
  )
}

// ── Team management ───────────────────────────────────────────────────────
function Team({ token }) {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await api.listEmployees(token)
      setList(data.employees)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  async function handleRemove(emp) {
    if (!window.confirm(`Deactivate ${emp.name}? Their past hours stay on record, but they can no longer sign in.`)) return
    try {
      await api.removeEmployee(token, emp.id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Card
      title="Team"
      action={
        <button onClick={() => setShowAdd(v => !v)}
          className="rounded-full bg-terra text-white font-medium px-4 py-2 text-sm transition hover:bg-terra/90">
          {showAdd ? 'Close' : '+ Add employee'}
        </button>
      }
    >
      {error && <p className="text-sm text-terra mb-4">{error}</p>}

      {showAdd && <AddEmployee token={token} onDone={() => { setShowAdd(false); load() }} />}

      {!list ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : (
        <ul className="divide-y divide-[#e8e0d0]">
          {list.filter(e => e.active).map(e => (
            <li key={e.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">
                  {e.name}
                  {e.role === 'manager' && (
                    <span className="ml-2 text-[11px] font-medium uppercase tracking-wide text-terra bg-terra/10 rounded-full px-2 py-0.5">
                      Manager
                    </span>
                  )}
                </p>
                <p className="text-muted text-sm">{e.email}</p>
              </div>
              <button onClick={() => handleRemove(e)} className="text-sm text-muted hover:text-terra">
                Deactivate
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function AddEmployee({ token, onDone }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.addEmployee(token, form)
      onDone()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mb-6 rounded-xl border border-[#e8e0d0] bg-cream/60 p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} required
          className="rounded-lg border border-[#e8e0d0] bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40" />
        <input type="email" placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} required
          className="rounded-lg border border-[#e8e0d0] bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40" />
        <input type="text" placeholder="Temporary password" value={form.password} onChange={e => set('password', e.target.value)} required
          className="rounded-lg border border-[#e8e0d0] bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40" />
        <select value={form.role} onChange={e => set('role', e.target.value)}
          className="rounded-lg border border-[#e8e0d0] bg-white p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40">
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>
      </div>
      {error && <p className="text-sm text-terra">{error}</p>}
      <button type="submit" disabled={busy}
        className="rounded-full bg-terra text-white font-medium px-5 py-2 text-sm transition hover:bg-terra/90 disabled:opacity-50">
        {busy ? 'Adding…' : 'Add employee'}
      </button>
    </form>
  )
}

// ── Shared bits ───────────────────────────────────────────────────────────
function Card({ title, action, children }) {
  return (
    <div className="rounded-2xl border border-[#e8e0d0] bg-white/80 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-fraunces font-bold text-xl">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function RefreshButton({ onClick }) {
  return (
    <button onClick={onClick} className="text-sm font-medium text-terra hover:underline">
      Refresh
    </button>
  )
}
