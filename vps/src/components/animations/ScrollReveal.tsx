'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  delay?: number
  duration?: number
  distance?: number
  className?: string
  threshold?: number
  triggerOnce?: boolean
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 50,
  className = '',
  threshold = 0.1,
  triggerOnce = true
}: ScrollRevealProps) {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce
  })

  const getInitialState = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance }
      case 'down':
        return { opacity: 0, y: -distance }
      case 'left':
        return { opacity: 0, x: distance }
      case 'right':
        return { opacity: 0, x: -distance }
      case 'fade':
        return { opacity: 0 }
      default:
        return { opacity: 0, y: distance }
    }
  }

  const getAnimateState = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { opacity: 1, y: 0 }
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 }
      case 'fade':
        return { opacity: 1 }
      default:
        return { opacity: 1, y: 0 }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={getInitialState()}
      animate={inView ? getAnimateState() : getInitialState()}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.25, 0.25, 0.75]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}