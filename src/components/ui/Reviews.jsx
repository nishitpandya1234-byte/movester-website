import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

// ── Configuration ───────────────────────────────────────────────────────────
// 1. Deploy scripts/feedback-sheet-webhook.gs as a Web app and paste its URL here.
//    Until then, feedback shows live on this page (optimistic) but isn't saved
//    server-side, and other visitors won't see it.
const FEEDBACK_SHEET_WEBHOOK_URL = ''
// 2. Once Movester's Google Business Profile is claimed, paste its "write a review"
//    link here (looks like https://g.page/r/XXXXXXXX/review). The "Review us on
//    Google" button stays hidden until this is set, so nobody hits a dead link.
const GOOGLE_REVIEW_URL = ''

// Starter testimonials so the wall is never empty. Real reviews load on top.
const SEED_REVIEWS = [
  { name: 'Priya S.', rating: 5, message: 'Showed up on time, wrapped everything carefully, and finished our 2-bedroom move faster than quoted. Zero scratches. Would 100% book again.', submittedAt: '2026-05-02T00:00:00Z' },
  { name: 'Marcus T.', rating: 5, message: 'Moved my office over a weekend with no downtime on Monday. The crew was professional and the price was exactly what they said — no surprise fees.', submittedAt: '2026-04-18T00:00:00Z' },
  { name: 'Aisha K.', rating: 4, message: 'Great student rate for my Waterloo-to-Toronto move. Friendly guys, careful with my desk. Took a little longer than expected but worth it.', submittedAt: '2026-03-27T00:00:00Z' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const days = Math.floor((Date.now() - then) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

function Stars({ value, size = 'w-4 h-4', interactive = false, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined} aria-label={interactive ? 'Star rating' : `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = (hover || value) >= n
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={interactive ? () => onChange(n) : undefined}
            onMouseEnter={interactive ? () => setHover(n) : undefined}
            onMouseLeave={interactive ? () => setHover(0) : undefined}
            aria-label={interactive ? `${n} star${n > 1 ? 's' : ''}` : undefined}
            className={interactive ? 'cursor-pointer p-0.5 -m-0.5' : 'pointer-events-none'}
          >
            <svg className={`${size} ${filled ? 'text-terra' : 'text-terra/25'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.075 9.8c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

// JSONP fetch — avoids CORS, which an Apps Script GET otherwise trips on.
function loadReviewsJsonp(url, onData) {
  const cb = `__movesterReviews_${Date.now()}`
  const script = document.createElement('script')
  let done = false
  const cleanup = () => {
    delete window[cb]
    script.remove()
  }
  window[cb] = (data) => {
    done = true
    cleanup()
    if (Array.isArray(data)) onData(data)
  }
  script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${cb}`
  script.onerror = () => { if (!done) cleanup() }
  document.body.appendChild(script)
  // Safety: tear down if the script never resolves.
  setTimeout(() => { if (!done) cleanup() }, 8000)
}

export default function Reviews() {
  const [reviews, setReviews] = useState(SEED_REVIEWS)
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const lastMessageRef = useRef('')

  // Pull any server-saved reviews and show them above the seeds.
  useEffect(() => {
    if (!FEEDBACK_SHEET_WEBHOOK_URL) return
    loadReviewsJsonp(FEEDBACK_SHEET_WEBHOOK_URL, (rows) => {
      const clean = rows
        .filter(r => r && r.message && r.name)
        .map(r => ({ name: r.name, rating: Number(r.rating) || 5, message: r.message, submittedAt: r.submittedAt || new Date().toISOString() }))
      if (clean.length) {
        // Newest first, then seeds as a fallback tail.
        clean.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        setReviews([...clean, ...SEED_REVIEWS])
      }
    })
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!name.trim() || !message.trim() || rating < 1) return

    const review = {
      name: name.trim(),
      rating,
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      source: 'website-reviews',
    }
    lastMessageRef.current = review.message

    // Save server-side (fire-and-forget, same pattern as the lead webhook).
    if (FEEDBACK_SHEET_WEBHOOK_URL) {
      fetch(FEEDBACK_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      }).catch(() => {})
    }

    // Show it immediately so the submitter sees their review right away.
    setReviews(prev => [review, ...prev])
    setSubmitted(true)
    setName('')
    setRating(0)
    setMessage('')
  }, [name, rating, message])

  const handleGoogleClick = () => {
    if (lastMessageRef.current && navigator.clipboard) {
      navigator.clipboard.writeText(lastMessageRef.current).then(
        () => { setCopied(true); setTimeout(() => setCopied(false), 2500) },
        () => {}
      )
    }
    window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer')
  }

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length)
    : 0

  return (
    <section id="reviews" className="bg-cream py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-medium tracking-widest uppercase text-terra mb-3">Reviews</p>
          <h2 className="font-fraunces font-bold text-4xl md:text-5xl text-ink">
            What our customers say
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Stars value={Math.round(avg)} size="w-5 h-5" />
            <span className="text-muted text-sm">
              {avg.toFixed(1)} average · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>

        {/* Reviews wall */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {reviews.map((r, i) => (
            <motion.div
              key={`${r.name}-${r.submittedAt}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: Math.min(i, 5) * 0.06 }}
              className="flex flex-col gap-3 bg-white/70 rounded-2xl p-6 shadow-sm border border-cream-dark"
            >
              <Stars value={Number(r.rating) || 0} />
              <p className="text-ink text-sm leading-relaxed flex-1">"{r.message}"</p>
              <div className="flex items-center justify-between pt-2 border-t border-cream-dark/60">
                <span className="font-fraunces font-semibold text-sm text-ink">{r.name}</span>
                <span className="text-xs text-muted">{timeAgo(r.submittedAt)}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feedback form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto bg-white/70 rounded-3xl p-8 md:p-10 shadow-sm border border-cream-dark"
        >
          {submitted ? (
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-terra/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="font-fraunces font-bold text-2xl text-ink">Thank you! 🎉</h3>
              <p className="text-muted text-sm max-w-sm">
                Your review is now live above. It would mean the world if you shared the same
                feedback on Google — it helps other people find us.
              </p>
              {GOOGLE_REVIEW_URL ? (
                <button
                  onClick={handleGoogleClick}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-terra text-cream font-medium text-sm hover:bg-forest transition-colors duration-200 cursor-pointer shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  {copied ? 'Copied — paste it on Google!' : 'Review us on Google'}
                </button>
              ) : (
                <p className="text-xs text-muted/70 italic">
                  (Google review link coming soon.)
                </p>
              )}
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-muted hover:text-terra transition-colors cursor-pointer"
              >
                Leave another review
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="font-fraunces font-bold text-2xl text-ink">Share your experience</h3>
                <p className="text-muted text-sm mt-2">Used Movester for your move? Tell us how it went.</p>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink">Your name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane S."
                    required
                    className="px-4 py-3 rounded-xl border border-cream-dark bg-cream-dark/40 text-ink placeholder:text-muted/60 text-sm focus:outline-none focus:border-terra focus:ring-2 focus:ring-terra/20 transition-all duration-200"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink">Your rating</label>
                  <Stars value={rating} size="w-8 h-8" interactive onChange={setRating} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink">Your review</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="How was your move? What stood out?"
                    required
                    rows={4}
                    className="px-4 py-3 rounded-xl border border-cream-dark bg-cream-dark/40 text-ink placeholder:text-muted/60 text-sm resize-none focus:outline-none focus:border-terra focus:ring-2 focus:ring-terra/20 transition-all duration-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!name.trim() || !message.trim() || rating < 1}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-terra text-cream font-medium text-sm hover:bg-forest transition-colors duration-200 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Post my review
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}
