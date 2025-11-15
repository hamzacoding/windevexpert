'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PublicLayout } from '@/components/layout/public-layout'
import { useContactSettings } from '@/hooks/useContactSettings'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const { settings } = useContactSettings()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Message envoyé avec succès !')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        toast.error('Erreur lors de l\'envoi du message')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <PublicLayout>
      <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Une question ? Un projet ? Notre équipe est là pour vous accompagner.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Envoyez-nous un message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Votre nom"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Sujet de votre message"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Votre message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Envoyer le message
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations de contact
                </h2>
                <p className="text-gray-600 mb-8">
                  N'hésitez pas à nous contacter par l'un des moyens ci-dessous. 
                  Notre équipe vous répondra dans les plus brefs délais.
                </p>
              </div>

              <div className="space-y-6">
                {settings?.email && (
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <a href={`mailto:${settings.email}`} className="text-gray-600 hover:text-blue-600 transition-colors">
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}

                {(settings?.phone || settings?.whatsapp) && (
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 rounded-full p-3">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Téléphone</h3>
                      {settings?.phone && (
                        <a href={`tel:${settings.phone}`} className="text-gray-600 hover:text-green-600 transition-colors block">
                          {settings.phone}
                        </a>
                      )}
                      {settings?.whatsapp && (
                        <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors block">
                          WhatsApp: {settings.whatsapp}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {settings?.address && (
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 rounded-full p-3">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Adresse</h3>
                      <p className="text-gray-600 whitespace-pre-line">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                )}

                {settings?.openingHours && (
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 rounded-full p-3">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Horaires</h3>
                      <p className="text-gray-600 whitespace-pre-line">
                        {settings.openingHours}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Map placeholder */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Carte interactive</p>
                  <p className="text-sm text-gray-400">
                    Intégration Google Maps à venir
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trouvez rapidement les réponses aux questions les plus courantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Quels sont vos délais de réponse ?
              </h3>
              <p className="text-gray-600">
                Nous nous engageons à répondre à tous les messages dans un délai 
                de 24 heures maximum, du lundi au vendredi.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Proposez-vous un support technique ?
              </h3>
              <p className="text-gray-600">
                Oui, nous offrons un support technique complet pour tous nos 
                produits et formations, accessible 7j/7.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Comment puis-je suivre ma commande ?
              </h3>
              <p className="text-gray-600">
                Vous recevrez un email de confirmation avec un lien de suivi 
                dès que votre commande sera traitée.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Offrez-vous des formations personnalisées ?
              </h3>
              <p className="text-gray-600">
                Absolument ! Nous créons des formations sur mesure adaptées 
                aux besoins spécifiques de votre entreprise.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </PublicLayout>
  )
}