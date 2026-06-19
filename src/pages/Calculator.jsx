import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import QuoteForm from '../components/calculator/QuoteForm'
import EstimatePanel from '../components/calculator/EstimatePanel'
import InternalPanel from '../components/calculator/InternalPanel'
import { calculateQuote } from '../utils/calculateQuote'
import { lookupDistance } from '../data/distances'

const INITIAL_FORM = {
  name: '',
  moveType: 'oneBR',
  fromCity: '',
  toCity: '',
  distanceKm: '',
  moveDate: '',
  stairsPickup: false,
  stairsDropoff: false,
  heavyItems: false,
}

export default function Calculator({ internal = false }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [distanceAuto, setDistanceAuto] = useState(false)
  const [mode, setMode] = useState('instant') // 'instant' | 'internal'

  const activeMode = internal ? mode : 'instant'

  // Update one field, with auto-distance handling for the city fields.
  const setField = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }

      if (field === 'fromCity' || field === 'toCity') {
        const km = lookupDistance(next.fromCity, next.toCity)
        if (km != null && (distanceAuto || prev.distanceKm === '')) {
          next.distanceKm = String(km)
          setDistanceAuto(true)
        }
      }
      if (field === 'distanceKm') {
        setDistanceAuto(false)
      }
      return next
    })
  }

  // Recompute the quote whenever inputs that affect it change.
  const result = useMemo(() => {
    if (!form.moveType || form.distanceKm === '') return null
    try {
      return calculateQuote({
        moveType: form.moveType,
        distanceKm: Number(form.distanceKm),
        stairsPickup: form.stairsPickup,
        stairsDropoff: form.stairsDropoff,
        moveDate: form.moveDate || undefined,
        toCity: form.toCity,
        fromCity: form.fromCity,
      })
    } catch {
      return null
    }
  }, [form.moveType, form.distanceKm, form.stairsPickup, form.stairsDropoff, form.moveDate, form.toCity, form.fromCity])

  return (
    <div className="min-h-screen bg-cream text-ink font-sans">
      {/* Header / tab bar */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-cream/85 border-b border-cream-dark/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-1 cursor-pointer">
            <span className="font-fraunces font-bold text-xl text-ink">Movester</span>
            <span className="w-2 h-2 rounded-full bg-terra inline-block mb-0.5" />
          </a>
          <div className="flex items-center gap-1 bg-cream-dark/50 rounded-full p-1">
            <button
              onClick={() => setMode('instant')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                activeMode === 'instant' ? 'bg-terra text-cream' : 'text-ink hover:text-terra'
              }`}
            >
              Instant Estimate
            </button>
            {internal && (
              <button
                onClick={() => setMode('internal')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  activeMode === 'internal' ? 'bg-forest text-cream' : 'text-ink hover:text-forest'
                }`}
              >
                Full Job Costing
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-medium tracking-widest uppercase text-terra mb-3">
            {activeMode === 'internal' ? 'Movester Team Tool' : 'Instant Quote'}
          </p>
          <h1 className="font-fraunces font-bold text-3xl md:text-4xl mb-2">
            {activeMode === 'internal' ? 'Full Job Costing' : 'Get your moving estimate'}
          </h1>
          <p className="text-muted max-w-xl">
            {activeMode === 'internal'
              ? 'Price the job, check your margin, and save it to the job log.'
              : 'Fill in your move details and we’ll give you an instant price range.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: inputs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <QuoteForm form={form} setField={setField} distanceAuto={distanceAuto} />
          </motion.div>

          {/* Right: output */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <EstimatePanel result={result} form={form} />
            {activeMode === 'internal' && result && (
              <InternalPanel result={result} km={Number(form.distanceKm) || 0} form={form} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
