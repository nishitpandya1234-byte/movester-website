import React, { useState, useEffect } from 'react'
import * as api from '../utils/attendanceApi'
import LoginForm from '../components/attendance/LoginForm'
import EmployeeView from '../components/attendance/EmployeeView'
import ManagerView from '../components/attendance/ManagerView'

const TOKEN_KEY = 'cadence_attendance_token'

export default function Attendance() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [employee, setEmployee] = useState(null)
  const [booting, setBooting] = useState(true)
  const [loginBusy, setLoginBusy] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Restore an existing session on load.
  useEffect(() => {
    let cancelled = false
    async function boot() {
      if (!token) { setBooting(false); return }
      try {
        const data = await api.resumeSession(token)
        if (!cancelled) setEmployee(data.employee)
      } catch {
        if (!cancelled) { localStorage.removeItem(TOKEN_KEY); setToken('') }
      } finally {
        if (!cancelled) setBooting(false)
      }
    }
    boot()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogin(email, password) {
    setLoginBusy(true)
    setLoginError('')
    try {
      const data = await api.login(email, password)
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setEmployee(data.employee)
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setLoginBusy(false)
    }
  }

  async function handleLogout() {
    await api.logout(token)
    localStorage.removeItem(TOKEN_KEY)
    setToken('')
    setEmployee(null)
  }

  if (!api.isConfigured()) {
    return (
      <div className="min-h-screen bg-cream text-ink font-sans flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-fraunces font-bold text-2xl mb-3">Attendance — setup needed</h1>
          <p className="text-muted text-sm">
            Deploy <code className="bg-white/70 px-1.5 py-0.5 rounded">scripts/attendance-sheet-webhook.gs</code> as a
            Google Apps Script web app, then paste its URL into{' '}
            <code className="bg-white/70 px-1.5 py-0.5 rounded">ATTENDANCE_WEBHOOK_URL</code> in{' '}
            <code className="bg-white/70 px-1.5 py-0.5 rounded">src/utils/attendanceApi.js</code>.
          </p>
        </div>
      </div>
    )
  }

  if (booting) {
    return (
      <div className="min-h-screen bg-cream text-ink font-sans flex items-center justify-center">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    )
  }

  if (!employee) {
    return <LoginForm onLogin={handleLogin} busy={loginBusy} error={loginError} />
  }

  return (
    <div className="min-h-screen bg-cream text-ink font-sans">
      <header className="border-b border-[#e8e0d0] bg-white/60">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-widest uppercase text-terra">Cadence Cafehouse</p>
            <p className="font-fraunces font-bold text-lg leading-tight">Attendance</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted hidden sm:inline">
              {employee.name}{employee.role === 'manager' ? ' · Manager' : ''}
            </span>
            <button onClick={handleLogout} className="text-sm font-medium text-muted hover:text-terra">
              Sign out
            </button>
          </div>
        </div>
      </header>

      {employee.role === 'manager'
        ? <ManagerView token={token} />
        : <EmployeeView token={token} employee={employee} />}
    </div>
  )
}
