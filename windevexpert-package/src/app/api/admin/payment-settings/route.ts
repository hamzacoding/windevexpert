import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { queryOne, execute } from '@/lib/db'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import fs from 'fs/promises'
import path from 'path'

const paymentSettingsSchema = z.object({
  ccpAccount: z.string().optional().or(z.literal('')),
  ccpAccountName: z.string().optional().or(z.literal('')),
  bankAccount: z.string().optional().or(z.literal('')),
  bankAccountName: z.string().optional().or(z.literal('')),
  bankName: z.string().optional().or(z.literal('')),
  stripeEnabled: z.boolean(),
  stripePublicKey: z.string().optional().or(z.literal('')),
  stripeSecretKey: z.string().optional().or(z.literal('')),
  stripeTestMode: z.boolean(),
  stripeWebhookSecret: z.string().optional().or(z.literal('')),
  // Chargily (CIB/EDAHABIA)
  chargilyEnabled: z.boolean().optional(),
  chargilyApiKey: z.string().optional().or(z.literal('')),
  chargilySecretKey: z.string().optional().or(z.literal('')),
  chargilyTestMode: z.boolean().optional(),
  isActive: z.boolean()
})

function toMaskedResponse(row: any) {
  const envApiKey = process.env.CHARGILY_API_KEY
  const envSecretKey = process.env.CHARGILY_SECRET_KEY
  const envTestMode = (process.env.CHARGILY_TEST_MODE ?? 'true').toLowerCase() === 'true'
  return {
    id: row?.id,
    ccpAccount: row?.ccpAccount ?? '',
    ccpAccountName: row?.ccpAccountName ?? '',
    bankAccount: row?.bankAccount ?? '',
    bankAccountName: row?.bankAccountName ?? '',
    bankName: row?.bankName ?? '',
    stripeEnabled: !!(row?.stripeEnabled ?? false),
    stripePublicKey: row?.stripePublicKey ? '••••••••' : '',
    stripeSecretKey: row?.stripeSecretKey ? '••••••••' : '',
    stripeTestMode: !!(row?.stripeTestMode ?? true),
    stripeWebhookSecret: row?.stripeWebhookSecret ? '••••••••' : '',
    // Chargily depuis env
    chargilyEnabled: !!(envApiKey && envSecretKey),
    chargilyApiKey: envApiKey ? '••••••••' : '',
    chargilySecretKey: envSecretKey ? '••••••••' : '',
    chargilyTestMode: envTestMode,
    isActive: !!(row?.isActive ?? true)
  }
}

export async function GET() {
  let session: any = null
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    console.error('Erreur NextAuth lors de GET payment-settings:', err)
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
  }

  try {
    const settings = await prisma.paymentSettings.findFirst({ orderBy: { createdAt: 'desc' } })
    if (settings) {
      return NextResponse.json(toMaskedResponse(settings))
    }
  } catch (err) {
    console.warn('Prisma indisponible, fallback MySQL (GET):', err)
  }

  try {
    const row = await queryOne(
      `SELECT 
        id, ccpAccount, ccpAccountName, bankAccount, bankAccountName, bankName,
        stripeEnabled, stripePublicKey, stripeSecretKey, stripeTestMode, stripeWebhookSecret, isActive
       FROM PaymentSettings
       ORDER BY createdAt DESC LIMIT 1`
    )
    if (row) {
      return NextResponse.json(toMaskedResponse(row))
    }
  } catch (err) {
    console.error('Erreur MySQL lors de GET payment-settings:', err)
  }

  // Valeurs par défaut + Chargily env
  const envApiKey = process.env.CHARGILY_API_KEY
  const envSecretKey = process.env.CHARGILY_SECRET_KEY
  const envTestMode = (process.env.CHARGILY_TEST_MODE ?? 'true').toLowerCase() === 'true'

  return NextResponse.json({
    ccpAccount: '',
    ccpAccountName: '',
    bankAccount: '',
    bankAccountName: '',
    bankName: '',
    stripeEnabled: false,
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeTestMode: true,
    stripeWebhookSecret: '',
    chargilyEnabled: !!(envApiKey && envSecretKey),
    chargilyApiKey: envApiKey ? '••••••••' : '',
    chargilySecretKey: envSecretKey ? '••••••••' : '',
    chargilyTestMode: envTestMode,
    isActive: true
  })
}

