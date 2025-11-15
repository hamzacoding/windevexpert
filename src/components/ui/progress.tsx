'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value?: number
  max?: number
  className?: string
  indicatorClassName?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
  showValue?: boolean
}

export function Progress({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
  size = 'md',
  variant = 'default',
  showValue = false
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  }

  return (
    <div className="w-full space-y-1">
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-gray-200',
          sizeClasses[size],
          className
        )}
      >
        <div
          className={cn(
            'h-full w-full flex-1 transition-all duration-300 ease-in-out',
            variantClasses[variant],
            indicatorClassName
          )}
          style={{
            transform: `translateX(-${100 - percentage}%)`
          }}
        />
      </div>
      
      {showValue && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>{Math.round(percentage)}%</span>
          <span>{value} / {max}</span>
        </div>
      )}
    </div>
  )
}