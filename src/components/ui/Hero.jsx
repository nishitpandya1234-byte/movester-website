import React, { Suspense } from 'react'
import { motion } from 'framer-motion'
import HeroScene from '../3d/HeroScene'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 1.0 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

export default function Hero() {
  const handleScroll = (href) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="relative h-screen min-h-[700px] overflow-hidden bg-cream">
      {/* 3D Canvas - full background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full bg-cream" />}>
          <HeroScene />
        </Suspense>
      </div>

      {/* Gradient overlay — left side readable */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-cream/95 via-cream/60 to-cream/10 pointer-events-none" />

      {/* Faded brand watermark — fills the empty right side of the hero.
          mix-blend-screen drops the logo's black background so only a soft,
          light ghost of the mark + wordmark shows over the cream. */}
      <motion.img
        src="/movester-logo.jpg"
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ delay: 1.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:block absolute z-[2] right-[7%] top-1/2 -translate-y-1/2 w-[34rem] max-w-[42vw] mix-blend-screen pointer-events-none select-none"
      />

      {/* HTML Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-between px-8 md:px-16 lg:px-24">
        <div className="max-w-xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5"
          >
            {/* Eyebrow */}
            <motion.p
              variants={itemVariants}
              className="text-xs font-medium tracking-widest uppercase text-muted"
            >
              Canadian Movers &amp; Packers
            </motion.p>

            {/* H1 */}
            <motion.h1
              variants={itemVariants}
              className="font-fraunces font-bold text-5xl lg:text-7xl text-ink leading-tight"
            >
              Moving day,<br />made painless.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-muted leading-relaxed max-w-sm"
            >
              We show up with a truck and crew. You just point and we pack.
            </motion.p>

            {/* Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mt-1">
              <button
                onClick={() => handleScroll('#quote')}
                className="px-6 py-3 rounded-xl bg-terra text-cream font-medium hover:bg-forest transition-colors duration-200 cursor-pointer shadow-sm"
              >
                Get a Free Quote
              </button>
              <button
                onClick={() => handleScroll('#how-it-works')}
                className="px-6 py-3 rounded-xl border-2 border-forest text-forest font-medium hover:bg-forest hover:text-cream transition-all duration-200 cursor-pointer"
              >
                See How It Works
              </button>
            </motion.div>

            {/* Trust bar */}
            <motion.p
              variants={itemVariants}
              className="text-xs text-muted mt-1 tracking-wide"
            >
              No hidden fees &nbsp;&middot;&nbsp; Fully insured &nbsp;&middot;&nbsp; Same-day available
            </motion.p>
          </motion.div>
        </div>
        <div className="hidden lg:flex flex-col gap-4 mr-8">
          {[
            { value: '500+', label: 'Happy Moves' },
            { value: '4.9★', label: 'Customer Rating' },
            { value: '10 min', label: 'Quote Response' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="bg-cream/80 backdrop-blur-sm border border-cream-dark/60 rounded-2xl px-6 py-4 shadow-sm min-w-[160px]"
            >
              <p className="font-fraunces font-bold text-3xl text-ink">{stat.value}</p>
              <p className="text-xs text-muted mt-0.5 tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
      >
        <span className="text-xs text-muted tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-0.5 h-8 bg-muted/40 rounded-full"
        />
      </motion.div>
    </section>
  )
}
