import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CartService } from '@/lib/services/cart-service'

// PUT /api/cart/items - Mettre à jour la quantité d'un produit
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { productId, quantity, sessionId } = body

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      )
    }

    if (!session?.user?.id && !sessionId) {
      return NextResponse.json(
        { error: 'Session ID required for guest users' },
        { status: 400 }
      )
    }

    // Get cart first
    const cart = await CartService.getCart(session?.user?.id, sessionId)
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    const updatedCart = await CartService.updateCartItem(cart.id, productId, quantity)
    
    return NextResponse.json({ cart: updatedCart })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/items - Supprimer un produit du panier
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const sessionId = searchParams.get('sessionId')

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

    // Get cart first
    const cart = await CartService.getCart(session?.user?.id, sessionId || undefined)
    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    const updatedCart = await CartService.removeFromCart(cart.id, productId)
    
    return NextResponse.json({ cart: updatedCart })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { error: 'Failed to remove product from cart' },
      { status: 500 }
    )
  }
}