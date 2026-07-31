import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

/**
 * Magic UI Number Ticker component.
 * Smoothly animates number counts up or down using spring physics.
 */
export default function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  className = '',
}) {
  const ref = useRef(null)
  const motionValue = useMotionValue(direction === 'down' ? value : 0)
  const springValue = useSpring(motionValue, {
    damping: 25,
    stiffness: 45, // Relaxed stiffness for clear, readable number ticking
  })
  const isInView = useInView(ref, { once: true, margin: '0px' })

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(direction === 'down' ? 0 : value)
      }, delay * 1000)
      return () => clearTimeout(timer)
    }
  }, [isInView, motionValue, direction, value, delay])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat('en-US').format(
          Math.round(latest)
        )
      }
    })
    return () => unsubscribe()
  }, [springValue])

  return (
    <span
      className={`inline-block tabnum font-black ${className}`}
      ref={ref}
    >
      0
    </span>
  )
}
