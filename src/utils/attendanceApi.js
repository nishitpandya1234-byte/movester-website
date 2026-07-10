// Client for the Cadence Cafehouse attendance backend.
//
// The backend is a Google Apps Script web app (scripts/attendance-sheet-webhook.gs).
// Apps Script can't return CORS headers, so we talk to it exclusively via JSONP
// (a <script> GET whose response invokes a one-off global callback) — the same
// trick the reviews feature uses. Every call resolves to the parsed JSON object
// the script returns: { ok: true, ... } or { ok: false, error: '...' }.
//
// Paste your deployed web-app URL here after following the setup steps in
// scripts/attendance-sheet-webhook.gs.
const ATTENDANCE_WEBHOOK_URL = ''

let jsonpSeq = 0

// Low-level JSONP GET. Rejects on network/timeout, resolves with parsed data.
function jsonp(params) {
  return new Promise((resolve, reject) => {
    if (!ATTENDANCE_WEBHOOK_URL) {
      reject(new Error('Attendance backend not configured yet. Add ATTENDANCE_WEBHOOK_URL in src/utils/attendanceApi.js.'))
      return
    }

    const cb = `__cadenceAttendance_${Date.now()}_${jsonpSeq++}`
    const script = document.createElement('script')
    let done = false

    const cleanup = () => {
      delete window[cb]
      script.remove()
      clearTimeout(timer)
    }

    window[cb] = (data) => {
      done = true
      cleanup()
      resolve(data)
    }

    const query = Object.keys(params)
      .filter(k => params[k] != null && params[k] !== '')
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&')

    script.src = `${ATTENDANCE_WEBHOOK_URL}?${query}&callback=${cb}`
    script.onerror = () => { if (!done) { cleanup(); reject(new Error('Network error reaching the attendance server.')) } }
    document.body.appendChild(script)

    const timer = setTimeout(() => {
      if (!done) { cleanup(); reject(new Error('The attendance server took too long to respond.')) }
    }, 12000)
  })
}

// Wrapper that turns { ok: false, error } into a thrown Error so callers can
// just try/await.
async function call(action, params = {}) {
  const data = await jsonp({ action, ...params })
  if (!data || data.ok !== true) {
    throw new Error((data && data.error) || 'Something went wrong.')
  }
  return data
}

export const isConfigured = () => Boolean(ATTENDANCE_WEBHOOK_URL)

// ── Auth ──
export const login = (email, password) => call('login', { email, password })
export const resumeSession = (token) => call('session', { token })
export const logout = (token) => call('logout', { token }).catch(() => ({ ok: true }))

// ── Employee: clock ──
export const clock = (token, type) => call('clock', { token, type })
export const status = (token) => call('status', { token })

// ── Manager: employees ──
export const listEmployees = (token) => call('listEmployees', { token })
export const addEmployee = (token, employee) => call('addEmployee', { token, ...employee })
export const updateEmployee = (token, employee) => call('updateEmployee', { token, ...employee })
export const removeEmployee = (token, id) => call('removeEmployee', { token, id })

// ── Manager: reports ──
export const whoIsIn = (token) => call('whoIsIn', { token })
export const report = (token, from, to) => call('report', { token, from, to })
