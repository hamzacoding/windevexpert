'use client'

import Link from 'next/link'
import { TransitionLink } from '@/components/ui/transition-link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { 
  FloatingCard, 
  ParallaxSection, 
  AnimatedBackground, 
  ScrollReveal,
  PerformanceOptimizer 
} from '@/components/animations'
import { 
  Code, 
  GraduationCap, 
  Headphones, 
  Wrench, 
  ArrowRight, 
  CheckCircle,
  Star,
  Users,
  Award,
  Zap,
  Globe,
  Smartphone,
  Database,
  Cloud,
  Shield,
  TrendingUp,
  Brain,
  Bot,
  Cpu,
  Sparkles,
  Eye,
  MessageSquare
} from 'lucide-react'

export default function HomePage() {
  const services = [
    {
      icon: Code,
      title: 'Développement sur Mesure',
      description: 'Applications web, mobile et desktop adaptées à vos besoins spécifiques.',
      features: ['Sites web vitrine', 'Applications métier', 'E-commerce', 'Plateformes SaaS']
    },
    {
      icon: GraduationCap,
      title: 'Formations Techniques',
      description: 'Formations complètes pour maîtriser les technologies modernes.',
      features: ['Cours en ligne', 'Projets pratiques', 'À votre rythme', 'Support 24/7']
    },
    {
      icon: Headphones,
      title: 'Assistance Technique',
      description: 'Support et maintenance pour vos applications existantes.',
      features: ['Support réactif', 'Maintenance', 'Optimisation', 'Debugging']
    },
    {
      icon: Wrench,
      title: 'Consulting IT',
      description: 'Conseils stratégiques pour vos projets de transformation digitale.',
      features: ['Audit technique', 'Architecture', 'Stratégie', 'Accompagnement']
    }
  ]

  const stats = [
    { icon: Users, value: '500+', label: 'Clients Satisfaits' },
    { icon: Award, value: '1000+', label: 'Projets Réalisés' },
    { icon: Star, value: '4.9/5', label: 'Note Moyenne' },
    { icon: Zap, value: '99.9%', label: 'Disponibilité' }
  ]

  return (
    <PerformanceOptimizer>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground className="opacity-30" />
        
        {/* Parallax Elements */}
        <ParallaxSection speed={0.3} className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        </ParallaxSection>
        
        <ParallaxSection speed={0.5} className="absolute inset-0">
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl" />
        </ParallaxSection>
        
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <ScrollReveal direction="up" delay={0.2}>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Votre Partenaire
                <span className="block bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">Développement Digital</span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.4}>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Développement d'applications, formations techniques et accompagnement 
                personnalisé pour réussir vos projets digitaux.
              </p>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.6}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <FloatingCard hoverScale={1.1} rotateOnHover={false} glowEffect={false}>
                  <Link
                    href="#services"
                    className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 inline-flex items-center justify-center"
                  >
                    Découvrir nos Services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </FloatingCard>
                
                <FloatingCard hoverScale={1.1} rotateOnHover={false} glowEffect={false}>
                  <Link
                    href="/demande-devis"
                    className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 inline-flex items-center justify-center"
                  >
                    Demander un Devis
                  </Link>
                </FloatingCard>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm relative">
        <ParallaxSection speed={0.2} className="absolute inset-0">
          <div className="absolute top-10 right-20 w-32 h-32 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-2xl" />
        </ParallaxSection>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <FloatingCard 
                key={index} 
                delay={index * 0.1}
                className="text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 h-full flex flex-col"
                hoverScale={1.08}
                glowEffect={true}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl mb-4 shadow-lg">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 flex-grow">{stat.value}</div>
                <div className="text-gray-600 font-medium mt-auto">{stat.label}</div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 relative">
        <ParallaxSection speed={0.3} className="absolute inset-0">
          <div className="absolute top-32 left-16 w-48 h-48 bg-gradient-to-r from-purple-300/10 to-blue-300/10 rounded-full blur-3xl" />
        </ParallaxSection>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Nos Services
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              <span className="block sm:hidden">Une gamme complète de services pour accompagner<br />votre transformation digitale</span>
              <span className="hidden sm:block whitespace-nowrap">Une gamme complète de services pour accompagner votre transformation digitale</span>
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <FloatingCard 
                key={index} 
                delay={index * 0.2}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-100 h-full flex flex-col"
                hoverScale={1.03}
                rotateOnHover={true}
                glowEffect={true}
              >
                <div className="flex items-center mb-6">
                  <FloatingCard 
                    delay={index * 0.2 + 0.1}
                    className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-xl mr-4 shadow-lg"
                    hoverScale={1.2}
                    rotateOnHover={true}
                  >
                    <service.icon className="h-8 w-8 text-blue-600" />
                  </FloatingCard>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{service.title}</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2 flex-grow">
                  {service.features.map((feature, featureIndex) => (
                    <ScrollReveal 
                      key={featureIndex} 
                      direction="left" 
                      delay={index * 0.2 + featureIndex * 0.1}
                      className="flex items-center text-gray-700"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span className="font-medium">{feature}</span>
                    </ScrollReveal>
                  ))}
                </ul>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        {/* Parallax Background Elements */}
        <ParallaxSection speed={0.4} className="absolute inset-0">
          <div className="absolute top-16 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </ParallaxSection>
        
        <ParallaxSection speed={0.6} className="absolute inset-0">
          <div className="absolute bottom-16 right-1/4 w-60 h-60 bg-purple-300/20 rounded-full blur-3xl" />
        </ParallaxSection>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <ScrollReveal direction="up" delay={0.2}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Prêt à Démarrer Votre Projet ?
            </h2>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.4}>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Contactez-nous dès aujourd'hui pour discuter de vos besoins et obtenir un devis personnalisé.
            </p>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <FloatingCard hoverScale={1.1} rotateOnHover={false} glowEffect={false}>
                <TransitionLink
                  href="/demande-devis"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 inline-flex items-center justify-center"
                >
                  Parlez nous de votre projet
                  <ArrowRight className="ml-2 h-5 w-5" />
                </TransitionLink>
              </FloatingCard>
              
              <FloatingCard hoverScale={1.1} rotateOnHover={false} glowEffect={false}>
                <TransitionLink
                  href="/produits"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 inline-flex items-center justify-center"
                >
                  Nos produits
                </TransitionLink>
              </FloatingCard>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Section Spécialisation WinDev */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <AnimatedBackground />
        
        <ParallaxSection speed={0.3} className="absolute inset-0">
          <div className="absolute top-20 right-1/4 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl" />
        </ParallaxSection>
        
        <ParallaxSection speed={0.5} className="absolute inset-0">
          <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl" />
        </ParallaxSection>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Spécialistes WinDev & Technologies PC SOFT
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              <span className="block sm:hidden">Experts reconnus dans l'écosystème PC SOFT,<br />nous développons et formons sur toutes les technologies</span>
              <span className="hidden sm:block whitespace-nowrap">Experts reconnus dans l'écosystème PC SOFT, nous développons et formons sur toutes les technologies</span>
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* WinDev */}
            <FloatingCard delay={0.1}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Code className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">WinDev</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  Développement d'applications Windows natives performantes et modernes avec l'environnement WinDev.
                </p>
              </div>
            </FloatingCard>

            {/* WebDev */}
            <FloatingCard delay={0.2}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">WebDev</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  Création de sites web et applications web dynamiques avec WebDev et les dernières technologies.
                </p>
              </div>
            </FloatingCard>

            {/* WinDev Mobile */}
            <FloatingCard delay={0.3}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H7V6h10v10z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">WinDev Mobile</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  Applications mobiles natives iOS et Android avec WinDev Mobile pour une expérience optimale.
                </p>
              </div>
            </FloatingCard>

            {/* HFSQL & WLangage */}
            <FloatingCard delay={0.4}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">HFSQL & WLangage</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  Maîtrise complète de HFSQL et du WLangage pour des solutions robustes et performantes.
                </p>
              </div>
            </FloatingCard>
          </div>

          {/* Section Formation */}
          <ScrollReveal direction="up" delay={0.5} className="mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Formation & Accompagnement
              </h3>
              <p className="text-xl text-blue-100 mb-6 max-w-3xl mx-auto leading-relaxed">
                Nous formons vos équipes de développeurs aux technologies PC SOFT et les accompagnons dans leurs projets pour garantir leur succès.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <FloatingCard hoverScale={1.05} rotateOnHover={false} glowEffect={false}>
                  <TransitionLink
                    href="/formations"
                    className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 inline-flex items-center justify-center"
                  >
                    Nos formations
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </TransitionLink>
                </FloatingCard>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Section WordPress */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
        <AnimatedBackground />
        
        <ParallaxSection speed={0.4} className="absolute inset-0">
          <div className="absolute top-16 left-1/3 w-40 h-40 bg-blue-300/20 rounded-full blur-2xl" />
        </ParallaxSection>
        
        <ParallaxSection speed={0.6} className="absolute inset-0">
          <div className="absolute bottom-16 right-1/3 w-56 h-56 bg-green-300/15 rounded-full blur-3xl" />
        </ParallaxSection>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Développement WordPress Sur Mesure
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              <span className="block sm:hidden">Création de sites WordPress personnalisés,<br />thèmes et plugins développés selon vos besoins spécifiques</span>
              <span className="hidden sm:block whitespace-nowrap">Création de sites WordPress personnalisés, thèmes et plugins développés selon vos besoins spécifiques</span>
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sites WordPress */}
            <FloatingCard delay={0.1}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.109m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.135-2.85-.135-.584-.031-.661.854-.078.899 0 0 .541.075 1.116.105l1.659 4.537-2.425 7.266-4.037-11.803c.649-.03 1.234-.105 1.234-.105.583-.075.516-.93-.066-.899 0 0-1.755.135-2.88.135-.202 0-.438-.008-.69-.015C4.911 2.015 8.235 0 12.001 0c2.756 0 5.266 1.054 7.13 2.776-.045-.003-.087-.008-.125-.008-.945 0-1.616.824-1.616 1.712 0 .795.459 1.467.945 2.262.375.615.81 1.406.81 2.547 0 .795-.312 1.712-.735 2.992L16.455 7.02z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sites WordPress</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  Création de sites WordPress performants et optimisés, adaptés à vos besoins métier avec une interface d'administration intuitive.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">E-commerce</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">Corporate</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">Blog</span>
                </div>
              </div>
            </FloatingCard>

            {/* Thèmes Sur Mesure */}
            <FloatingCard delay={0.2}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Thèmes Sur Mesure</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  Développement de thèmes WordPress personnalisés avec des fonctionnalités spécifiques, design unique et optimisation SEO.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">Responsive</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">SEO</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">Performance</span>
                </div>
              </div>
            </FloatingCard>

            {/* Plugins Spécifiques */}
            <FloatingCard delay={0.3}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Plugins Spécifiques</h3>
                <p className="text-gray-600 leading-relaxed flex-grow">
                  Création de plugins WordPress sur mesure pour étendre les fonctionnalités de votre site selon vos besoins métier précis.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">API</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Intégrations</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Automatisation</span>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* Section Avantages WordPress */}
          <ScrollReveal direction="up" delay={0.4} className="mt-16">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Zap className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Pourquoi Choisir WordPress ?
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                WordPress allie flexibilité, performance et facilité d'utilisation pour créer des sites web professionnels et évolutifs.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center h-full flex flex-col">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-blue-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Facilité de gestion</h4>
                  <p className="text-gray-400 text-sm flex-grow">Interface intuitive pour gérer votre contenu</p>
                </div>
                
                <div className="text-center h-full flex flex-col">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Star className="h-6 w-6 text-green-400" />
                  </div>
                  <h4 className="font-semibold mb-2">SEO Optimisé</h4>
                  <p className="text-gray-400 text-sm flex-grow">Structure optimisée pour les moteurs de recherche</p>
                </div>
                
                <div className="text-center h-full flex flex-col">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <h4 className="font-semibold mb-2">Communauté Active</h4>
                  <p className="text-gray-400 text-sm flex-grow">Écosystème riche et support communautaire</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <FloatingCard hoverScale={1.05} rotateOnHover={false} glowEffect={false}>
                  <TransitionLink
                    href="/demande-devis"
                    className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center justify-center"
                  >
                    Demander un devis WordPress
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </TransitionLink>
                </FloatingCard>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Section Technologies Modernes */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <AnimatedBackground />
        
        {/* Effets de lumière animés */}
        <ParallaxSection speed={0.2} className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" />
        </ParallaxSection>
        
        <ParallaxSection speed={0.3} className="absolute inset-0">
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        </ParallaxSection>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
              Développement Web & Mobile Moderne
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              <span className="block sm:hidden">Solutions sur mesure avec les technologies<br />les plus performantes du marché</span>
              <span className="hidden sm:block whitespace-nowrap">Solutions sur mesure avec les technologies les plus performantes du marché</span>
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Applications Web Modernes */}
            <FloatingCard delay={0.1}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Applications Web</h3>
                <p className="text-gray-600 md:text-lg leading-relaxed mb-4 flex-grow">
                  Sites vitrine, e-commerce, plateformes SaaS et applications métier avec React et Vue.js.
                </p>
                <div className="flex flex-wrap gap-1 justify-center mt-auto">
                  <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full">React</span>
                  <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full">Vue.js</span>
                </div>
              </div>
            </FloatingCard>

            {/* Applications Mobiles */}
            <FloatingCard delay={0.2}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Applications Mobiles</h3>
                <p className="text-gray-600 md:text-lg leading-relaxed mb-4 flex-grow">
                  Apps iOS et Android natives ou hybrides pour tous vos besoins métier et grand public.
                </p>
                <div className="flex flex-wrap gap-1 justify-center mt-auto">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">React Native</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Flutter</span>
                </div>
              </div>
            </FloatingCard>

            {/* APIs & Backend */}
            <FloatingCard delay={0.3}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">APIs & Backend</h3>
                <p className="text-gray-600 md:text-lg leading-relaxed mb-4 flex-grow">
                  Systèmes robustes, APIs REST, intégrations tierces et architectures scalables.
                </p>
                <div className="flex flex-wrap gap-1 justify-center mt-auto">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Node.js</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Python</span>
                </div>
              </div>
            </FloatingCard>

            {/* Solutions Cloud */}
            <FloatingCard delay={0.4}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Cloud className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Solutions Cloud</h3>
                <p className="text-gray-600 md:text-lg leading-relaxed mb-4 flex-grow">
                  Déploiement, hébergement, monitoring et maintenance de vos applications.
                </p>
                <div className="flex flex-wrap gap-1 justify-center mt-auto">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">AWS</span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">Docker</span>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* Section Avantages */}
          <ScrollReveal direction="up" delay={0.5}>
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-3xl p-8 md:p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Pourquoi Choisir Nos Technologies ?
              </h3>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Des solutions modernes, performantes et évolutives pour accompagner votre croissance.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center h-full flex flex-col">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-3 border border-cyan-200">
                    <Zap className="h-6 w-6 text-cyan-600" />
                  </div>
                  <h4 className="font-semibold mb-2 text-gray-900">Performance</h4>
                  <p className="text-gray-600 text-sm flex-grow">Applications rapides et optimisées</p>
                </div>
                
                <div className="text-center h-full flex flex-col">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-200">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2 text-gray-900">Sécurité</h4>
                  <p className="text-gray-600 text-sm flex-grow">Protection avancée des données</p>
                </div>
                
                <div className="text-center h-full flex flex-col">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 border border-green-200">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2 text-gray-900">Évolutivité</h4>
                  <p className="text-gray-600 text-sm flex-grow">Solutions qui grandissent avec vous</p>
                </div>
                
                <div className="text-center h-full flex flex-col">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 border border-indigo-200">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold mb-2 text-gray-900">Support</h4>
                  <p className="text-gray-600 text-sm flex-grow">Accompagnement personnalisé</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <FloatingCard hoverScale={1.05} rotateOnHover={false} glowEffect={false}>
                  <TransitionLink
                    href="/demande-devis"
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 inline-flex items-center justify-center shadow-lg shadow-cyan-500/25"
                  >
                    Discuter de votre projet
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </TransitionLink>
                </FloatingCard>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Section Intelligence Artificielle */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <AnimatedBackground />
        
        {/* Effets de lumière animés */}
        <ParallaxSection speed={0.2} className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-pulse" />
        </ParallaxSection>
        
        <ParallaxSection speed={0.3} className="absolute inset-0">
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}} />
        </ParallaxSection>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Intelligence Artificielle & Innovation
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              <span className="block sm:hidden">Intégration de l'IA dans vos applications<br />pour des solutions intelligentes et performantes</span>
              <span className="hidden sm:block whitespace-nowrap">Intégration de l'IA dans vos applications pour des solutions intelligentes et performantes</span>
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Applications Web IA */}
            <FloatingCard delay={0.1}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Applications Web IA</h3>
                <p className="text-gray-600 md:text-lg leading-relaxed mb-4 flex-grow">
                  Chatbots intelligents, recommandations personnalisées, analyse prédictive et traitement automatique des données.
                </p>
                <div className="flex flex-wrap gap-1 justify-center mt-auto">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Chatbots</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">ML</span>
                </div>
              </div>
            </FloatingCard>

            {/* Applications Desktop IA */}
            <FloatingCard delay={0.2}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Cpu className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Applications Desktop IA</h3>
                <p className="text-gray-600 md:text-lg leading-relaxed mb-4 flex-grow">
                  Logiciels métier avec IA intégrée, automatisation des processus, reconnaissance vocale et analyse d'images.
                </p>
                <div className="flex flex-wrap gap-1 justify-center mt-auto">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">WinDev</span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">OCR</span>
                </div>
              </div>
            </FloatingCard>

            {/* Applications Mobile IA */}
            <FloatingCard delay={0.3}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Applications Mobile IA</h3>
                <p className="text-gray-600 md:text-lg leading-relaxed mb-4 flex-grow">
                  Reconnaissance faciale, réalité augmentée, assistants vocaux et géolocalisation intelligente.
                </p>
                <div className="flex flex-wrap gap-1 justify-center mt-auto">
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">AR/VR</span>
                  <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">Vision</span>
                </div>
              </div>
            </FloatingCard>

            {/* Plateformes IA */}
            <FloatingCard delay={0.4}>
              <div className="text-center p-6 h-full flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Plateformes IA</h3>
                <p className="text-gray-600 md:text-lg leading-relaxed mb-4 flex-grow">
                  Développement de plateformes complètes basées sur l'IA, APIs intelligentes et solutions SaaS.
                </p>
                <div className="flex flex-wrap gap-1 justify-center mt-auto">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">API IA</span>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">SaaS</span>
                </div>
              </div>
            </FloatingCard>
          </div>

          {/* Section Avantages IA */}
          <ScrollReveal direction="up" delay={0.5} className="mt-16">
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-3xl p-8 md:p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Pourquoi Intégrer l'IA ?
              </h3>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                L'intelligence artificielle transforme vos applications en solutions intelligentes qui s'adaptent et évoluent avec vos besoins.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center h-full flex flex-col">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 border border-purple-200">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2 text-gray-900">Automatisation</h4>
                  <p className="text-gray-600 text-sm flex-grow">Processus automatisés et intelligents</p>
                </div>
                
                <div className="text-center h-full flex flex-col">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 border border-indigo-200">
                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold mb-2 text-gray-900">Prédiction</h4>
                  <p className="text-gray-600 text-sm flex-grow">Analyses prédictives avancées</p>
                </div>
                
                <div className="text-center h-full flex flex-col">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3 border border-pink-200">
                    <MessageSquare className="h-6 w-6 text-pink-600" />
                  </div>
                  <h4 className="font-semibold mb-2 text-gray-900">Interaction</h4>
                  <p className="text-gray-600 text-sm flex-grow">Interfaces conversationnelles naturelles</p>
                </div>
                
                <div className="text-center h-full flex flex-col">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                    <Brain className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold mb-2 text-gray-900">Apprentissage</h4>
                  <p className="text-gray-600 text-sm flex-grow">Amélioration continue des performances</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <FloatingCard hoverScale={1.05} rotateOnHover={false} glowEffect={false}>
                  <TransitionLink
                    href="/demande-devis"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 inline-flex items-center justify-center shadow-lg shadow-purple-500/25"
                  >
                    Découvrir nos solutions IA
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </TransitionLink>
                </FloatingCard>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
      </div>
    </PerformanceOptimizer>
  )
}
