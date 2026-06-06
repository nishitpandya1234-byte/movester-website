import React, { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import FormTruck from '../3d/FormTruck'

const FIELDS = [
  { id: 'name', label: 'Your name', type: 'text', placeholder: 'Jane Smith' },
  { id: 'phone', label: 'Phone number', type: 'tel', placeholder: '+1 (416) 555-0123' },
  { id: 'from', label: 'Moving from', type: 'text', placeholder: '123 King St W, Toronto, ON' },
  { id: 'to', label: 'Moving to', type: 'text', placeholder: '456 Queen St E, Mississauga, ON' },
  { id: 'date', label: 'Move date', type: 'date' },
]

const SIZES = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', 'Full House', 'Office']

export default function QuoteForm() {
  const [form, setForm] = useState({ name: '', phone: '', from: '', to: '', date: '', size: '' })

  const filledCount = Object.values(form).filter(v => v.trim() !== '').length
  const totalFields = 6
  const progress = filledCount / totalFields

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const message = `Hi! I'd like a quote.\n\nName: ${form.name}\nPhone: ${form.phone}\nFrom: ${form.from}\nTo: ${form.to}\nDate: ${form.date}\nSize: ${form.size}`
    const url = `https://wa.me/14372692714?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="quote" className="bg-cream-dark py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8"
          >
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-terra mb-3">Free estimate</p>
              <h2 className="font-fraunces font-bold text-4xl md:text-5xl text-ink">
                Get a free quote
              </h2>
              <p className="mt-4 text-muted text-lg leading-relaxed">
                Fill out the form and we'll send your quote back within 10 minutes via WhatsApp.
                No commitment, no pressure.
              </p>
            </div>

            {/* Contact details */}
            <div className="flex flex-col gap-4">
              <a
                href="mailto:hello@movestermoving.ca"
                className="flex items-center gap-3 text-ink hover:text-terra transition-colors duration-200 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-terra/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <span className="text-sm font-medium">hello@movestermoving.ca</span>
              </a>

              <a
                href="https://wa.me/14372692714"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-ink hover:text-terra transition-colors duration-200 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">WhatsApp us directly</span>
              </a>

              <a
                href="tel:+14372692714"
                className="flex items-center gap-3 text-ink hover:text-terra transition-colors duration-200 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-terra/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">+1 437-269-2714</span>
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-col gap-3">
              {['No hidden fees — ever', 'Fully insured crew', 'Same-day availability'].map(badge => (
                <div key={badge} className="flex items-center gap-2 text-sm text-muted">
                  <svg className="w-4 h-4 text-terra flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-cream rounded-2xl shadow-xl p-8"
          >
            {/* Truck progress strip */}
            <div className="mb-6 -mx-8 -mt-8 rounded-t-2xl overflow-hidden">
              <Suspense fallback={<div className="w-full h-[90px] bg-cream-dark" />}>
                <FormTruck progress={progress} />
              </Suspense>
            </div>

            {/* Progress indicator */}
            <div className="mb-6 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-cream-dark rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-terra rounded-full"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs text-muted whitespace-nowrap">{filledCount}/{totalFields} fields</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {FIELDS.map(field => (
                <div key={field.id} className="flex flex-col gap-1.5">
                  <label htmlFor={field.id} className="text-xs font-medium text-ink uppercase tracking-wide">
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.id]}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream-dark/50 text-ink placeholder:text-muted/60 text-sm focus:outline-none focus:border-terra focus:ring-2 focus:ring-terra/20 transition-all duration-200"
                  />
                </div>
              ))}

              {/* Move size select */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="size" className="text-xs font-medium text-ink uppercase tracking-wide">
                  Move size
                </label>
                <select
                  id="size"
                  value={form.size}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-cream-dark bg-cream-dark/50 text-ink text-sm focus:outline-none focus:border-terra focus:ring-2 focus:ring-terra/20 transition-all duration-200 cursor-pointer"
                >
                  <option value="">Select size...</option>
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button
                type="submit"
                className="mt-2 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-terra text-cream font-medium text-base hover:bg-forest transition-colors duration-200 cursor-pointer shadow-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Send via WhatsApp
              </button>

              <p className="text-xs text-center text-muted mt-1">
                Opens WhatsApp with your details pre-filled. We reply within 10 minutes.
              </p>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
