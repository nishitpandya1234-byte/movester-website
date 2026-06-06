import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import HowItWorksStep from '../3d/HowItWorksStep'
import { useScrollTrigger } from '../../hooks/useScrollTrigger'

const STEPS = [
  {
    step: 1,
    number: '01',
    title: 'Contact us',
    description: 'Send us a WhatsApp or fill out the quote form. We reply within 10 minutes during business hours.',
  },
  {
    step: 2,
    number: '02',
    title: 'Get your quote',
    description: 'A clear, itemized quote — no surprises. We confirm your date and send confirmation paperwork.',
  },
  {
    step: 3,
    number: '03',
    title: 'We handle it',
    description: 'Our crew arrives on time with all supplies. We pack, load, drive, and unload at your new place.',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } }
}

const stepVariants = [
  { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } },
  { hidden: { opacity: 0, y: 50  }, visible: { opacity: 1, y: 0,  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } },
  { hidden: { opacity: 0, x: 50  }, visible: { opacity: 1, x: 0,  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } },
]

function StepCard({ step }) {
  const ref = useRef(null)
  const triggered = useScrollTrigger(ref, 0.1)

  return (
    <motion.div
      ref={ref}
      variants={stepVariants[step.step - 1]}
      className="flex flex-col items-center text-center gap-4"
    >
      {/* 3D Canvas */}
      <div className="flex items-center justify-center">
        <HowItWorksStep step={step.step} triggered={triggered} />
      </div>

      {/* Number */}
      <span className="font-fraunces font-bold text-5xl text-cream-dark leading-none select-none">
        {step.number}
      </span>

      {/* Title */}
      <h3 className="font-fraunces font-semibold text-xl text-ink">{step.title}</h3>

      {/* Description */}
      <p className="text-muted text-sm leading-relaxed max-w-xs">{step.description}</p>
    </motion.div>
  )
}

export default function HowItWorks() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.1 })

  return (
    <section id="how-it-works" className="bg-cream py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium tracking-widest uppercase text-terra mb-3">The process</p>
          <h2 className="font-fraunces font-bold text-4xl md:text-5xl text-ink">
            Three steps, zero stress.
          </h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          ref={containerRef}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8"
        >
          {STEPS.map((step) => (
            <StepCard key={step.step} step={step} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
