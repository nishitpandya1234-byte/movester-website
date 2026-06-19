import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function formatRange(min, max) {
  if (min === max) return `$${min.toLocaleString()}`
  return `$${min.toLocaleString()}–$${max.toLocaleString()}`
}

// Collapsible breakdown of the client-visible line items.
export default function LineItemsTable({ lineItems }) {
  const [open, setOpen] = useState(false)
  const visibleItems = lineItems.filter(item => !item.internal)

  return (
    <div className="border-t border-[#e8e0d0] pt-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-terra hover:underline cursor-pointer"
        aria-expanded={open}
      >
        {open ? 'Hide breakdown' : 'See breakdown'}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mt-3 space-y-1.5"
          >
            {visibleItems.map((item, i) => (
              <motion.li
                key={item.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                className="flex items-baseline justify-between text-sm gap-4"
              >
                <span className="text-[#3A3935]">{item.label}</span>
                <span className="font-medium text-ink whitespace-nowrap">{formatRange(item.min, item.max)}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
