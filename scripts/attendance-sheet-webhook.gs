/**
 * Google Apps Script web app — EMPLOYEE ATTENDANCE tracker for Cadence Cafehouse.
 *
 * Separate from the lead/feedback webhooks (scripts/lead-sheet-webhook.gs,
 * scripts/feedback-sheet-webhook.gs) — deploy this as its own web app with its
 * own URL and its own Google Sheet.
 *
 * WHY EVERYTHING IS A GET (?action=...):
 *   Apps Script web apps can't set CORS headers on POST responses, so a browser
 *   fetch() POST can never read the reply. The site already works around this
 *   for reviews using JSONP (a <script> GET whose response calls back a JS
 *   function). This backend routes ALL operations — including logins and writes
 *   — through doGet + JSONP so the frontend can always read a real response.
 *   Requests travel over HTTPS, so query strings (incl. passwords/tokens) are
 *   encrypted in transit. Passwords are never stored in plaintext — only a
 *   salted SHA-256 hash is kept in the sheet.
 *
 * DATA MODEL (three tabs, auto-created on first run):
 *   Employees:  id | name | email | passwordHash | role | active | createdAt
 *   Punches:    id | employeeId | employeeName | type | timestamp | note
 *   Sessions:   token | employeeId | expiresAt
 *
 * SETUP:
 *   1. Create a new Google Sheet (e.g. "Cadence Attendance"). Tabs are created
 *      automatically, so you can leave it empty.
 *   2. Extensions > Apps Script, delete the boilerplate, paste this file.
 *   3. Edit SEED_MANAGER below (name / email / password) — this is the first
 *      manager account, created automatically the first time the app runs.
 *      Change the password after first login by editing the passwordHash cell,
 *      or add a "change password" flow later.
 *   4. Optionally set SESSION_SALT to any random string (do this BEFORE first
 *      use — changing it later invalidates all stored password hashes).
 *   5. Deploy > New deployment > type "Web app".
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   6. Copy the deployment URL into ATTENDANCE_WEBHOOK_URL at the top of
 *        src/utils/attendanceApi.js
 */

// ── Configuration ───────────────────────────────────────────────────────────
const SEED_MANAGER = {
  name: 'Shashank',
  email: 'shashank@cadencecafehouse.com',
  password: 'changeme123', // change this, then log in and it can't be read back
}
const SESSION_SALT = 'cadence-attendance-salt-change-me'
const SESSION_TTL_MS = 12 * 60 * 60 * 1000 // sessions last 12 hours

// ── Entry point ─────────────────────────────────────────────────────────────
function doGet(e) {
  const params = (e && e.parameter) || {}
  const action = params.action || ''
  let result

  try {
    ensureSheets()
    result = dispatch(action, params)
  } catch (err) {
    result = { ok: false, error: String(err && err.message ? err.message : err) }
  }

  return respond(result, params.callback)
}

// Fire-and-forget POSTs aren't used by the frontend, but define doPost so a
// stray no-cors POST doesn't error the deployment.
function doPost(e) {
  return doGet(e)
}

function dispatch(action, p) {
  switch (action) {
    case 'login':          return handleLogin(p)
    case 'session':        return handleSession(p)
    case 'logout':         return handleLogout(p)
    case 'clock':          return handleClock(p)
    case 'status':         return handleStatus(p)
    case 'listEmployees':  return handleListEmployees(p)
    case 'addEmployee':    return handleAddEmployee(p)
    case 'updateEmployee': return handleUpdateEmployee(p)
    case 'removeEmployee': return handleRemoveEmployee(p)
    case 'whoIsIn':        return handleWhoIsIn(p)
    case 'report':         return handleReport(p)
    default:               return { ok: false, error: 'Unknown action: ' + action }
  }
}

// ── Auth ────────────────────────────────────────────────────────────────────
function handleLogin(p) {
  const email = String(p.email || '').trim().toLowerCase()
  const password = String(p.password || '')
  if (!email || !password) return { ok: false, error: 'Email and password are required.' }

  const row = findEmployeeByEmail(email)
  if (!row || row.active === false) return { ok: false, error: 'Invalid email or password.' }
  if (row.passwordHash !== hashPassword(password)) return { ok: false, error: 'Invalid email or password.' }

  const token = createSession(row.id)
  return { ok: true, token: token, employee: publicEmployee(row) }
}

function handleSession(p) {
  const emp = requireAuth(p)
  return { ok: true, employee: publicEmployee(emp) }
}

function handleLogout(p) {
  const token = String(p.token || '')
  if (token) deleteSession(token)
  return { ok: true }
}

