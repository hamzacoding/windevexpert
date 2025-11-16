import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    let messages: any[] = []
    try {
      messages = await prisma.message.findMany({
        where: { projectId: params.projectId },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          content: true,
          senderId: true,
          createdAt: true,
          sender: { select: { id: true, name: true, email: true, phone: true } }
        }
      })
    } catch {}

    return NextResponse.json({ messages })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const content = String(body.content || '')
    if (!content.trim()) {
      return NextResponse.json({ error: 'Contenu requis' }, { status: 400 })
    }

    const created = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        projectId: params.projectId,
      },
      select: {
        id: true,
        content: true,
        senderId: true,
        createdAt: true
      }
    })

    await prisma.project.update({ where: { id: params.projectId }, data: { updatedAt: new Date() } })
    return NextResponse.json({ message: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
