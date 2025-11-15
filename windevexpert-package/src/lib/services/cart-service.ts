import { queryOne, queryMany, execute } from '@/lib/db'
import { Cart, CartItem, Product } from '@/types/product'

export class CartService {
  static async getCart(userId?: string, sessionId?: string): Promise<Cart | null> {
    try {
      if (!userId && !sessionId) {
        throw new Error('Either userId or sessionId must be provided')
      }

      // Get cart with items and products
      const cartQuery = userId 
        ? `SELECT c.*, ci.id as item_id, ci.productId, ci.quantity, ci.price as item_price, ci.createdAt as item_created_at,
                  p.id as product_id, p.name, p.slug, p.description, p.price as product_price, p.priceDA, 
                  p.type, p.status, p.logo, p.features, p.categoryId
           FROM Cart c
           LEFT JOIN CartItem ci ON c.id = ci.cartId
           LEFT JOIN Product p ON ci.productId = p.id
           WHERE c.userId = ?`
        : `SELECT c.*, ci.id as item_id, ci.productId, ci.quantity, ci.price as item_price, ci.createdAt as item_created_at,
                  p.id as product_id, p.name, p.slug, p.description, p.price as product_price, p.priceDA, 
                  p.type, p.status, p.logo, p.features, p.categoryId
           FROM Cart c
           LEFT JOIN CartItem ci ON c.id = ci.cartId
           LEFT JOIN Product p ON ci.productId = p.id
           WHERE c.sessionId = ?`

      const cartRows = await queryMany(cartQuery, [userId || sessionId])

      if (!cartRows || cartRows.length === 0) return null

      const cart = cartRows[0]
      const items: CartItem[] = []

      // Group items by product
      const itemsMap = new Map()
      cartRows.forEach(row => {
        if (row.item_id) {
          const itemKey = row.productId
          if (!itemsMap.has(itemKey)) {
            itemsMap.set(itemKey, {
              productId: row.productId,
              product: {
                id: row.product_id,
                name: row.name,
                slug: row.slug,
                description: row.description,
                price: row.product_price,
                priceDA: row.priceDA,
                type: row.type,
                status: row.status,
                image: row.logo,
                features: row.features,
                categoryId: row.categoryId
              } as Product,
              quantity: row.quantity,
              price: row.item_price,
              addedAt: row.item_created_at
            })
          }
        }
      })

      return {
        id: cart.id,
        userId: cart.userId || undefined,
        sessionId: cart.sessionId || undefined,
        items: Array.from(itemsMap.values()),
        total: cart.total,
        currency: 'EUR',
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      return null
    }
  }

  static async createCart(userId?: string, sessionId?: string): Promise<Cart> {
    try {
      if (!userId && !sessionId) {
        throw new Error('Either userId or sessionId must be provided')
      }

      const insertQuery = `INSERT INTO Cart (userId, sessionId, total, createdAt, updatedAt) VALUES (?, ?, 0, NOW(), NOW())`
      const result = await execute(insertQuery, [userId || null, sessionId || null])

      return {
        id: result.insertId.toString(),
        userId: userId || undefined,
        sessionId: sessionId || undefined,
        items: [],
        total: 0,
        currency: 'EUR',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } catch (error) {
      console.error('Error creating cart:', error)
      throw new Error('Failed to create cart')
    }
  }

  static async addToCart(
    productId: string,
    quantity: number = 1,
    userId?: string,
    sessionId?: string
  ): Promise<Cart> {
    try {
      // Get or create cart
      let cart = await this.getCart(userId, sessionId)
      if (!cart) {
        cart = await this.createCart(userId, sessionId)
      }

      // Get product details
      const product = await queryOne(`SELECT * FROM Product WHERE id = ?`, [productId])

      if (!product) {
        throw new Error('Product not found')
      }

      // Check if product is already in cart
      const existingItem = await queryOne(
        `SELECT * FROM CartItem WHERE cartId = ? AND productId = ?`,
        [cart.id, productId]
      )

      if (existingItem) {
        // Update quantity of existing item
        await execute(
          `UPDATE CartItem SET quantity = quantity + ? WHERE id = ?`,
          [quantity, existingItem.id]
        )
      } else {
        // Add new item to cart
        await execute(
          `INSERT INTO CartItem (cartId, productId, quantity, price, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [cart.id, productId, quantity, product.price]
        )
      }

      // Recalculate and update cart total
      const updatedCart = await this.updateCartTotal(cart.id)
      return updatedCart
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw new Error('Failed to add product to cart')
    }
  }

  static async updateCartItem(
    cartId: string,
    productId: string,
    quantity: number
  ): Promise<Cart> {
    try {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        await execute(
          `DELETE FROM CartItem WHERE cartId = ? AND productId = ?`,
          [cartId, productId]
        )
      } else {
        // Update quantity
        await execute(
          `UPDATE CartItem SET quantity = ?, updatedAt = NOW() WHERE cartId = ? AND productId = ?`,
          [quantity, cartId, productId]
        )
      }

      // Recalculate and update cart total
      const updatedCart = await this.updateCartTotal(cartId)
      return updatedCart
    } catch (error) {
      console.error('Error updating cart item:', error)
      throw new Error('Failed to update cart item')
    }
  }

  static async removeFromCart(
    cartId: string,
    productId: string
  ): Promise<Cart> {
    try {
      return await this.updateCartItem(cartId, productId, 0)
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw new Error('Failed to remove product from cart')
    }
  }

  static async clearCart(cartId: string): Promise<Cart> {
    try {
      // Delete all cart items
      await execute(`DELETE FROM CartItem WHERE cartId = ?`, [cartId])

      // Update cart total
      await execute(
        `UPDATE Cart SET total = 0, updatedAt = NOW() WHERE id = ?`,
        [cartId]
      )

      // Return updated cart
      const cart = await this.getCart(undefined, undefined)
      
      if (!cart) {
        throw new Error('Cart not found after clearing')
      }

      return cart
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw new Error('Failed to clear cart')
    }
  }

  static async mergeGuestCartWithUserCart(
    sessionId: string,
    userId: string
  ): Promise<Cart | null> {
    try {
      // Get guest cart
      const guestCart = await this.getCart(undefined, sessionId)
      if (!guestCart || guestCart.items.length === 0) {
        return null
      }

      // Get or create user cart
      let userCart = await this.getCart(userId)
      if (!userCart) {
        userCart = await this.createCart(userId)
      }

      // Merge items from guest cart to user cart
      for (const guestItem of guestCart.items) {
        const existingItem = await queryOne(
          `SELECT * FROM CartItem WHERE cartId = ? AND productId = ?`,
          [userCart.id, guestItem.productId]
        )

        if (existingItem) {
          // Add quantities if product already exists
          await execute(
            `UPDATE CartItem SET quantity = quantity + ?, updatedAt = NOW() WHERE id = ?`,
            [guestItem.quantity, existingItem.id]
          )
        } else {
          // Add new item
          await execute(
            `INSERT INTO CartItem (cartId, productId, quantity, price, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [userCart.id, guestItem.productId, guestItem.quantity, guestItem.price]
          )
        }
      }

      // Delete guest cart
      await this.deleteCart(guestCart.id)

      // Return updated user cart
      const updatedUserCart = await this.updateCartTotal(userCart.id)
      return updatedUserCart
    } catch (error) {
      console.error('Error merging carts:', error)
      throw new Error('Failed to merge carts')
    }
  }

  static async getCartItemCount(userId?: string, sessionId?: string): Promise<number> {
    try {
      const cart = await this.getCart(userId, sessionId)
      if (!cart) return 0

      // Return the number of distinct products, not the sum of quantities
      return cart.items.length
    } catch (error) {
      console.error('Error getting cart item count:', error)
      return 0
    }
  }

  static async deleteCart(cartId: string): Promise<void> {
    try {
      // Delete cart items first (foreign key constraint)
      await execute(`DELETE FROM CartItem WHERE cartId = ?`, [cartId])
      
      // Delete cart
      await execute(`DELETE FROM Cart WHERE id = ?`, [cartId])
    } catch (error) {
      console.error('Error deleting cart:', error)
      throw new Error('Failed to delete cart')
    }
  }

  private static async updateCartTotal(cartId: string): Promise<Cart> {
    try {
      // Calculate total from cart items
      const cartItems = await queryMany(
        `SELECT * FROM CartItem WHERE cartId = ?`,
        [cartId]
      )

      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      // Update cart total
      await execute(
        `UPDATE Cart SET total = ?, updatedAt = NOW() WHERE id = ?`,
        [total, cartId]
      )

      // Return updated cart by getting it fresh
      const cart = await queryOne(`SELECT * FROM Cart WHERE id = ?`, [cartId])
      
      if (!cart) {
        throw new Error('Cart not found')
      }

      // Get cart with all items
      const fullCart = await this.getCart(cart.userId, cart.sessionId)
      
      if (!fullCart) {
        throw new Error('Cart not found after update')
      }

      return fullCart
    } catch (error) {
      console.error('Error updating cart total:', error)
      throw error
    }
  }
}