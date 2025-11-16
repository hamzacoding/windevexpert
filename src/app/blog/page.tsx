import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, User, Clock, Tag, ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PublicLayout } from '@/components/layout/public-layout'

export const metadata: Metadata = {
  title: 'Blog - WindevExpert',
  description: 'Découvrez nos articles, tutoriels et actualités sur le développement web, mobile et les nouvelles technologies.',
  alternates: {
    canonical: '/blog',
  },
}

// Mock data for blog posts
const blogPosts = [
  {
    id: 1,
    title: 'Les tendances du développement web en 2024',
    excerpt: 'Découvrez les technologies et frameworks qui vont dominer le développement web cette année.',
    content: 'Le développement web continue d\'évoluer rapidement...',
    author: 'Jean Dupont',
    publishedAt: '2024-01-15',
    readTime: '8 min',
    category: 'Développement Web',
    tags: ['React', 'Next.js', 'TypeScript', 'Tendances'],
    image: '/api/placeholder/600/300',
    featured: true
  },
  {
    id: 2,
    title: 'Guide complet de l\'authentification avec NextAuth.js',
    excerpt: 'Apprenez à implémenter une authentification sécurisée dans vos applications Next.js.',
    content: 'L\'authentification est un aspect crucial...',
    author: 'Marie Martin',
    publishedAt: '2024-01-12',
    readTime: '12 min',
    category: 'Tutoriel',
    tags: ['NextAuth', 'Sécurité', 'Authentication', 'Next.js'],
    image: '/api/placeholder/600/300',
    featured: false
  },
  {
    id: 3,
    title: 'Optimisation des performances React : Bonnes pratiques',
    excerpt: 'Techniques avancées pour améliorer les performances de vos applications React.',
    content: 'Les performances sont essentielles...',
    author: 'Pierre Durand',
    publishedAt: '2024-01-10',
    readTime: '10 min',
    category: 'Performance',
    tags: ['React', 'Performance', 'Optimisation', 'Hooks'],
    image: '/api/placeholder/600/300',
    featured: false
  },
  {
    id: 4,
    title: 'Introduction à l\'Intelligence Artificielle pour les développeurs',
    excerpt: 'Comment intégrer l\'IA dans vos projets de développement avec Python et TensorFlow.',
    content: 'L\'intelligence artificielle transforme...',
    author: 'Sophie Leroy',
    publishedAt: '2024-01-08',
    readTime: '15 min',
    category: 'Intelligence Artificielle',
    tags: ['IA', 'Python', 'TensorFlow', 'Machine Learning'],
    image: '/api/placeholder/600/300',
    featured: true
  },
  {
    id: 5,
    title: 'DevOps : Automatiser vos déploiements avec GitHub Actions',
    excerpt: 'Mise en place d\'un pipeline CI/CD complet avec GitHub Actions et Docker.',
    content: 'L\'automatisation des déploiements...',
    author: 'Thomas Blanc',
    publishedAt: '2024-01-05',
    readTime: '11 min',
    category: 'DevOps',
    tags: ['DevOps', 'GitHub Actions', 'CI/CD', 'Docker'],
    image: '/api/placeholder/600/300',
    featured: false
  },
  {
    id: 6,
    title: 'Sécurité des applications web : OWASP Top 10 2024',
    excerpt: 'Les principales vulnérabilités à connaître et comment s\'en protéger.',
    content: 'La sécurité web est plus importante...',
    author: 'Laura Moreau',
    publishedAt: '2024-01-03',
    readTime: '9 min',
    category: 'Sécurité',
    tags: ['Sécurité', 'OWASP', 'Vulnérabilités', 'Web'],
    image: '/api/placeholder/600/300',
    featured: false
  }
]

const categories = ['Tous', 'Développement Web', 'Tutoriel', 'Performance', 'Intelligence Artificielle', 'DevOps', 'Sécurité']

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

  return (
    <PublicLayout>
      <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Blog WindevExpert
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
              Découvrez nos articles, tutoriels et actualités sur le développement 
              et les nouvelles technologies.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un article..."
                  className="pl-10 bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className="px-6 py-3 rounded-xl border-0 bg-gradient-to-r from-gray-50 to-blue-50 text-gray-700 hover:from-purple-50 hover:to-blue-100 hover:text-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 font-medium"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Articles à la une
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
                  <div className="h-64 bg-gradient-to-r from-purple-400 to-blue-500"></div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-sm font-medium px-4 py-2 rounded-xl shadow-sm">
                        {post.category}
                      </span>
                      <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-xl">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span className="mr-3 font-medium">{post.author}</span>
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{new Date(post.publishedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      <Link href={`/blog/${slugify(post.title)}`}>
                        <Button variant="outline" size="sm" className="rounded-xl border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 shadow-sm">
                          Lire la suite
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Derniers articles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
                <div className="h-48 bg-gradient-to-r from-gray-400 to-gray-600"></div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-xl shadow-sm">
                      {post.category}
                    </span>
                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-xl">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 text-gray-600 text-xs px-3 py-1 rounded-xl shadow-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      <span className="mr-3 font-medium">{post.author}</span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(post.publishedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    
                    <Link href={`/blog/${slugify(post.title)}`}>
                      <Button variant="outline" size="sm" className="rounded-xl border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 shadow-sm">
                        Lire
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Restez informé
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Abonnez-vous à notre newsletter pour recevoir les derniers articles 
            et actualités directement dans votre boîte mail.
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Votre adresse email"
                className="bg-white text-gray-900 rounded-xl border-0 shadow-lg"
              />
              <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                S'abonner
              </Button>
            </div>
            <p className="text-sm mt-3 opacity-90">
              Pas de spam, désabonnement possible à tout moment.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Tags */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Tags populaires
          </h2>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {['React', 'Next.js', 'TypeScript', 'Python', 'JavaScript', 'Node.js', 'DevOps', 'IA', 'Sécurité', 'Performance', 'UI/UX', 'Mobile'].map((tag) => (
              <button
                key={tag}
                className="bg-gradient-to-r from-gray-50 to-blue-50 hover:from-purple-50 hover:to-blue-100 text-gray-700 hover:text-purple-700 px-4 py-2 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 font-medium"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </section>
      </div>
    </PublicLayout>
  )
}
function slugify(input: string) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
}
