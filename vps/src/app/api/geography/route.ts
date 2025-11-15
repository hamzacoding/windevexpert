import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer toutes les wilayas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wilayaId = searchParams.get('wilayaId')

    if (wilayaId) {
      // Récupérer les communes d'une wilaya spécifique
      const communes = await prisma.commune.findMany({
        where: { wilayaId },
        orderBy: { name: 'asc' }
      })

      return NextResponse.json({
        communes
      })
    } else {
      // Récupérer toutes les wilayas
      const wilayas = await prisma.wilaya.findMany({
        orderBy: { code: 'asc' }
      })

      return NextResponse.json({
        wilayas
      })
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des données géographiques:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données géographiques' },
      { status: 500 }
    )
  }
}