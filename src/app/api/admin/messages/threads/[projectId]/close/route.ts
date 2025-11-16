import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const closed = Boolean(body.closed ?? true)

    const status = closed ? 'CANCELLED' : 'IN_PROGRESS'
    const updated = await prisma.project.update({
      where: { id: params.projectId },
      data: { status }
    })

    return NextResponse.json({ projectId: updated.id, status: updated.status })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
