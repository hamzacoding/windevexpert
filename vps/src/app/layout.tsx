import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/animations.css'
import { Providers } from '@/components/providers'
import { PageWrapper } from '@/components/layout/page-wrapper'
import { ScrollToTop } from '@/components/ui/scroll-to-top'
import { Toaster } from 'react-hot-toast'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WindevExpert - Plateforme SaaS de Développement',
  description: 'Plateforme SaaS pour services de développement, formations et gestion de projets',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className}>
        <Providers initialSession={session}>
          <PageWrapper>
            {children}
          </PageWrapper>
          <ScrollToTop />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
