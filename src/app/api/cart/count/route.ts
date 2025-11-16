import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CartService } from '@/lib/services/cart-service'

// GET /api/cart/count - Obtenir le nombre d'éléments dans le panier
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!session?.user?.id && !sessionId) {
      return NextResponse.json({ count: 0 })
    }

    const count = await CartService.getCartItemCount(session?.user?.id, sessionId || undefined)
    const res = NextResponse.json({ count })
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (error) {
    console.error('Error fetching cart count:', error)
    return NextResponse.json({ count: 0 })
  }
}
