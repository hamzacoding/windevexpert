import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
    
    const variants = {
      default: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
      destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
      outline: 'border-gray-300 text-gray-900 hover:bg-gray-50',
      success: 'border-transparent bg-green-600 text-white hover:bg-green-700',
      warning: 'border-transparent bg-yellow-600 text-white hover:bg-yellow-700'
    }
    
    const sizes = {
      sm: 'px-2.5 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base'
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }