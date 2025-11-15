import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkAndCreateAdmin() {
  try {
    console.log('🔍 Vérification des utilisateurs admin...')
    
    // Vérifier s'il y a des utilisateurs admin
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true }
    })
    
    console.log('👥 Utilisateurs admin trouvés:', adminUsers)
    
    if (adminUsers.length === 0) {
      console.log('⚠️ Aucun utilisateur admin trouvé. Création d\'un admin par défaut...')
      
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@windevexpert.com',
          name: 'Admin',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date()
        }
      })
      
      console.log('✅ Utilisateur admin créé:', adminUser)
    } else {
      console.log('✅ Utilisateurs admin existants trouvés')
    }
    
    // Vérifier les tables nécessaires
    console.log('📋 Vérification des demandes de devis...')
    const quotesCount = await prisma.quoteRequest.count()
    console.log(`📊 Nombre de demandes de devis: ${quotesCount}`)
    
    console.log('🛒 Vérification des commandes...')
    const ordersCount = await prisma.order.count()
    console.log(`📊 Nombre de commandes: ${ordersCount}`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateAdmin()