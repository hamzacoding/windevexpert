'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle, 
  Mail, 
  Phone, 
  Clock, 
  ArrowRight, 
  Home,
  Calendar,
  MessageSquare
} from 'lucide-react'

export default function QuoteConfirmationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <Image
              src="/windevexpert-logo-106x60.png"
              alt="WindevExpert"
              width={106}
              height={60}
              priority
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Message de confirmation principal */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demande envoyée avec succès !
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Merci pour votre confiance. Nous avons bien reçu votre demande de devis 
            et nous vous contacterons très prochainement.
          </p>
        </div>

        {/* Informations sur la suite */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Confirmation par email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Un email de confirmation a été envoyé à votre adresse. 
                Vous y trouverez un récapitulatif de votre demande.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Délai de réponse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Notre équipe analysera votre projet et vous contactera 
                <strong> sous 24 heures</strong> pour discuter des détails.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Prochaines étapes */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Prochaines étapes
            </CardTitle>
            <CardDescription>
              Voici ce qui va se passer maintenant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Analyse de votre demande</h3>
                  <p className="text-gray-600 text-sm">
                    Notre équipe technique étudie votre projet en détail pour comprendre vos besoins.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Premier contact</h3>
                  <p className="text-gray-600 text-sm">
                    Nous vous contactons pour clarifier certains points et mieux cerner vos attentes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Devis personnalisé</h3>
                  <p className="text-gray-600 text-sm">
                    Nous préparons un devis détaillé avec les spécifications techniques et le planning.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Présentation du devis</h3>
                  <p className="text-gray-600 text-sm">
                    Rendez-vous (visio ou présentiel) pour vous présenter notre proposition.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact d'urgence */}
        <Card className="mb-12 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <Phone className="w-5 h-5 mr-2" />
              Besoin urgent ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              Si votre projet est urgent ou si vous avez des questions immédiates, 
              n'hésitez pas à nous contacter directement :
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100" asChild>
                <a href="tel:+33123456789">
                  <Phone className="w-4 h-4 mr-2" />
                  01 23 45 67 89
                </a>
              </Button>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100" asChild>
                <a href="mailto:contact@windevexpert.com">
                  <Mail className="w-4 h-4 mr-2" />
                  contact@windevexpert.com
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/services">
                Découvrir nos services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Vous pouvez également nous suivre sur nos réseaux sociaux pour rester informé 
              de nos actualités et conseils techniques.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}