import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Replace with your deployed Google Apps Script web app URL (see scripts/lead-sheet-webhook.gs)
const LEAD_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzDG3trhCpxMuAoajtT-S3eIAEodzV0aKcCzaHy0G7xXIaCEJlHQ9xpxyFyqoB6tz8Nvw/exec'

const SIZES = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', 'Full House', 'Office']
const BUDGETS = ['Under $500', '$500 – $1,000', '$1,000 – $2,000', '$2,000+', 'Not sure yet']

const STEPS = [
  {
    key: 'name',
    bot: () => "Hi! I'm Movester's assistant 👋 I can put together a quick quote for you — just need a few details. What's your name?",
    type: 'text',
    placeholder: 'Jane Smith',
  },
  {
    key: 'phone',
    bot: (a) => `Nice to meet you, ${a.name.split(' ')[0]}! What's the best WhatsApp number to reach you on?`,
    type: 'tel',
    placeholder: '+1 (416) 555-0123',
  },
  {
    key: 'size',
    bot: () => 'What size is your move?',
    type: 'choice',
    options: SIZES,
  },
  {
    key: 'from',
    bot: () => "Where are you moving from?",
    type: 'text',
    placeholder: '123 King St W, Toronto, ON',
  },
  {
    key: 'to',
    bot: () => 'And where are you headed?',
    type: 'text',
    placeholder: '456 Queen St E, Mississauga, ON',
  },
  {
    key: 'date',
    bot: () => "When's the big day?",
    type: 'date',
  },
  {
    key: 'budget',
    bot: () => "Last one — roughly what's your budget for this move?",
    type: 'choice',
    options: BUDGETS,
  },
]

function logLeadToSheet(answers) {
  if (!LEAD_SHEET_WEBHOOK_URL) return
  fetch(LEAD_SHEET_WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...answers, source: 'website-chatbot', submittedAt: new Date().toISOString() }),
  }).catch(() => {})
}

