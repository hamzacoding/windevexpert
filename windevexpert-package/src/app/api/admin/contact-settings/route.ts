import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les paramètres de contact
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les paramètres (il ne devrait y en avoir qu'un seul)
    let settings = await prisma.contactSettings.findFirst();
    
    // Si aucun paramètre n'existe, créer un enregistrement par défaut
    if (!settings) {
      settings = await prisma.contactSettings.create({
        data: {
          email: '',
          phone: '',
          whatsapp: '',
          address: '',
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
          description: 'Expert en développement WinDev, WebDev et WinDev Mobile'
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres de contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les paramètres de contact
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validation des données
    const {
      email,
      phone,
      whatsapp,
      address,
      facebook,
      twitter,
      linkedin,
      instagram,
      youtube,
      github,
      openingHours,
      companyName,
      description
    } = data;

    // Récupérer l'enregistrement existant ou créer le premier
    let settings = await prisma.contactSettings.findFirst();
    
    if (settings) {
      // Mettre à jour l'enregistrement existant
      settings = await prisma.contactSettings.update({
        where: { id: settings.id },
        data: {
          email: email || null,
          phone: phone || null,
          whatsapp: whatsapp || null,
          address: address || null,
          facebook: facebook || null,
          twitter: twitter || null,
          linkedin: linkedin || null,
          instagram: instagram || null,
          youtube: youtube || null,
          github: github || null,
          openingHours: openingHours ? JSON.stringify(openingHours) : null,
          companyName: companyName || null,
          description: description || null,
          updatedAt: new Date()
        }
      });
    } else {
      // Créer un nouvel enregistrement
      settings = await prisma.contactSettings.create({
        data: {
          email: email || null,
          phone: phone || null,
          whatsapp: whatsapp || null,
          address: address || null,
          facebook: facebook || null,
          twitter: twitter || null,
          linkedin: linkedin || null,
          instagram: instagram || null,
          youtube: youtube || null,
          github: github || null,
          openingHours: openingHours ? JSON.stringify(openingHours) : null,
          companyName: companyName || null,
          description: description || null
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres de contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
}