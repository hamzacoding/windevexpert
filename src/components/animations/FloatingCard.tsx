'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ReactNode } from 'react'

interface FloatingCardProps {
  children: ReactNode
  delay?: number
  className?: string
  hoverScale?: number
  rotateOnHover?: boolean
  glowEffect?: boolean
}

export default function FloatingCard({ 
  children, 
  delay = 0, 
  className = '',
  hoverScale = 1.05,
  rotateOnHover = true,
  glowEffect = true
}: FloatingCardProps) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        y: 50,
        rotateX: 15,
        scale: 0.9
      }}
      animate={inView ? { 
        opacity: 1, 
        y: 0,
        rotateX: 0,
        scale: 1
      } : {}}
      transition={{ 
        duration: 0.8, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{
        scale: hoverScale,
        rotateY: rotateOnHover ? 5 : 0,
        rotateX: rotateOnHover ? -5 : 0,
        z: 50,
        transition: { 
          duration: 0.3,
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }}
      whileTap={{ scale: 0.98 }}
      className={`
        floating-card gpu-optimized relative transform-gpu perspective-1000
        ${glowEffect ? 'hover:shadow-2xl hover:shadow-blue-500/25' : ''}
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
    >
      {/* Glow effect background */}
      {glowEffect && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 rounded-xl blur-xl"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Card content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* 3D depth effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}