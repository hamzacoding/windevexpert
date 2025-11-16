import type { Metadata } from 'next'
import { PublicLayout } from '@/components/layout/public-layout'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react'

function slugify(input: string) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
}

const blogPosts = [
  { id: 1, title: 'Les tendances du développement web en 2024', excerpt: '...', content: '...', author: 'Jean Dupont', publishedAt: '2024-01-15', readTime: '8 min' },
  { id: 2, title: "Guide complet de l'authentification avec NextAuth.js", excerpt: '...', content: '...', author: 'Marie Martin', publishedAt: '2024-01-12', readTime: '12 min' },
  { id: 3, title: 'Optimisation des performances React : Bonnes pratiques', excerpt: '...', content: '...', author: 'Pierre Durand', publishedAt: '2024-01-10', readTime: '10 min' },
]

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = blogPosts.find(p => slugify(p.title) === params.slug)
  const title = post ? `${post.title} – Blog WindevExpert` : 'Article – Blog WindevExpert'
  const description = post?.excerpt || 'Article du blog WindevExpert'
  return {
    title,
    description,
    alternates: { canonical: `/blog/${params.slug}` },
    openGraph: { title, description, url: `/blog/${params.slug}` },
  }
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find(p => slugify(p.title) === params.slug)

  if (!post) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <Link href="/blog" className="inline-flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au blog
          </Link>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <article className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au blog
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center text-gray-500 mb-6 text-sm">
          <User className="h-4 w-4 mr-1" /> {post.author}
          <Calendar className="h-4 w-4 ml-4 mr-1" /> {new Date(post.publishedAt).toLocaleDateString('fr-FR')}
          <Clock className="h-4 w-4 ml-4 mr-1" /> {post.readTime}
        </div>
        <p className="text-gray-700 leading-relaxed">{post.content}</p>
      </article>
    </PublicLayout>
  )
}