function sendToWhatsApp(answers) {
  const message = `Hi! I'd like a moving quote.\n\nName: ${answers.name}\nPhone: ${answers.phone}\nFrom: ${answers.from}\nTo: ${answers.to}\nDate: ${answers.date}\nSize: ${answers.size}\nBudget: ${answers.budget}`
  const url = `https://wa.me/14372692714?text=${encodeURIComponent(message)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

function TypingBubble() {
  return (
    <div className="flex items-center gap-1 bg-cream-dark rounded-2xl rounded-bl-sm px-4 py-3 w-fit">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export default function LeadChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [typing, setTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [done, setDone] = useState(false)
  const scrollRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  // Kick off the conversation the first time the panel opens
  useEffect(() => {
    if (open && !startedRef.current) {
      startedRef.current = true
      askStep(0, {})
    }
  }, [open])

  const askStep = (index, currentAnswers) => {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { from: 'bot', text: STEPS[index].bot(currentAnswers) }])
    }, 550)
  }

  const advance = (value) => {
    const step = STEPS[stepIndex]
    const nextAnswers = { ...answers, [step.key]: value }
    setAnswers(nextAnswers)
    setMessages(prev => [...prev, { from: 'user', text: value }])
    setInputValue('')

    const nextIndex = stepIndex + 1
    if (nextIndex < STEPS.length) {
      setStepIndex(nextIndex)
      askStep(nextIndex, nextAnswers)
    } else {
      setStepIndex(nextIndex)
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        setMessages(prev => [...prev, {
          from: 'bot',
          text: `Perfect, that's everything I need! Here's a quick summary:\n\n${nextAnswers.name} • ${nextAnswers.phone}\n${nextAnswers.from} → ${nextAnswers.to}\n${nextAnswers.size} • ${nextAnswers.date} • ${nextAnswers.budget}\n\nTap below and I'll send this straight to our team on WhatsApp — we usually reply within 10 minutes.`,
        }])
        setDone(true)
        logLeadToSheet(nextAnswers)
      }, 550)
    }
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    advance(inputValue.trim())
  }

  const goBack = () => {
    if (stepIndex === 0 || typing) return
    const prevStep = STEPS[stepIndex - 1]

    // Drop the current question and the user's answer to the previous one,
    // leaving the previous question's bot message as the last in the thread
    setMessages(prev => {
      const trimmed = [...prev]
      if (trimmed[trimmed.length - 1]?.from === 'bot') trimmed.pop()
      if (trimmed[trimmed.length - 1]?.from === 'user') trimmed.pop()
      return trimmed
    })
    setInputValue(answers[prevStep.key] ?? '')
    setAnswers(prev => {
      const next = { ...prev }
      delete next[prevStep.key]
      return next
    })
    setStepIndex(stepIndex - 1)
  }

  const currentStep = STEPS[stepIndex]

  return (
    <>
      {/* Floating launcher button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-terra text-cream shadow-xl flex items-center justify-center cursor-pointer"
        aria-label={open ? 'Close chat' : 'Open chat with Movester assistant'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.svg key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[min(92vw,380px)] h-[min(70vh,560px)] bg-cream rounded-2xl shadow-2xl border border-cream-dark flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-forest text-cream flex-shrink-0">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-cream/10 transition-colors duration-150 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="w-9 h-9 rounded-full bg-cream/15 flex items-center justify-center text-lg">📦</div>
              <div className="flex flex-col">
                <span className="font-fraunces font-bold text-sm leading-tight">Movester Assistant</span>
                <span className="text-xs text-cream/70 leading-tight">Usually replies in a few minutes</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`max-w-[85%] whitespace-pre-line text-sm leading-relaxed px-4 py-3 rounded-2xl ${
                    m.from === 'bot'
                      ? 'self-start bg-cream-dark text-ink rounded-bl-sm'
                      : 'self-end bg-terra text-cream rounded-br-sm'
                  }`}
                >
                  {m.text}
                </motion.div>
              ))}
              {typing && <div className="self-start"><TypingBubble /></div>}

              {done && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="self-start flex flex-col gap-2 w-full">
                  <button
                    onClick={() => sendToWhatsApp(answers)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-terra text-cream font-medium text-sm hover:bg-forest transition-colors duration-200 cursor-pointer shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Send to Movester on WhatsApp
                  </button>
                  <p className="text-xs text-center text-muted">We'll reply within 10 minutes.</p>
                </motion.div>
              )}
            </div>

            {/* Input area */}
            {!done && !typing && currentStep && (
              <div className="px-4 py-3 border-t border-cream-dark flex-shrink-0 flex flex-col gap-2.5">
                {currentStep.type === 'choice' ? (
                  <div className="flex flex-wrap gap-2">
                    {currentStep.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => advance(opt)}
                        className="px-3.5 py-2 rounded-full border border-terra/30 bg-terra/5 text-ink text-xs font-medium hover:bg-terra hover:text-cream hover:border-terra transition-colors duration-150 cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
                    <input
                      type={currentStep.type}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={currentStep.placeholder}
                      autoFocus
                      required
                      className="flex-1 px-4 py-2.5 rounded-xl border border-cream-dark bg-cream-dark/50 text-ink placeholder:text-muted/60 text-sm focus:outline-none focus:border-terra focus:ring-2 focus:ring-terra/20 transition-all duration-200"
                    />
                    <button
                      type="submit"
                      aria-label="Send"
                      className="w-10 h-10 flex-shrink-0 rounded-xl bg-terra text-cream flex items-center justify-center hover:bg-forest transition-colors duration-200 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </button>
                  </form>
                )}

                {stepIndex > 0 && (
                  <button
                    onClick={goBack}
                    className="self-start flex items-center gap-1 text-xs text-muted hover:text-terra transition-colors duration-150 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Go back
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
