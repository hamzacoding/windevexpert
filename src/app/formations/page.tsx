import type { Metadata } from 'next'
import ClientPage from './ClientPage'

export const metadata: Metadata = {
  title: 'Formations - WindevExpert',
  description: 'Formations expertes pour développer vos compétences en WinDev, WebDev et technologies associées.',
  alternates: { canonical: '/formations' },
}

export default function Page() {
  return <ClientPage />
}
