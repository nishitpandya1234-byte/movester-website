import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedNumber from './AnimatedNumber'

// Large, color-coded profit-margin readout with a contextual banner.
// Red < 25%, amber 25–39%, green >= 40%.
export default function MarginDisplay({ margin, profit }) {
  const tier =
    margin < 25 ? 'red' :
    margin < 40 ? 'amber' : 'green'

  const color = {
    red: '#D14D2B',     // terra
    amber: '#B7791F',
    green: '#2D4A3E',   // forest
  }[tier]

  const banner =
    tier === 'red'
      ? { text: '⚠️ Below 25% threshold — adjust pricing or cut costs', bg: 'bg-terra/10', fg: 'text-terra' }
      : tier === 'green'
      ? { text: '✅ Great margin on this job', bg: 'bg-forest/10', fg: 'text-forest' }
      : null

  return (
    <div className="rounded-2xl border border-[#e8e0d0] bg-white/80 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase text-muted mb-1">Profit margin</p>
          <motion.div
            className="font-fraunces font-bold text-5xl leading-none"
            animate={{ color }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedNumber value={margin} format={(n) => `${Math.round(n)}%`} />
          </motion.div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium tracking-widest uppercase text-muted mb-1">Net profit</p>
          <div className="font-fraunces font-bold text-2xl text-ink">
            <AnimatedNumber value={profit} format={(n) => `$${Math.round(n).toLocaleString()}`} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-medium ${banner.bg} ${banner.fg}`}>
              {banner.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
