import React, { useRef, Suspense } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import ParticleField from '../3d/ParticleField'

const STATS = [
  { value: 10, suffix: ' min', label: 'Reply time' },
  { value: 100, suffix: '%', label: 'Transparent pricing' },
  { value: 7, suffix: ' days', label: 'A week' },
  { value: 0, prefix: '$', suffix: '', label: 'Hidden fees' },
]

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'No Hidden Fees',
    description: 'Our quotes are all-in. Stairs, long carry, fuel — included upfront.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Fully Insured',
    description: 'Full cargo and liability insurance on every move, every time.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Same-Day Available',
    description: 'Last-minute move? We often have same-day availability. Just ask.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Local Experts',
    description: 'Born and raised in the GTA. We know every building, every neighbourhood.',
  },
]

function CountUp({ value, prefix = '', suffix = '', inView }) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, v => Math.round(v))
  const [display, setDisplay] = React.useState(0)

  React.useEffect(() => {
    if (!inView) return
    const controls = animate(motionValue, value, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: v => setDisplay(Math.round(v)),
    })
    return controls.stop
  }, [inView, value, motionValue])

  return (
    <span className="font-fraunces font-bold text-4xl text-cream">
      {prefix}{display}{suffix}
    </span>
  )
}

function StatItem({ stat, inView }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <CountUp value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix} inView={inView} />
      <span className="text-xs text-cream/50 tracking-wide uppercase">{stat.label}</span>
    </div>
  )
}

function FeatureCard({ feature }) {
  return (
    <motion.div
      whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.10)' }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3 transition-colors duration-200 cursor-default"
    >
      <div className="text-terra">{feature.icon}</div>
      <h3 className="font-fraunces font-semibold text-lg text-cream">{feature.title}</h3>
      <p className="text-sm text-cream/60 leading-relaxed">{feature.description}</p>
    </motion.div>
  )
}

export default function WhyUs() {
  const sectionRef = useRef(null)
  const statsRef = useRef(null)
  const inView = useInView(statsRef, { once: true, margin: '-100px' })

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  }
  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section id="why-us" ref={sectionRef} className="relative bg-ink text-cream py-24 overflow-hidden">
      {/* Particle background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <ParticleField sectionRef={sectionRef} />
        </Suspense>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium tracking-widest uppercase text-terra mb-3">Why Movester</p>
          <h2 className="font-fraunces font-bold text-4xl md:text-5xl text-cream">Why Movester?</h2>
        </motion.div>

        {/* Stats row */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 bg-white/5 rounded-2xl p-8 border border-white/10"
        >
          {STATS.map(stat => (
            <StatItem key={stat.label} stat={stat} inView={inView} />
          ))}
        </div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map(feature => (
            <motion.div key={feature.title} variants={cardVariants}>
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
