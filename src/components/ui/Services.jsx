import React from 'react'
import { motion } from 'framer-motion'

const SERVICES = [
  {
    type: 'apartment',
    title: 'Apartments',
    description: 'Studio to family-sized, we handle tight stairwells and narrow hallways with care.',
    image: '/apartment.jpg',
  },
  {
    type: 'house',
    title: 'Houses',
    description: 'Full home moves with furniture disassembly, reassembly, and protective wrapping.',
    image: '/house.jpg',
  },
  {
    type: 'office',
    title: 'Offices',
    description: 'After-hours and weekend business relocations — zero downtime for your team.',
    image: '/office.avif',
  },
  {
    type: 'student',
    title: 'Students',
    description: 'Dorm and off-campus moves at student-friendly rates. We fit a tight budget.',
    image: '/student.jpg',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

function ServiceCard({ service, index }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8 }}
      className="bg-cream rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Text content */}
      <div className="p-6">
        <h3 className="font-fraunces font-semibold text-xl text-ink mb-2 group-hover:text-terra transition-colors duration-200">
          {service.title}
        </h3>
        <p className="text-sm text-muted leading-relaxed">{service.description}</p>
      </div>
    </motion.div>
  )
}

export default function Services() {
  return (
    <section id="services" className="bg-cream-dark py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium tracking-widest uppercase text-terra mb-3">What we move</p>
          <h2 className="font-fraunces font-bold text-4xl md:text-5xl text-ink">
            Every move, handled.
          </h2>
          <p className="mt-4 text-muted text-lg max-w-xl mx-auto">
            Whether it's a studio apartment or a full office, our crew adapts to any move.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.type} service={service} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
