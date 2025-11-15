import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CartService } from '@/lib/services/cart-service'

// GET /api/cart - Récupérer le panier
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!session?.user?.id && !sessionId) {
      return NextResponse.json(
        { error: 'Session ID required for guest users' },
        { status: 400 }
      )
    }

    const cart = await CartService.getCart(session?.user?.id, sessionId || undefined)
    
    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Ajouter un produit au panier
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { productId, quantity = 1, sessionId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (!session?.user?.id && !sessionId) {
      return NextResponse.json(
        { error: 'Session ID required for guest users' },
        { status: 400 }
      )
    }

    const cart = await CartService.addToCart(
      productId,
      quantity,
      session?.user?.id,
      sessionId
    )

    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add product to cart' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Vider le panier
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!session?.user?.id && !sessionId) {
      return NextResponse.json(
        { error: 'Session ID required for guest users' },
        { status: 400 }
      )
    }

    const cart = await CartService.getCart(session?.user?.id, sessionId || undefined)
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    const clearedCart = await CartService.clearCart(cart.id)
    
    return NextResponse.json({ cart: clearedCart })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}