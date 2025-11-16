import type { Metadata } from 'next'
import ClientPage from './ClientPage'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    let formation: any | null = null
    let res = await fetch(`/api/courses/slug/${params.slug}`, { cache: 'no-store' })
    if (res.ok) {
      formation = await res.json()
    } else {
      res = await fetch(`/api/courses/${params.slug}`, { cache: 'no-store' })
      if (res.ok) formation = await res.json()
    }
    const title = formation ? `${formation.title} – Formations WindevExpert` : 'Formation – WindevExpert'
    const description = formation?.description || 'Détails de la formation WindevExpert'
    return {
      title,
      description,
      alternates: { canonical: `/formations/${params.slug}` },
      openGraph: { title, description, url: `/formations/${params.slug}` },
    }
  } catch {}
  return { title: 'Formation – WindevExpert', alternates: { canonical: `/formations/${params.slug}` } }
}

export default function Page() {
  return <ClientPage />
}
