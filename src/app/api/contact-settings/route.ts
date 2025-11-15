import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les paramètres de contact (API publique)
export async function GET() {
  // Valeurs par défaut (utilisées si Prisma échoue ou aucune donnée)
  const defaultSettings = {
    id: '',
    email: 'contact@windevexpert.com',
    phone: '+33 1 23 45 67 89',
    whatsapp: '+33 6 12 34 56 78',
    address: 'Paris, France',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    youtube: '',
    github: '',
    openingHours: JSON.stringify({
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '12:00', closed: false },
      sunday: { open: '09:00', close: '12:00', closed: true }
    }),
    companyName: 'WinDevExpert',
    description: 'Expert en développement WinDev, WebDev et WinDev Mobile',
    createdAt: new Date(),
    updatedAt: new Date()
  } as const;

  try {
    // Sécuriser l'appel Prisma avec un timeout court pour éviter des blocages
    const withTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T | null> => {
      return await Promise.race([
        promise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))
      ]) as T | null;
    };

    // Tentative de récupération depuis la BD
    let settings = await withTimeout(prisma.contactSettings.findFirst(), 1500);

    // Si aucun enregistrement, on utilise les valeurs par défaut
    if (!settings) {
      settings = { ...defaultSettings } as any;
    }

    // Parser les horaires d'ouverture si elles existent
    let parsedOpeningHours: any = null;
    if (settings.openingHours) {
      try {
        const value = settings.openingHours;
        parsedOpeningHours = typeof value === 'string' ? JSON.parse(value) : value;
      } catch (error) {
        console.error('Erreur lors du parsing des horaires d\'ouverture:', error);
      }
    }

    // Retourner les paramètres avec les horaires parsées
    return NextResponse.json({
      ...settings,
      openingHours: parsedOpeningHours
    });
  } catch (error) {
    // En cas d'erreur Prisma (client non généré ou moteur indisponible),
    // on retourne tout de même des valeurs par défaut pour éviter une 500 côté UI.
    console.error('Prisma indisponible, utilisation des valeurs par défaut:', error);
    const parsedOpeningHours = JSON.parse(defaultSettings.openingHours);
    return NextResponse.json({
      ...defaultSettings,
      openingHours: parsedOpeningHours
    });
  }
}