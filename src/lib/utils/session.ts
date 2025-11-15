/**
 * Session utility for managing user sessions and guest sessions
 */

/**
 * Generate a unique session ID for guest users
 */
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Get or create a session ID for guest users
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side: return a temporary session ID
    return generateSessionId()
  }

  let sessionId = localStorage.getItem('sessionId')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('sessionId', sessionId)
  }
  return sessionId
}

/**
 * Clear the session ID (useful when user logs in)
 */
export function clearSessionId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sessionId')
  }
}

/**
 * Get session parameters for cart operations
 * Returns either userId (if authenticated) or sessionId (if guest)
 */
export function getSessionParams(userId?: string): { userId?: string; sessionId?: string } {
  if (userId) {
    return { userId }
  }
  return { sessionId: getSessionId() }
}