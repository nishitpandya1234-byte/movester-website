import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedNumber from './AnimatedNumber'
import LineItemsTable from './LineItemsTable'
import TruckInfo from './TruckInfo'
import { generateWhatsAppMessage, WHATSAPP_NUMBER } from '../../utils/generateWhatsApp'

function Notice({ icon, children }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-cream-dark/50 px-4 py-3 text-sm text-[#3A3935]">
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  )
}

// Client-facing output. `result` is the calculateQuote() return (or null).
export default function EstimatePanel({ result, form }) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-[#e0d6c2] bg-cream/40 p-10 min-h-[320px]">
        <span className="text-4xl mb-3">📦</span>
        <p className="font-fraunces font-bold text-xl text-ink mb-1">Your estimate appears here</p>
        <p className="text-sm text-muted max-w-xs">Fill in your move details or describe it above, and we’ll put together an instant range.</p>
      </div>
    )
  }

  const { quote } = result
  const { isMonthEnd: monthEnd } = result.internal.flags

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage({
      name: form.name,
      moveType: form.moveType,
      fromCity: form.fromCity,
      toCity: form.toCity,
      moveDate: form.moveDate,
      stairsPickup: form.stairsPickup,
      stairsDropoff: form.stairsDropoff,
      quote,
    })
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[#e8e0d0] bg-white/80 p-6 space-y-5"
    >
      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-terra mb-2">Your estimate</p>
        <div className="font-fraunces font-bold text-5xl md:text-6xl text-terra leading-none flex items-baseline flex-wrap gap-x-2">
          <span className="flex items-baseline">
            $<AnimatedNumber value={quote.totalMin} />
          </span>
          <span className="text-muted text-3xl md:text-4xl">–</span>
          <span className="flex items-baseline">
            $<AnimatedNumber value={quote.totalMax} />
          </span>
        </div>
        <p className="text-sm text-muted mt-2">Includes HST · This is an estimate range, confirmed after the job.</p>
      </div>

      <TruckInfo workerCount={quote.workerCount} truckType={quote.truckType} />

      <div className="space-y-2">
        {monthEnd && (
          <Notice icon="📅">Peak period — a small month-end surcharge applies.</Notice>
        )}
        {quote.isLongDistance && (
          <Notice icon="🚛">Long distance job — the rate includes the full round-trip KM.</Notice>
        )}
      </div>

      <LineItemsTable lineItems={quote.lineItems} />

      <div className="rounded-xl bg-forest/5 px-4 py-3 text-sm text-forest">
        Your truck and crew will be ready — we handle the heavy lifting end-to-end.
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <motion.button
          onClick={handleWhatsApp}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-terra text-cream font-medium px-6 py-3.5 text-sm hover:bg-forest transition-colors cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Get this quote confirmed on WhatsApp →
        </motion.button>
        <a
          href="/#quote"
          className="inline-flex items-center justify-center rounded-full border border-terra/40 text-terra font-medium px-6 py-3 text-sm hover:bg-terra/5 transition-colors cursor-pointer"
        >
          Book this date
        </a>
      </div>
    </motion.div>
  )
}
