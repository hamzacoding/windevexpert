'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  shape: 'circle' | 'square' | 'triangle'
}

interface AnimatedBackgroundProps {
  particleCount?: number
  className?: string
  colors?: string[]
}

export default function AnimatedBackground({ 
  particleCount = 20,
  className = '',
  colors = ['bg-blue-400/10', 'bg-purple-400/10', 'bg-indigo-400/10', 'bg-cyan-400/10']
}: AnimatedBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = []
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 60 + 20,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 5,
          shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle'
        })
      }
      setParticles(newParticles)
    }

    generateParticles()
  }, [particleCount])

  const getShapeClasses = (shape: string) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full'
      case 'square':
        return 'rounded-lg'
      case 'triangle':
        return 'rounded-sm transform rotate-45'
      default:
        return 'rounded-full'
    }
  }

  return (
    <div className={`animated-background gpu-optimized absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50" />
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute ${colors[particle.id % colors.length]} ${getShapeClasses(particle.shape)} blur-sm`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, -15, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Geometric shapes */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 border-2 border-blue-300/30 rounded-full"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="absolute top-40 right-20 w-24 h-24 border-2 border-purple-300/30 rounded-lg"
        animate={{
          rotate: [0, -360],
          y: [0, -20, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Floating lines */}
      <motion.div
        className="absolute top-1/3 right-1/3 w-40 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent"
        animate={{
          rotate: [0, 180, 360],
          scaleX: [1, 1.5, 1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}