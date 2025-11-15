'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ReactNode, useRef } from 'react'

interface ParallaxSectionProps {
  children: ReactNode
  speed?: number
  className?: string
  direction?: 'up' | 'down'
  offset?: number
}

export default function ParallaxSection({ 
  children, 
  speed = 0.5, 
  className = '',
  direction = 'up',
  offset = 0
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'up' 
      ? [offset, -100 * speed] 
      : [-100 * speed, offset]
  )

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={`parallax-element gpu-optimized transform-gpu ${className}`}
    >
      {children}
    </motion.div>
  )
}