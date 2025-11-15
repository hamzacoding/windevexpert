import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getProducts, createProduct } from '@/lib/services/products-service'

// GET - Récupérer tous les produits avec pagination et filtres
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les permissions admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''

    // Récupérer les produits
    const result = await getProducts(page, limit, search, type, status, category)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur API GET /admin/products:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Vérifier les permissions admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer les données du corps de la requête
    const body = await request.json()
    
    // Validation des données obligatoires
    if (!body.name || !body.description || !body.type || body.price === undefined || !body.status || !body.categoryId) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Validation du type
    if (!['FORMATION', 'SERVICE', 'PRODUCT'].includes(type)) {
      return NextResponse.json(
        { error: 'Type de produit invalide' },
        { status: 400 }
      )
    }

    // Validation du statut
    if (!['ACTIVE', 'INACTIVE', 'DRAFT'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    // Validation du prix
    if (typeof body.price !== 'number' || body.price < 0) {
      return NextResponse.json(
        { error: 'Le prix doit être un nombre positif' },
        { status: 400 }
      )
    }

    // Créer le produit avec tous les champs
    const product = await createProduct(body)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Erreur API POST /admin/products:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    )
  }
}