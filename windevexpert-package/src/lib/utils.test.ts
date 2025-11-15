import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('Utils Functions', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      expect(cn('px-2 py-1', 'bg-blue-500')).toBe('px-2 py-1 bg-blue-500')
    })

    it('handles conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    })

    it('handles undefined and null values', () => {
      expect(cn('base-class', undefined, null)).toBe('base-class')
    })

    it('merges conflicting Tailwind classes correctly', () => {
      // twMerge should handle conflicting classes
      expect(cn('px-2', 'px-4')).toBe('px-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('handles empty input', () => {
      expect(cn()).toBe('')
    })

    it('handles array inputs', () => {
      expect(cn(['px-2', 'py-1'], 'bg-blue-500')).toBe('px-2 py-1 bg-blue-500')
    })

    it('handles object inputs', () => {
      expect(cn({
        'px-2': true,
        'py-1': true,
        'bg-red-500': false,
        'bg-blue-500': true
      })).toBe('px-2 py-1 bg-blue-500')
    })
  })
})