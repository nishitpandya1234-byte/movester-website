import React, { useState } from 'react'
import { motion } from 'framer-motion'
import MarginDisplay from './MarginDisplay'
import { calculateTruckCost, calculateGas } from '../../utils/calculateQuote'
import { TRUCK_COSTS, WORKER_COSTS } from '../../data/pricingData'
import { generateWhatsAppMessage } from '../../utils/generateWhatsApp'

const TRUCK_OPTIONS = Object.entries(TRUCK_COSTS).map(([value, cfg]) => ({ value, label: cfg.name }))

const controlInput =
  'w-full rounded-xl border border-[#e8e0d0] bg-white/80 p-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terra/40'

function Row({ label, amount, negative }) {
  const formatted = `${negative ? '−' : ''}$${Math.abs(amount).toLocaleString()}`
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#efe7d4] text-sm">
      <span className="text-[#3A3935]">{label}</span>
      <span className={`font-medium tabular-nums ${negative ? 'text-terra' : 'text-ink'}`}>{formatted}</span>
    </div>
  )
}

// Internal-only profit breakdown. Recomputes truck/gas/worker costs locally so
// the truck + worker overrides take effect without touching the quote engine.
export default function InternalPanel({ result, km, form }) {
  const autoTruckKey = result.internal.truckKey
  const [truckKey, setTruckKey] = useState(autoTruckKey)
  const [workerCount, setWorkerCount] = useState(result.quote.workerCount)
  const [workerRate, setWorkerRate] = useState(WORKER_COSTS.dailyMidpoint)
  const [suppliesCost, setSuppliesCost] = useState(0)
  const [clientCharge, setClientCharge] = useState('')
  const [savedAt, setSavedAt] = useState(null)
  const [copied, setCopied] = useState(false)

  // Keep auto-suggestions in sync when the underlying job changes.
  const [lastAutoTruck, setLastAutoTruck] = useState(autoTruckKey)
  const [lastAutoWorkers, setLastAutoWorkers] = useState(result.quote.workerCount)
  if (autoTruckKey !== lastAutoTruck) {
    setLastAutoTruck(autoTruckKey)
    setTruckKey(autoTruckKey)
  }
  if (result.quote.workerCount !== lastAutoWorkers) {
    setLastAutoWorkers(result.quote.workerCount)
    setWorkerCount(result.quote.workerCount)
  }

  const truck = TRUCK_COSTS[truckKey]
  const truckCost = calculateTruckCost(truckKey, km)
  const insurance = typeof truck.insurance === 'number' ? truck.insurance : 30 // homedepot uses own (~$30)
  const gasCost = calculateGas(truckKey, km)
  const workerCost = workerCount * workerRate
  const supplies = Number(suppliesCost) || 0
  const totalCost = truckCost + gasCost + workerCost + supplies

  const midpoint = Math.round((result.quote.totalMin + result.quote.totalMax) / 2)
  const revenue = clientCharge !== '' ? Number(clientCharge) : midpoint
  const profit = revenue - totalCost
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0

  const handleCopy = () => {
    const message = generateWhatsAppMessage({
      name: form.name,
      moveType: form.moveType,
      fromCity: form.fromCity,
      toCity: form.toCity,
      moveDate: form.moveDate,
      stairsPickup: form.stairsPickup,
      stairsDropoff: form.stairsDropoff,
      quote: result.quote,
    })
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    const entry = {
      savedAt: new Date().toISOString(),
      move: {
        moveType: form.moveType,
        fromCity: form.fromCity,
        toCity: form.toCity,
        distanceKm: km,
        moveDate: form.moveDate,
        stairsPickup: form.stairsPickup,
        stairsDropoff: form.stairsDropoff,
      },
      clientQuote: result.quote,
      internal: {
        truckKey, truckCost, insurance, gasCost,
        workerCount, workerRate, workerCost,
        suppliesCost: supplies, totalCost, revenue, profit, margin,
      },
    }
    const KEY = 'movester-job-log'
    let log = []
    try { log = JSON.parse(localStorage.getItem(KEY) || '[]') } catch { log = [] }
    log.push(entry)
    localStorage.setItem(KEY, JSON.stringify(log))
    setSavedAt(Date.now())
    setTimeout(() => setSavedAt(null), 2500)
  }

  return (
    <div className="space-y-5">
      <MarginDisplay margin={margin} profit={profit} />

      {/* Profit breakdown table */}
      <div className="rounded-2xl border border-[#e8e0d0] bg-white/80 p-6">
        <p className="text-xs font-medium tracking-widest uppercase text-muted mb-3">Profit breakdown (internal)</p>
        <Row label="Client charge" amount={revenue} />
        <Row label={`Truck — ${truck.name}`} amount={truckCost} negative />
        <Row label="Insurance" amount={insurance} negative />
        <Row label="Gas estimate" amount={gasCost} negative />
        <Row label={`Worker cost (${workerCount} × $${workerRate})`} amount={workerCost} negative />
        {supplies > 0 && <Row label="Supplies" amount={supplies} negative />}
        <div className="flex items-center justify-between pt-3 mt-1">
          <span className="font-fraunces font-bold text-ink">Net profit</span>
          <span className={`font-fraunces font-bold text-lg tabular-nums ${profit < 0 ? 'text-terra' : 'text-forest'}`}>
            ${profit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-[#e8e0d0] bg-white/80 p-6 space-y-4">
        <p className="text-xs font-medium tracking-widest uppercase text-muted">Adjust costing</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="workerCount" className="block text-sm font-medium text-ink mb-1.5">Workers</label>
            <input
              id="workerCount" type="number" min="1" value={workerCount}
              onChange={e => setWorkerCount(Math.max(1, Number(e.target.value) || 1))}
              className={controlInput}
            />
          </div>
          <div>
            <label htmlFor="clientCharge" className="block text-sm font-medium text-ink mb-1.5">
              Client charge <span className="text-muted font-normal">(override)</span>
            </label>
            <input
              id="clientCharge" type="number" min="0" value={clientCharge}
              onChange={e => setClientCharge(e.target.value)}
              placeholder={`${midpoint} (midpoint)`}
              className={controlInput}
            />
          </div>
        </div>

        <div>
          <label htmlFor="workerRate" className="block text-sm font-medium text-ink mb-1.5">
            Worker daily rate: <span className="text-terra font-semibold">${workerRate}</span>
          </label>
          <input
            id="workerRate" type="range" min={WORKER_COSTS.dailyMin} max={WORKER_COSTS.dailyMax} step="5"
            value={workerRate}
            onChange={e => setWorkerRate(Number(e.target.value))}
            className="w-full accent-terra cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted mt-0.5">
            <span>${WORKER_COSTS.dailyMin}</span><span>${WORKER_COSTS.dailyMax}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="truckSelect" className="block text-sm font-medium text-ink mb-1.5">Truck</label>
            <select
              id="truckSelect" value={truckKey}
              onChange={e => setTruckKey(e.target.value)}
              className={controlInput}
            >
              {TRUCK_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="supplies" className="block text-sm font-medium text-ink mb-1.5">Supplies ($)</label>
            <input
              id="supplies" type="number" min="0" value={suppliesCost}
              onChange={e => setSuppliesCost(e.target.value)}
              placeholder="0"
              className={controlInput}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center rounded-full border border-terra/40 text-terra font-medium px-5 py-2.5 text-sm hover:bg-terra/5 transition-colors cursor-pointer"
        >
          {copied ? 'Copied ✓' : 'Copy quote for WhatsApp'}
        </button>
        <button
          onClick={handleSave}
          className="flex-1 inline-flex items-center justify-center rounded-full bg-forest text-cream font-medium px-5 py-2.5 text-sm hover:bg-ink transition-colors cursor-pointer"
        >
          {savedAt ? 'Saved to log ✓' : 'Save job to log'}
        </button>
      </div>
    </div>
  )
}
