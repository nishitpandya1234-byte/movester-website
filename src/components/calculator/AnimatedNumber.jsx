import React, { useEffect } from 'react'
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion'

// Spring-based count-up number. Animates from its previous value to `value`
// whenever `value` changes. `format` maps the rounded number to a string.
export default function AnimatedNumber({ value, format = (n) => Math.round(n).toLocaleString(), className }) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 90, damping: 18, restDelta: 0.5 })
  const display = useTransform(spring, (latest) => format(latest))

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  return <motion.span className={className}>{display}</motion.span>
}
