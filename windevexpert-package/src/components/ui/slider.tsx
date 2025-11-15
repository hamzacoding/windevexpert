'use client'

import React, { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface SliderProps {
  value: number[]
  onValueChange?: (value: number[]) => void
  max?: number
  min?: number
  step?: number
  className?: string
  disabled?: boolean
}

export function Slider({
  value,
  onValueChange,
  max = 100,
  min = 0,
  step = 1,
  className,
  disabled = false
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const currentValue = value[0] || 0
  const percentage = ((currentValue - min) / (max - min)) * 100

  const updateValue = useCallback((clientX: number) => {
    if (!sliderRef.current || disabled) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    const newValue = min + (percentage / 100) * (max - min)
    
    // Round to nearest step
    const steppedValue = Math.round(newValue / step) * step
    const clampedValue = Math.max(min, Math.min(max, steppedValue))
    
    if (onValueChange) {
      onValueChange([clampedValue])
    }
  }, [min, max, step, disabled, onValueChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return
    
    setIsDragging(true)
    updateValue(e.clientX)
    
    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX)
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return
    
    setIsDragging(true)
    updateValue(e.touches[0].clientX)
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      updateValue(e.touches[0].clientX)
    }
    
    const handleTouchEnd = () => {
      setIsDragging(false)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }

  return (
    <div
      ref={sliderRef}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Track */}
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
        {/* Progress */}
        <div
          className="absolute h-full bg-blue-600 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Thumb */}
      <div
        className={cn(
          'absolute block h-5 w-5 rounded-full border-2 border-blue-600 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          isDragging && 'scale-110',
          disabled && 'border-gray-400'
        )}
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  )
}