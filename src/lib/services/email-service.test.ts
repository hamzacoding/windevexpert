import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import nodemailer from 'nodemailer'
import { emailService } from './email-service'

// Mock nodemailer
vi.mock('nodemailer')

describe('EmailService', () => {
  let mockTransporter: any

  beforeEach(() => {
    // Mock du transporter
    mockTransporter = {
      sendMail: vi.fn()
    }

    // Mock de nodemailer.createTransport
    vi.mocked(nodemailer.createTransport).mockReturnValue(mockTransporter)

    // Mock des variables d'environnement
    vi.stubEnv('SMTP_HOST', 'smtp.test.com')
    vi.stubEnv('SMTP_PORT', '587')
    vi.stubEnv('SMTP_USER', 'test@example.com')
    vi.stubEnv('SMTP_PASSWORD', 'password123')
    vi.stubEnv('SMTP_FROM', 'noreply@windevexpert.com')
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  describe('Constructor', () => {
    it('should create transporter with correct configuration', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password123'
        }
      })
    })
  })

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' })

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
        text: 'Test text'
      })

      expect(result).toBe(true)
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"WindevExpert" <noreply@windevexpert.com>',
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
        text: 'Test text'
      })
    })

    it('should handle email sending failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'))

      const result = await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>'
      })

      expect(result).toBe(false)
    })

    it('should use SMTP_USER as fallback for from address', async () => {
      vi.unstubAllEnvs()
      vi.stubEnv('SMTP_USER', 'fallback@example.com')
      
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' })
      
      await emailService.sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>'
      })

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"WindevExpert" <fallback@example.com>'
        })
      )
    })
  })

  describe('sendVerificationEmail', () => {
    it('should send verification email with correct template', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' })

      const result = await emailService.sendVerificationEmail(
        'user@example.com',
        {
          userName: 'John Doe',
          verificationUrl: 'https://example.com/verify?token=abc123'
        }
      )

      expect(result).toBe(true)
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Vérifiez votre adresse email - WindevExpert',
          html: expect.stringContaining('John Doe')
        })
      )
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('https://example.com/verify?token=abc123')
        })
      )
    })

    it('should handle verification email failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('Network Error'))

      const result = await emailService.sendVerificationEmail(
        'user@example.com',
        {
          userName: 'John Doe',
          verificationUrl: 'https://example.com/verify?token=abc123'
        }
      )

      expect(result).toBe(false)
    })
  })

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with correct template', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' })

      const result = await emailService.sendPasswordResetEmail(
        'user@example.com',
        {
          userName: 'John Doe',
          resetUrl: 'https://example.com/reset?token=xyz789'
        }
      )

      expect(result).toBe(true)
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Réinitialisation de votre mot de passe - WindevExpert',
          html: expect.stringContaining('John Doe')
        })
      )
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('https://example.com/reset?token=xyz789')
        })
      )
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct template', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' })

      const result = await emailService.sendWelcomeEmail(
        'user@example.com',
        {
          userName: 'John Doe',
          loginUrl: 'https://example.com/login'
        }
      )

      expect(result).toBe(true)
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Bienvenue sur WindevExpert !',
          html: expect.stringContaining('John Doe')
        })
      )
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('https://example.com/login')
        })
      )
    })
  })
})