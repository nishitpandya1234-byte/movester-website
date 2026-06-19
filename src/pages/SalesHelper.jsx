import React, { useState } from 'react'

const SUGGEST_ENDPOINT = '/.netlify/functions/sales-suggest'

export default function SalesHelper() {
  const [customerMessage, setCustomerMessage] = useState('')
  const [context, setContext] = useState('')
  const [reply, setReply] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!customerMessage.trim()) return

    setStatus('loading')
    setReply('')
    setCopied(false)

    try {
      const res = await fetch(SUGGEST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerMessage, context }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setReply(data.reply || '')
      setStatus('idle')
    } catch (err) {
      setStatus('error')
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(reply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-cream text-ink font-sans">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-xs font-medium tracking-widest uppercase text-terra mb-3">Movester Team Tool</p>
        <h1 className="font-fraunces font-bold text-3xl md:text-4xl mb-2">Sales Reply Helper</h1>
        <p className="text-muted mb-10">
          Paste what the customer said, add any quick context, and get a suggested reply you can send on WhatsApp.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="customerMessage">
              What did the customer say?
            </label>
            <textarea
              id="customerMessage"
              value={customerMessage}
              onChange={e => setCustomerMessage(e.target.value)}
              rows={4}
              required
              placeholder="e.g. That's more than I expected — my friend got quoted $600. Can you do better?"
              className="w-full rounded-xl border border-[#e8e0d0] bg-white/80 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="context">
              Quick context <span className="text-muted font-normal">(optional — move size, route, quote given, etc.)</span>
            </label>
            <textarea
              id="context"
              value={context}
              onChange={e => setContext(e.target.value)}
              rows={2}
              placeholder="e.g. 3BR move, Toronto → Mississauga, quoted $800"
              className="w-full rounded-xl border border-[#e8e0d0] bg-white/80 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || !customerMessage.trim()}
            className="inline-flex items-center justify-center rounded-full bg-terra text-white font-medium px-6 py-3 text-sm transition hover:bg-terra/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Thinking…' : 'Get suggested reply'}
          </button>
        </form>

        {status === 'error' && (
          <p className="mt-6 text-sm text-terra">
            Something went wrong getting a suggestion — try again in a moment.
          </p>
        )}

        {reply && (
          <div className="mt-8 rounded-2xl border border-[#e8e0d0] bg-white/80 p-6">
            <p className="text-xs font-medium tracking-widest uppercase text-muted mb-3">Suggested reply</p>
            <p className="text-ink whitespace-pre-wrap leading-relaxed mb-4">{reply}</p>
            <button
              onClick={handleCopy}
              className="text-sm font-medium text-terra hover:underline"
            >
              {copied ? 'Copied ✓' : 'Copy to clipboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
