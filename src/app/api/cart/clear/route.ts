import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CartService } from '@/lib/services/cart-service'

// DELETE /api/cart/clear - Vider le panier
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const sessionId = (searchParams.get('sessionId') || undefined)
    const userId = (searchParams.get('userId') || session?.user?.id || undefined)

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'Either userId or sessionId is required' },
        { status: 400 }
      )
    }

    const cart = await CartService.getCart(userId, sessionId)
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    const clearedCart = await CartService.clearCart(cart.id)
    
    return NextResponse.json({ 
      cart: clearedCart,
      message: 'Panier vidé avec succès'
    })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
