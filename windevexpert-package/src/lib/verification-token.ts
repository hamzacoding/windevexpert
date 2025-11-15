import crypto from 'crypto'
import { prisma } from './prisma'

export interface VerificationTokenData {
  identifier: string
  token: string
  expires: Date
}

export enum TokenType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET'
}

export class VerificationTokenService {
  // Générer un token de vérification
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  // Créer un token de vérification dans la base de données
  static async createVerificationToken(email: string, type: TokenType = TokenType.EMAIL_VERIFICATION): Promise<string> {
    const token = this.generateToken()
    // Durée différente selon le type de token
    const expirationHours = type === TokenType.PASSWORD_RESET ? 1 : 24 // 1h pour reset password, 24h pour email verification
    const expires = new Date(Date.now() + expirationHours * 60 * 60 * 1000)

    // Supprimer les anciens tokens pour cet email et ce type
    await prisma.verificationToken.deleteMany({
      where: { 
        identifier: email,
        token: {
          startsWith: type === TokenType.PASSWORD_RESET ? 'reset_' : 'verify_'
        }
      }
    })

    // Créer le nouveau token avec un préfixe pour identifier le type
    const prefixedToken = type === TokenType.PASSWORD_RESET ? `reset_${token}` : `verify_${token}`
    
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: prefixedToken,
        expires
      }
    })

    return prefixedToken
  }

  // Vérifier un token
  static async verifyToken(token: string, type?: TokenType): Promise<{ valid: boolean; email?: string }> {
    try {
      // Si un type est spécifié, vérifier que le token correspond au type
      if (type) {
        const expectedPrefix = type === TokenType.PASSWORD_RESET ? 'reset_' : 'verify_'
        if (!token.startsWith(expectedPrefix)) {
          return { valid: false }
        }
      }

      const verificationToken = await prisma.verificationToken.findUnique({
        where: { token }
      })

      if (!verificationToken) {
        return { valid: false }
      }

      // Vérifier si le token n'a pas expiré
      if (verificationToken.expires < new Date()) {
        // Supprimer le token expiré
        await prisma.verificationToken.delete({
          where: { token }
        })
        return { valid: false }
      }

      return {
        valid: true,
        email: verificationToken.identifier
      }
    } catch (error) {
      console.error('Error verifying token:', error)
      return { valid: false }
    }
  }

  // Vérifier un token et récupérer ses données
  static async verifyAndGetTokenData(token: string, type?: TokenType): Promise<VerificationTokenData | null> {
    try {
      // Si un type est spécifié, vérifier que le token correspond au type
      if (type) {
        const expectedPrefix = type === TokenType.PASSWORD_RESET ? 'reset_' : 'verify_'
        if (!token.startsWith(expectedPrefix)) {
          return null
        }
      }

      const verificationToken = await prisma.verificationToken.findUnique({
        where: { token }
      })

      if (!verificationToken) {
        return null
      }

      // Vérifier si le token n'a pas expiré
      if (verificationToken.expires < new Date()) {
        // Supprimer le token expiré
        await prisma.verificationToken.delete({
          where: { token }
        })
        return null
      }

      return verificationToken
    } catch (error) {
      console.error('Error verifying and getting token data:', error)
      return null
    }
  }

  // Supprimer un token après utilisation
  static async deleteToken(token: string): Promise<void> {
    try {
      await prisma.verificationToken.delete({
        where: { token }
      })
    } catch (error) {
      console.error('Error deleting token:', error)
    }
  }

  // Nettoyer les tokens expirés
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      await prisma.verificationToken.deleteMany({
        where: {
          expires: {
            lt: new Date()
          }
        }
      })
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error)
    }
  }
}