// ── Clock in / out ──────────────────────────────────────────────────────────
function handleClock(p) {
  const emp = requireAuth(p)
  const requested = String(p.type || '').toLowerCase()
  const open = currentlyClockedIn(emp.id)

  // Toggle intelligently: block double in / double out.
  if (requested === 'in' && open) return { ok: false, error: 'Already clocked in.' }
  if (requested === 'out' && !open) return { ok: false, error: 'Not clocked in.' }
  const type = requested === 'in' || requested === 'out'
    ? requested
    : (open ? 'out' : 'in')

  const sheet = sheetByName('Punches')
  const now = new Date()
  sheet.appendRow([Utilities.getUuid(), emp.id, emp.name, type, now.toISOString(), String(p.note || '')])

  return { ok: true, type: type, timestamp: now.toISOString() }
}

function handleStatus(p) {
  const emp = requireAuth(p)
  const punches = punchesForEmployee(emp.id)
  const open = punches.length && punches[punches.length - 1].type === 'in'
    ? punches[punches.length - 1].timestamp
    : null

  // Today's punches (in the script's timezone) for a mini timeline.
  const todayKey = dayKey(new Date())
  const today = punches.filter(x => dayKey(new Date(x.timestamp)) === todayKey)

  return {
    ok: true,
    clockedIn: !!open,
    since: open,
    todayMinutes: sumPairedMinutes(today),
    today: today.map(x => ({ type: x.type, timestamp: x.timestamp })),
  }
}

// ── Manager: employees ──────────────────────────────────────────────────────
function handleListEmployees(p) {
  requireManager(p)
  return { ok: true, employees: allEmployees().map(publicEmployee) }
}

function handleAddEmployee(p) {
  requireManager(p)
  const name = String(p.name || '').trim()
  const email = String(p.email || '').trim().toLowerCase()
  const password = String(p.password || '')
  const role = String(p.role || 'employee').toLowerCase() === 'manager' ? 'manager' : 'employee'
  if (!name || !email || !password) return { ok: false, error: 'Name, email and password are required.' }
  if (findEmployeeByEmail(email)) return { ok: false, error: 'An employee with that email already exists.' }

  const sheet = sheetByName('Employees')
  const id = Utilities.getUuid()
  sheet.appendRow([id, name, email, hashPassword(password), role, true, new Date().toISOString()])
  return { ok: true, employee: { id: id, name: name, email: email, role: role, active: true } }
}

function handleUpdateEmployee(p) {
  requireManager(p)
  const loc = locateEmployee(p.id)
  if (!loc) return { ok: false, error: 'Employee not found.' }
  const sheet = sheetByName('Employees')
  const r = loc.rowIndex

  if (p.name != null && String(p.name).trim()) sheet.getRange(r, 2).setValue(String(p.name).trim())
  if (p.email != null && String(p.email).trim()) sheet.getRange(r, 3).setValue(String(p.email).trim().toLowerCase())
  if (p.password != null && String(p.password)) sheet.getRange(r, 4).setValue(hashPassword(String(p.password)))
  if (p.role != null) sheet.getRange(r, 5).setValue(String(p.role).toLowerCase() === 'manager' ? 'manager' : 'employee')
  if (p.active != null) sheet.getRange(r, 6).setValue(String(p.active) === 'true')

  return { ok: true }
}

function handleRemoveEmployee(p) {
  const me = requireManager(p)
  const loc = locateEmployee(p.id)
  if (!loc) return { ok: false, error: 'Employee not found.' }
  if (loc.employee.id === me.id) return { ok: false, error: "You can't remove your own account." }
  // Soft-delete: keep punch history intact, just deactivate.
  sheetByName('Employees').getRange(loc.rowIndex, 6).setValue(false)
  return { ok: true }
}

// ── Manager: reporting ──────────────────────────────────────────────────────
function handleWhoIsIn(p) {
  requireManager(p)
  const inNow = allEmployees()
    .filter(e => e.active !== false)
    .map(e => {
      const punches = punchesForEmployee(e.id)
      const last = punches[punches.length - 1]
      return last && last.type === 'in'
        ? { id: e.id, name: e.name, since: last.timestamp }
        : null
    })
    .filter(Boolean)
  return { ok: true, employees: inNow }
}

function handleReport(p) {
  requireManager(p)
  const from = p.from ? new Date(p.from + 'T00:00:00') : new Date(0)
  const to = p.to ? new Date(p.to + 'T23:59:59') : new Date()

  const byEmployee = {}
  const rows = []

  allEmployees().forEach(e => {
    const punches = punchesForEmployee(e.id).filter(x => {
      const t = new Date(x.timestamp)
      return t >= from && t <= to
    })
    const minutes = sumPairedMinutes(punches)
    if (punches.length) {
      byEmployee[e.id] = { id: e.id, name: e.name, minutes: minutes, punches: punches.length }
      punches.forEach(x => rows.push({
        employee: e.name, type: x.type, timestamp: x.timestamp,
      }))
    }
  })

  return {
    ok: true,
    from: from.toISOString(),
    to: to.toISOString(),
    summary: Object.keys(byEmployee).map(k => byEmployee[k]).sort((a, b) => b.minutes - a.minutes),
    rows: rows.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1),
  }
}

