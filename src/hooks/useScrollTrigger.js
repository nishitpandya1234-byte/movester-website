import { useState, useEffect } from 'react'

export function useScrollTrigger(ref, threshold = 0.2) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [ref, threshold])

  return inView
}
