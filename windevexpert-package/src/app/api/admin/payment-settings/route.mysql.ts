import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryOne, execute } from '@/lib/db'
import { z } from 'zod'

// Schéma de validation pour les paramètres de paiement
const paymentSettingsSchema = z.object({
  ccpAccount: z.string().optional().or(z.literal('')),
  ccpAccountName: z.string().optional().or(z.literal('')),
  bankAccount: z.string().optional().or(z.literal('')),
  bankAccountName: z.string().optional().or(z.literal('')),
  bankName: z.string().optional().or(z.literal('')),
  slickPayEnabled: z.boolean(),
  slickPayPublicKey: z.string().optional().or(z.literal('')),
  slickPaySecretKey: z.string().optional().or(z.literal('')),
  slickPayTestMode: z.boolean(),
  slickPayWebhookUrl: z.string().optional().or(z.literal('')).refine(
    (val) => !val || val === '' || z.string().url().safeParse(val).success,
    { message: "L'URL webhook doit être une URL valide ou vide" }
  ),
  stripeEnabled: z.boolean(),
  stripePublicKey: z.string().optional().or(z.literal('')),
  stripeSecretKey: z.string().optional().or(z.literal('')),
  stripeTestMode: z.boolean(),
  stripeWebhookSecret: z.string().optional().or(z.literal('')),
  isActive: z.boolean()
})

