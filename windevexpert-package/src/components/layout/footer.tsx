'use client'

import Link from 'next/link'
import { Facebook, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, Instagram, Github } from 'lucide-react'
import { useContactSettings } from '@/hooks/useContactSettings'

export function Footer() {
  const { settings } = useContactSettings()
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              {settings?.companyName || 'WindevExpert'}
            </h3>
            <p className="text-gray-300 mb-4">
              {settings?.description || 'Votre partenaire de confiance pour le développement d\'applications, la formation technique et l\'accompagnement de vos projets digitaux.'}
            </p>
            <div className="space-y-2">
              {settings?.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <a href={`mailto:${settings.email}`} className="text-gray-300 hover:text-white transition-colors">
                    {settings.email}
                  </a>
                </div>
              )}
              {settings?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <a href={`tel:${settings.phone}`} className="text-gray-300 hover:text-white transition-colors">
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings?.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">{settings.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/formations" className="text-gray-300 hover:text-white transition-colors">
                  Formations
                </Link>
              </li>
              <li>
                <Link href="/produits" className="text-gray-300 hover:text-white transition-colors">
                  Produits
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/mentions-legales" className="text-gray-300 hover:text-white transition-colors">
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="text-gray-300 hover:text-white transition-colors">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="text-gray-300 hover:text-white transition-colors">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-gray-300 hover:text-white transition-colors">
                  CGU
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            {settings?.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {settings?.twitter && (
              <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {settings?.linkedin && (
              <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {settings?.youtube && (
              <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            )}
            {settings?.github && (
              <a href={settings.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 {settings?.companyName || 'WindevExpert'}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}