import React, { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import Nav from './components/ui/Nav'
import Hero from './components/ui/Hero'
import { ContainerScroll } from './components/ui/ContainerScroll'
import Services from './components/ui/Services'
import HowItWorks from './components/ui/HowItWorks'
import WhyUs from './components/ui/WhyUs'
import Areas from './components/ui/Areas'
import Reviews from './components/ui/Reviews'
import QuoteForm from './components/ui/QuoteForm'
import Footer from './components/ui/Footer'
import LeadChatbot from './components/ui/LeadChatbot'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add(time => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(time => lenis.raf(time * 1000))
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <ContainerScroll
          titleComponent={
            <div className="text-center">
              <p className="text-xs font-medium tracking-widest uppercase text-terra mb-3">Why Movester</p>
              <h2 className="font-fraunces font-bold text-4xl md:text-5xl text-ink mb-4">
                Your move, handled end-to-end.
              </h2>
              <p className="text-muted text-lg max-w-xl mx-auto">
                From the first call to the last box — we've got you covered.
              </p>
            </div>
          }
        >
          <div className="h-full w-full flex items-center justify-center bg-[#F7F1E5] p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl">
              {[
                { icon: '📦', title: 'Pack', desc: 'We bring all supplies' },
                { icon: '🚛', title: 'Load', desc: 'Trained crew, fast & careful' },
                { icon: '🗺️', title: 'Drive', desc: 'Fully insured transport' },
                { icon: '🏠', title: 'Unload', desc: 'Set up at your new place' },
              ].map(item => (
                <div key={item.title} className="flex flex-col items-center text-center gap-3 bg-white/60 rounded-2xl p-6 shadow-sm border border-[#e8e0d0]">
                  <span className="text-4xl">{item.icon}</span>
                  <h3 className="font-fraunces font-bold text-xl text-[#161614]">{item.title}</h3>
                  <p className="text-sm text-[#7A7670]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </ContainerScroll>
        <Services />
        <HowItWorks />
        <WhyUs />
        <Areas />
        <Reviews />
        <QuoteForm />
      </main>
      <Footer />
      <LeadChatbot />
    </div>
  )
}