async function updateChargilyEnv({ apiKey, secretKey, testMode }: { apiKey?: string; secretKey?: string; testMode?: boolean }) {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    let content = ''
    try {
      content = await fs.readFile(envPath, 'utf8')
    } catch {
      content = ''
    }

    const setOrUpdate = (key: string, value: string | undefined, src: string) => {
      if (typeof value === 'undefined') return src
      const line = `${key}=${value}`
      const regex = new RegExp(`^${key}=.*$`, 'm')
      if (regex.test(src)) {
        return src.replace(regex, line)
      }
      const hasTrailingNewline = src.endsWith('\n')
      return src + (hasTrailingNewline ? '' : '\n') + line + '\n'
    }

    let updated = content
    updated = setOrUpdate('CHARGILY_API_KEY', apiKey, updated)
    updated = setOrUpdate('CHARGILY_SECRET_KEY', secretKey, updated)
    if (typeof testMode !== 'undefined') {
      updated = setOrUpdate('CHARGILY_TEST_MODE', String(!!testMode), updated)
    }

    await fs.writeFile(envPath, updated, 'utf8')
    return true
  } catch (e) {
    console.error('Erreur mise à jour .env.local pour Chargily:', e)
    return false
  }
}

export async function POST(req: NextRequest) {
  let session: any = null
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    console.error('Erreur NextAuth lors de POST payment-settings:', err)
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = paymentSettingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides', details: parsed.error.format() }, { status: 400 })
    }

    const data = parsed.data

    // Mettre à jour l'environnement Chargily avant sauvegarde DB
    const masked = '••••••••'
    await updateChargilyEnv({
      apiKey: data.chargilyApiKey === masked ? undefined : (data.chargilyApiKey?.trim() || ''),
      secretKey: data.chargilySecretKey === masked ? undefined : (data.chargilySecretKey?.trim() || ''),
      testMode: typeof data.chargilyTestMode === 'boolean' ? data.chargilyTestMode : undefined,
    })

    let existingSettings: any = null
    try {
      existingSettings = await prisma.paymentSettings.findFirst({ orderBy: { createdAt: 'desc' } })
    } catch (err) {
      console.warn('Prisma indisponible, fallback MySQL (POST - read):', err)
      try {
        existingSettings = await queryOne(
          `SELECT id, stripePublicKey, stripeSecretKey, stripeWebhookSecret FROM PaymentSettings ORDER BY createdAt DESC LIMIT 1`
        )
      } catch (e) {
        console.error('Erreur MySQL lors de la lecture payment-settings:', e)
      }
    }

    const dataToSave = {
      ...data,
      stripePublicKey:
        data.stripePublicKey === '••••••••'
          ? existingSettings?.stripePublicKey ?? ''
          : data.stripePublicKey,
      stripeSecretKey:
        data.stripeSecretKey === '••••••••'
          ? existingSettings?.stripeSecretKey ?? ''
          : data.stripeSecretKey,
      stripeWebhookSecret:
        data.stripeWebhookSecret === '••••••••'
          ? existingSettings?.stripeWebhookSecret ?? ''
          : data.stripeWebhookSecret
    }

    let updatedSettings: any = null
    try {
      if (!existingSettings) {
        updatedSettings = await prisma.paymentSettings.create({
          data: {
            ccpAccount: dataToSave.ccpAccount?.trim() || '',
            ccpAccountName: dataToSave.ccpAccountName?.trim() || '',
            bankAccount: dataToSave.bankAccount?.trim() || '',
            bankAccountName: dataToSave.bankAccountName?.trim() || '',
            bankName: dataToSave.bankName?.trim() || '',
            stripeEnabled: dataToSave.stripeEnabled,
            stripePublicKey: dataToSave.stripePublicKey?.trim() || '',
            stripeSecretKey: dataToSave.stripeSecretKey?.trim() || '',
            stripeTestMode: dataToSave.stripeTestMode,
            stripeWebhookSecret: dataToSave.stripeWebhookSecret?.trim() || '',
            isActive: dataToSave.isActive
          }
        })
      } else {
        updatedSettings = await prisma.paymentSettings.update({
          where: { id: existingSettings.id },
          data: {
            ccpAccount: dataToSave.ccpAccount?.trim() || '',
            ccpAccountName: dataToSave.ccpAccountName?.trim() || '',
            bankAccount: dataToSave.bankAccount?.trim() || '',
            bankAccountName: dataToSave.bankAccountName?.trim() || '',
            bankName: dataToSave.bankName?.trim() || '',
            stripeEnabled: dataToSave.stripeEnabled,
            stripePublicKey: dataToSave.stripePublicKey?.trim() || '',
            stripeSecretKey: dataToSave.stripeSecretKey?.trim() || '',
            stripeTestMode: dataToSave.stripeTestMode,
            stripeWebhookSecret: dataToSave.stripeWebhookSecret?.trim() || '',
            isActive: dataToSave.isActive
          }
        })
      }
    } catch (err) {
      console.warn('Prisma indisponible, fallback MySQL (POST - write):', err)
      try {
        if (!existingSettings) {
          const id = randomUUID()
          await execute(
            `INSERT INTO PaymentSettings(
              id, ccpAccount, ccpAccountName, bankAccount, bankAccountName, bankName,
              stripeEnabled, stripePublicKey, stripeSecretKey, stripeTestMode, stripeWebhookSecret, isActive, createdAt, updatedAt
            ) VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
            )`,
            [
              id,
              dataToSave.ccpAccount?.trim() || null,
              dataToSave.ccpAccountName?.trim() || null,
              dataToSave.bankAccount?.trim() || null,
              dataToSave.bankAccountName?.trim() || null,
              dataToSave.bankName?.trim() || null,
              !!dataToSave.stripeEnabled,
              dataToSave.stripePublicKey?.trim() || null,
              dataToSave.stripeSecretKey?.trim() || null,
              !!dataToSave.stripeTestMode,
              dataToSave.stripeWebhookSecret?.trim() || null,
              !!dataToSave.isActive
            ]
          )
          updatedSettings = { id, ...dataToSave }
        } else {
          await execute(
            `UPDATE PaymentSettings SET
              ccpAccount = ?, ccpAccountName = ?, bankAccount = ?, bankAccountName = ?, bankName = ?,
              stripeEnabled = ?, stripePublicKey = ?, stripeSecretKey = ?, stripeTestMode = ?, stripeWebhookSecret = ?, isActive = ?, updatedAt = NOW()
            WHERE id = ?`,
            [
              dataToSave.ccpAccount?.trim() || null,
              dataToSave.ccpAccountName?.trim() || null,
              dataToSave.bankAccount?.trim() || null,
              dataToSave.bankAccountName?.trim() || null,
              dataToSave.bankName?.trim() || null,
              !!dataToSave.stripeEnabled,
              dataToSave.stripePublicKey?.trim() || null,
              dataToSave.stripeSecretKey?.trim() || null,
              !!dataToSave.stripeTestMode,
              dataToSave.stripeWebhookSecret?.trim() || null,
              !!dataToSave.isActive,
              existingSettings.id
            ]
          )
          updatedSettings = { id: existingSettings.id, ...dataToSave }
        }
      } catch (e) {
        console.error('Erreur MySQL lors de la mise à jour payment-settings:', e)
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
      }
    }

    return NextResponse.json(toMaskedResponse(updatedSettings))
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors, message: 'Veuillez vérifier les données saisies' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erreur interne du serveur', message: "Une erreur inattendue s'est produite" },
      { status: 500 }
    )
  }
}