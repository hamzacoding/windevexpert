import { Metadata } from 'next'
import { Users, Target, Award, Heart } from 'lucide-react'
import { PublicLayout } from '@/components/layout/public-layout'

export const metadata: Metadata = {
  title: 'À propos - WindevExpert',
  description: 'Découvrez WindevExpert, votre partenaire pour la formation en développement et les services de développement sur mesure pour PMI, PME et grandes entreprises.',
}

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              À propos de WindevExpert
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-blue-100">
              Votre partenaire de confiance pour la formation en développement 
              et les services de développement sur mesure pour entreprises.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
                Notre Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Chez WindevExpert, nous accompagnons les développeurs et les entreprises dans leur 
                transformation digitale. Notre mission est double : démocratiser l'accès aux 
                technologies de pointe par la formation, et offrir des services de développement 
                sur mesure pour les PMI, PME et grandes entreprises.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Nous nous engageons à fournir des solutions complètes qui allient formation 
                de qualité, développement d'applications métier, création de sites web professionnels, 
                et support technique exceptionnel pour tous nos clients.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">10,000+</h3>
                  <p className="text-gray-600 font-medium">Développeurs formés</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">500+</h3>
                  <p className="text-gray-600 font-medium">Projets réalisés</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">15+</h3>
                  <p className="text-gray-600 font-medium">Années d'expérience</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                    <Heart className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">98%</h3>
                  <p className="text-gray-600 font-medium">Satisfaction client</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Nos Valeurs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Les principes qui guident notre travail et nos relations avec nos clients.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <Target className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">Excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                Nous nous efforçons de maintenir les plus hauts standards de qualité 
                dans tout ce que nous faisons.
              </p>
            </div>
            
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <Users className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Nous croyons en la force du travail d'équipe et en l'importance 
                de construire des relations durables.
              </p>
            </div>
            
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <Heart className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">Passion</h3>
              <p className="text-gray-600 leading-relaxed">
                Notre passion pour la technologie et l'innovation nous pousse 
                à toujours aller plus loin.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Prêt à commencer votre parcours ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            Rejoignez des milliers de développeurs qui ont choisi WindevExpert 
            pour accélérer leur carrière.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/formations"
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-blue-50"
            >
              Voir nos formations
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white hover:text-blue-600"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>
      </div>
    </PublicLayout>
  )
}