// ── Auth helpers ────────────────────────────────────────────────────────────
function requireAuth(p) {
  const token = String(p.token || '')
  if (!token) throw new Error('Not signed in.')
  const session = findSession(token)
  if (!session) throw new Error('Session expired. Please sign in again.')
  const emp = locateEmployee(session.employeeId)
  if (!emp || emp.employee.active === false) throw new Error('Account is no longer active.')
  return emp.employee
}

function requireManager(p) {
  const emp = requireAuth(p)
  if (emp.role !== 'manager') throw new Error('Manager access required.')
  return emp
}

function createSession(employeeId) {
  const token = Utilities.getUuid()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()
  sheetByName('Sessions').appendRow([token, employeeId, expiresAt])
  return token
}

function findSession(token) {
  const sheet = sheetByName('Sessions')
  const values = sheet.getDataRange().getValues()
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === token) {
      const expiresAt = new Date(values[i][2])
      if (expiresAt < new Date()) {
        sheet.deleteRow(i + 1)
        return null
      }
      return { token: token, employeeId: values[i][1], expiresAt: expiresAt }
    }
  }
  return null
}

function deleteSession(token) {
  const sheet = sheetByName('Sessions')
  const values = sheet.getDataRange().getValues()
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === token) { sheet.deleteRow(i + 1); return }
  }
}

function hashPassword(password) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    SESSION_SALT + '::' + password,
    Utilities.Charset.UTF_8
  )
  return bytes.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('')
}

// ── Employee data helpers ───────────────────────────────────────────────────
function allEmployees() {
  const values = sheetByName('Employees').getDataRange().getValues()
  const out = []
  for (let i = 1; i < values.length; i++) {
    if (!values[i][0]) continue
    out.push(rowToEmployee(values[i]))
  }
  return out
}

function rowToEmployee(row) {
  return {
    id: String(row[0]),
    name: String(row[1]),
    email: String(row[2]).toLowerCase(),
    passwordHash: String(row[3]),
    role: String(row[4] || 'employee').toLowerCase(),
    active: row[5] !== false && String(row[5]).toLowerCase() !== 'false',
    createdAt: row[6] ? String(row[6]) : '',
  }
}

function findEmployeeByEmail(email) {
  const list = allEmployees()
  for (let i = 0; i < list.length; i++) {
    if (list[i].email === email) return list[i]
  }
  return null
}

function locateEmployee(id) {
  id = String(id || '')
  const values = sheetByName('Employees').getDataRange().getValues()
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === id) {
      return { rowIndex: i + 1, employee: rowToEmployee(values[i]) }
    }
  }
  return null
}

function publicEmployee(e) {
  return { id: e.id, name: e.name, email: e.email, role: e.role, active: e.active }
}

// ── Punch helpers ───────────────────────────────────────────────────────────
function punchesForEmployee(employeeId) {
  employeeId = String(employeeId)
  const values = sheetByName('Punches').getDataRange().getValues()
  const out = []
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][1]) === employeeId) {
      out.push({
        type: String(values[i][3]).toLowerCase(),
        timestamp: values[i][4] instanceof Date ? values[i][4].toISOString() : String(values[i][4]),
      })
    }
  }
  out.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
  return out
}

function currentlyClockedIn(employeeId) {
  const punches = punchesForEmployee(employeeId)
  return punches.length > 0 && punches[punches.length - 1].type === 'in'
}

// Pair each 'in' with the next 'out' and total the minutes between them.
function sumPairedMinutes(punches) {
  let total = 0
  let openIn = null
  punches.forEach(x => {
    if (x.type === 'in') openIn = new Date(x.timestamp)
    else if (x.type === 'out' && openIn) {
      total += (new Date(x.timestamp) - openIn) / 60000
      openIn = null
    }
  })
  return Math.round(total)
}

function dayKey(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd')
}

// ── Sheet plumbing ──────────────────────────────────────────────────────────
function ensureSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  ensureTab(ss, 'Employees', ['id', 'name', 'email', 'passwordHash', 'role', 'active', 'createdAt'])
  ensureTab(ss, 'Punches', ['id', 'employeeId', 'employeeName', 'type', 'timestamp', 'note'])
  ensureTab(ss, 'Sessions', ['token', 'employeeId', 'expiresAt'])

  // Seed the first manager if there are no employees yet.
  const emp = ss.getSheetByName('Employees')
  if (emp.getLastRow() < 2) {
    emp.appendRow([
      Utilities.getUuid(),
      SEED_MANAGER.name,
      SEED_MANAGER.email.toLowerCase(),
      hashPassword(SEED_MANAGER.password),
      'manager',
      true,
      new Date().toISOString(),
    ])
  }
}

function ensureTab(ss, name, headers) {
  let sheet = ss.getSheetByName(name)
  if (!sheet) {
    sheet = ss.insertSheet(name)
    sheet.appendRow(headers)
    sheet.setFrozenRows(1)
  }
  return sheet
}

function sheetByName(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
}

function respond(obj, callback) {
  const json = JSON.stringify(obj)
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT)
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON)
}
