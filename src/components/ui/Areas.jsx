import React, { useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
import AreaMap from '../3d/AreaMap'

const CITIES = [
  'Brampton', 'Mississauga', 'Ajax', 'Brantford', 'Cambridge',
  'Oshawa', 'Whitby', 'Scarborough', 'North York', 'Bowmanville',
  'Toronto', 'Waterloo', 'Kitchener'
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
}

const pillVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } }
}

export default function Areas() {
  const sectionRef = useRef(null)

  return (
    <section id="areas" ref={sectionRef} className="bg-cream py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-medium tracking-widest uppercase text-terra mb-3">Service area</p>
          <h2 className="font-fraunces font-bold text-4xl md:text-5xl text-ink">
            We serve the Greater Toronto Area
          </h2>
          <p className="mt-4 text-muted text-lg max-w-xl mx-auto">
            From Kitchener to Bowmanville, Brantford to Oshawa — we cover Southern Ontario.
          </p>
        </motion.div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-cream-dark mb-10">
          <Suspense fallback={<div className="w-full h-[400px] bg-cream-dark rounded-2xl" />}>
            <AreaMap sectionRef={sectionRef} />
          </Suspense>
        </div>

        {/* City pills */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {CITIES.map(city => (
            <motion.span
              key={city}
              variants={pillVariants}
              className="px-4 py-1.5 rounded-full border-2 border-terra text-terra text-sm font-medium cursor-default hover:bg-terra hover:text-cream transition-colors duration-200"
            >
              {city}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
