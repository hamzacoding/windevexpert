import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leçon | WinDevExpert',
  description: 'Apprenez WinDev avec nos formations vidéo interactives et complètes.',
  openGraph: {
    title: 'Formations WinDev | WinDevExpert',
    description: 'Apprenez WinDev avec nos formations vidéo interactives et complètes.',
    type: 'website',
  }
}

export default function LessonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}