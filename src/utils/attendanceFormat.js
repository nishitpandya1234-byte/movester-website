// Small formatting helpers shared across the attendance views.

export function formatMinutes(mins) {
  const m = Math.max(0, Math.round(mins || 0))
  const h = Math.floor(m / 60)
  const rem = m % 60
  if (h && rem) return `${h}h ${rem}m`
  if (h) return `${h}h`
  return `${rem}m`
}

export function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// Elapsed time since an ISO timestamp, e.g. "2h 14m".
export function elapsedSince(iso) {
  if (!iso) return ''
  return formatMinutes((Date.now() - new Date(iso).getTime()) / 60000)
}

// today's default date range for the report (yyyy-mm-dd, local).
export function todayStr() {
  const d = new Date()
  const off = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - off).toISOString().slice(0, 10)
}

export function daysAgoStr(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  const off = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - off).toISOString().slice(0, 10)
}

// Build a CSV string and trigger a browser download.
export function downloadCsv(filename, headers, rows) {
  const escape = (v) => {
    const s = String(v == null ? '' : v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.map(escape).join(',')]
  rows.forEach(r => lines.push(r.map(escape).join(',')))
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
