import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { client: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        clientId: true,
        client: { select: { id: true, name: true, email: true, phone: true } },
        createdAt: true,
        updatedAt: true,
      }
    })

    const threadData = await Promise.all(
      projects.map(async (p) => {
        let last: any = null
        let total = 0
        try {
          last = await prisma.message.findFirst({
            where: { projectId: p.id },
            orderBy: { createdAt: 'desc' },
            select: { id: true, content: true, senderId: true, createdAt: true }
          })
          total = await prisma.message.count({ where: { projectId: p.id } })
        } catch {}
        return {
          projectId: p.id,
          title: p.title,
          status: p.status,
          client: p.client,
          totalMessages: total,
          lastMessage: last || null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }
      })
    )

    return NextResponse.json({ threads: threadData })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
