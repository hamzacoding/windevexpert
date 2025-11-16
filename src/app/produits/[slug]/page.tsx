import type { Metadata } from 'next'
import { ProductService } from '@/lib/services/product-service'
import ClientPage from './ClientPage'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const product = await ProductService.getProductBySlug(params.slug)
    const title = product ? `${product.name} – WindevExpert` : 'Produit – WindevExpert'
    const description = product?.description || 'Détails du produit WindevExpert'
    return {
      title,
      description,
      alternates: { canonical: `/produits/${params.slug}` },
      openGraph: {
        title,
        description,
        url: `/produits/${params.slug}`,
      },
    }
  } catch {
    return {
      title: 'Produit – WindevExpert',
      alternates: { canonical: `/produits/${params.slug}` },
    }
  }
}

export default function Page() {
  return <ClientPage />
}