// GET - Récupérer les paramètres de paiement
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer les paramètres existants
    const settings = await queryOne<any>(
      'SELECT * FROM payment_settings ORDER BY created_at DESC LIMIT 1'
    )

    if (!settings) {
      // Retourner des valeurs par défaut si aucun paramètre n'existe
      return NextResponse.json({
        ccp_account: '',
        ccp_account_name: '',
        bank_account: '',
        bank_account_name: '',
        bank_name: '',
        slick_pay_enabled: false,
        slick_pay_public_key: '',
        slick_pay_secret_key: '',
        slick_pay_test_mode: true,
        slick_pay_webhook_url: '',
        stripe_enabled: false,
        stripe_public_key: '',
        stripe_secret_key: '',
        stripe_test_mode: true,
        stripe_webhook_secret: '',
        is_active: true
      })
    }

    // Masquer les clés sensibles dans la réponse
    const response = {
      ...settings,
      slick_pay_public_key: settings.slick_pay_public_key ? '••••••••' : '',
      slick_pay_secret_key: settings.slick_pay_secret_key ? '••••••••' : '',
      stripe_public_key: settings.stripe_public_key ? '••••••••' : '',
      stripe_secret_key: settings.stripe_secret_key ? '••••••••' : '',
      stripe_webhook_secret: settings.stripe_webhook_secret ? '••••••••' : ''
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST - Sauvegarder les paramètres de paiement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validation des données
    const validatedData = paymentSettingsSchema.parse(body)

    // Récupérer les paramètres existants pour préserver les clés non modifiées
    const existingSettings = await queryOne<any>(
      'SELECT * FROM payment_settings ORDER BY created_at DESC LIMIT 1'
    )

    // Préparer les données à sauvegarder
    const dataToSave = {
      ...validatedData,
      // Préserver les clés existantes si elles ne sont pas modifiées (contiennent des •)
      slickPayPublicKey: validatedData.slickPayPublicKey === '••••••••' 
        ? existingSettings?.slick_pay_public_key 
        : validatedData.slickPayPublicKey,
      slickPaySecretKey: validatedData.slickPaySecretKey === '••••••••' 
        ? existingSettings?.slick_pay_secret_key 
        : validatedData.slickPaySecretKey,
      stripePublicKey: validatedData.stripePublicKey === '••••••••' 
        ? existingSettings?.stripe_public_key 
        : validatedData.stripePublicKey,
      stripeSecretKey: validatedData.stripeSecretKey === '••••••••' 
        ? existingSettings?.stripe_secret_key 
        : validatedData.stripeSecretKey,
      stripeWebhookSecret: validatedData.stripeWebhookSecret === '••••••••' 
        ? existingSettings?.stripe_webhook_secret 
        : validatedData.stripeWebhookSecret,
      // Nettoyer les URLs vides
      slickPayWebhookUrl: validatedData.slickPayWebhookUrl === '' 
        ? null 
        : validatedData.slickPayWebhookUrl
    }

    let settings
    if (existingSettings) {
      // Mettre à jour les paramètres existants
      await execute(
        `UPDATE payment_settings SET 
         ccp_account = ?, ccp_account_name = ?, bank_account = ?, bank_account_name = ?, bank_name = ?,
         slick_pay_enabled = ?, slick_pay_public_key = ?, slick_pay_secret_key = ?, slick_pay_test_mode = ?, slick_pay_webhook_url = ?,
         stripe_enabled = ?, stripe_public_key = ?, stripe_secret_key = ?, stripe_test_mode = ?, stripe_webhook_secret = ?,
         is_active = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          dataToSave.ccpAccount, dataToSave.ccpAccountName, dataToSave.bankAccount, dataToSave.bankAccountName, dataToSave.bankName,
          dataToSave.slickPayEnabled, dataToSave.slickPayPublicKey, dataToSave.slickPaySecretKey, dataToSave.slickPayTestMode, dataToSave.slickPayWebhookUrl,
          dataToSave.stripeEnabled, dataToSave.stripePublicKey, dataToSave.stripeSecretKey, dataToSave.stripeTestMode, dataToSave.stripeWebhookSecret,
          dataToSave.isActive, existingSettings.id
        ]
      )
      settings = await queryOne<any>('SELECT * FROM payment_settings WHERE id = ?', [existingSettings.id])
    } else {
      // Créer de nouveaux paramètres
      const result = await execute(
        `INSERT INTO payment_settings 
         (ccp_account, ccp_account_name, bank_account, bank_account_name, bank_name,
          slick_pay_enabled, slick_pay_public_key, slick_pay_secret_key, slick_pay_test_mode, slick_pay_webhook_url,
          stripe_enabled, stripe_public_key, stripe_secret_key, stripe_test_mode, stripe_webhook_secret,
          is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          dataToSave.ccpAccount, dataToSave.ccpAccountName, dataToSave.bankAccount, dataToSave.bankAccountName, dataToSave.bankName,
          dataToSave.slickPayEnabled, dataToSave.slickPayPublicKey, dataToSave.slickPaySecretKey, dataToSave.slickPayTestMode, dataToSave.slickPayWebhookUrl,
          dataToSave.stripeEnabled, dataToSave.stripePublicKey, dataToSave.stripeSecretKey, dataToSave.stripeTestMode, dataToSave.stripeWebhookSecret,
          dataToSave.isActive
        ]
      )
      settings = await queryOne<any>('SELECT * FROM payment_settings WHERE id = ?', [result.insertId])
    }

    // Retourner la réponse sans les clés sensibles
    const response = {
      ...settings,
      slick_pay_public_key: settings.slick_pay_public_key ? '••••••••' : '',
      slick_pay_secret_key: settings.slick_pay_secret_key ? '••••••••' : '',
      stripe_public_key: settings.stripe_public_key ? '••••••••' : '',
      stripe_secret_key: settings.stripe_secret_key ? '••••••••' : '',
      stripe_webhook_secret: settings.stripe_webhook_secret ? '••••••••' : ''
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres:', error)
    
    if (error instanceof z.ZodError) {
      console.error('Erreurs de validation:', error.errors)
      return NextResponse.json(
        { 
          error: 'Données invalides', 
          details: error.errors,
          message: 'Veuillez vérifier les données saisies'
        },
        { status: 400 }
      )
    }

    // Erreur de base de données Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Erreur Prisma:', error)
      return NextResponse.json(
        { 
          error: 'Erreur de base de données',
          message: 'Impossible de sauvegarder les paramètres'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        message: 'Une erreur inattendue s\'est produite'
      },
      { status: 500 }
    )
  }
}