import React, { useState, useEffect } from 'react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Areas', href: '#areas' },
  { label: 'Reviews', href: '#reviews' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrollProgress = useMotionValue(0)
  useEffect(() => {
    const updateScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      scrollProgress.set(total > 0 ? window.scrollY / total : 0)
    }
    window.addEventListener('scroll', updateScroll, { passive: true })
    updateScroll()
    return () => window.removeEventListener('scroll', updateScroll)
  }, [scrollProgress])
  const scaleX = useSpring(scrollProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  const truckLeft = useTransform(scrollProgress, [0, 1], ['0%', 'calc(100% - 22px)'])
  const truckOpacity = useTransform(scrollProgress, [0, 0.03], [0, 1])

  const handleNavClick = (e, href) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-cream/80 border-b border-cream-dark/60">
      {/* Scroll progress bar + truck */}
      <div className="absolute top-0 left-0 right-0" style={{ height: '2px', overflow: 'visible' }}>
        <motion.div
          className="absolute inset-0 bg-terra origin-left"
          style={{ scaleX }}
        />
        <motion.div
          className="absolute pointer-events-none"
          style={{ left: truckLeft, top: '2px', opacity: truckOpacity }}
        >
          <svg width="22" height="13" viewBox="0 0 22 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cargo box */}
            <rect x="0" y="0" width="13" height="8" rx="1" fill="#D14D2B"/>
            {/* Cab */}
            <rect x="13" y="1.5" width="7" height="6.5" rx="1" fill="#B8391F"/>
            {/* Windshield */}
            <rect x="14" y="2.5" width="4.5" height="3.5" rx="0.5" fill="#b0d4ea" fillOpacity="0.9"/>
            {/* Front bumper */}
            <rect x="20" y="5.5" width="2" height="3" rx="0.5" fill="#7a2a10"/>
            {/* Rear wheel */}
            <circle cx="4" cy="11" r="2" fill="#161614"/>
            <circle cx="4" cy="11" r="0.8" fill="#555"/>
            {/* Front wheel */}
            <circle cx="16" cy="11" r="2" fill="#161614"/>
            <circle cx="16" cy="11" r="0.8" fill="#555"/>
          </svg>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" onClick={e => handleNavClick(e, '#hero')} className="flex items-center cursor-pointer" aria-label="Movester Moving — home">
          <span className="rounded-lg bg-ink px-2 py-1 inline-flex items-center">
            <img src="/movester-logo.jpg" alt="Movester Moving" className="h-11 w-auto" />
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={e => handleNavClick(e, link.href)}
                className="text-sm font-medium text-muted hover:text-ink transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <a
            href="/calculator"
            className="hidden md:inline-flex items-center px-4 py-2 rounded-lg bg-terra text-cream text-sm font-medium hover:bg-forest transition-colors duration-200 cursor-pointer"
          >
            Get a Quote
          </a>
          <button
            className="md:hidden p-2 text-ink cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-cream border-t border-cream-dark px-6 py-4 flex flex-col gap-4"
        >
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={e => handleNavClick(e, link.href)}
              className="text-base font-medium text-ink cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/calculator"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-terra text-cream text-sm font-medium cursor-pointer"
          >
            Get a Quote
          </a>
        </motion.div>
      )}
    </nav>
  )
}
