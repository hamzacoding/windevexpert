import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CartService } from '@/lib/services/cart-service'

// POST /api/cart/merge - Fusionner le panier invité avec le panier utilisateur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { sessionId } = body

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'User must be authenticated' },
        { status: 401 }
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const mergedCart = await CartService.mergeGuestCartWithUserCart(sessionId, session.user.id)
    
    return NextResponse.json({ cart: mergedCart })
  } catch (error) {
    console.error('Error merging carts:', error)
    return NextResponse.json(
      { error: 'Failed to merge carts' },
      { status: 500 }
    )
  }
}