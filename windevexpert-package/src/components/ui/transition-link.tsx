'use client'

import Link from 'next/link'
import { usePageTransition } from '@/hooks/use-page-transition'
import { ReactNode } from 'react'

interface TransitionLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function TransitionLink({ href, children, className, onClick }: TransitionLinkProps) {
  const { push } = usePageTransition()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (onClick) {
      onClick()
    }
    
    // Utiliser notre navigation avec transition
    push(href)
  }

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}