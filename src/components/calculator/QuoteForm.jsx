import React from 'react'
import { CLIENT_PRICING } from '../../data/pricingData'

const MOVE_TYPES = Object.entries(CLIENT_PRICING).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}))

function PillToggle({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-150 cursor-pointer ${
        active
          ? 'bg-terra text-cream border-terra'
          : 'bg-cream/40 text-ink border-[#e8e0d0] hover:border-terra/50'
      }`}
    >
      {children}
    </button>
  )
}

function Field({ label, htmlFor, children, hint }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink mb-2">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted mt-1.5">{hint}</p>}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-[#e8e0d0] bg-white/80 p-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-terra/40'

// Manual input fields. Fully controlled by the parent via `form` + `setField`.
export default function QuoteForm({ form, setField, distanceAuto }) {
  return (
    <div className="space-y-5">
      <Field label="Move type" htmlFor="moveType">
        <select
          id="moveType"
          value={form.moveType}
          onChange={e => setField('moveType', e.target.value)}
          className={inputClass}
        >
          {MOVE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Moving from" htmlFor="fromCity">
          <input
            id="fromCity"
            type="text"
            value={form.fromCity}
            onChange={e => setField('fromCity', e.target.value)}
            placeholder="City or postal code"
            className={inputClass}
          />
        </Field>
        <Field label="Moving to" htmlFor="toCity">
          <input
            id="toCity"
            type="text"
            value={form.toCity}
            onChange={e => setField('toCity', e.target.value)}
            placeholder="City or postal code"
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Estimated distance (km)"
        htmlFor="distanceKm"
        hint={distanceAuto
          ? 'Auto-estimated from your cities — adjust if you know the exact distance.'
          : 'Not sure? We’ll estimate based on the cities you enter.'}
      >
        <input
          id="distanceKm"
          type="number"
          min="0"
          value={form.distanceKm}
          onChange={e => setField('distanceKm', e.target.value)}
          placeholder="0"
          className={inputClass}
        />
      </Field>

      <Field label="Move date" htmlFor="moveDate">
        <input
          id="moveDate"
          type="date"
          value={form.moveDate}
          onChange={e => setField('moveDate', e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-ink mb-2">Stairs at pickup?</p>
          <div className="flex gap-2">
            <PillToggle active={form.stairsPickup} onClick={() => setField('stairsPickup', true)}>Yes</PillToggle>
            <PillToggle active={!form.stairsPickup} onClick={() => setField('stairsPickup', false)}>No</PillToggle>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-ink mb-2">Stairs at drop-off?</p>
          <div className="flex gap-2">
            <PillToggle active={form.stairsDropoff} onClick={() => setField('stairsDropoff', true)}>Yes</PillToggle>
            <PillToggle active={!form.stairsDropoff} onClick={() => setField('stairsDropoff', false)}>No</PillToggle>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink mb-2">Any heavy items? <span className="text-muted font-normal">(piano, gym equipment, appliances)</span></p>
        <div className="flex gap-2">
          <PillToggle active={form.heavyItems} onClick={() => setField('heavyItems', true)}>Yes</PillToggle>
          <PillToggle active={!form.heavyItems} onClick={() => setField('heavyItems', false)}>No</PillToggle>
        </div>
      </div>
    </div>
  )
}
