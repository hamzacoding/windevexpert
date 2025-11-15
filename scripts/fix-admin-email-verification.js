const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixAdminEmailVerification() {
  try {
    console.log('🔍 Checking admin user email verification status...')
    
    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@windevexpert.com' },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        isBlocked: true,
        role: true
      }
    })

    if (!adminUser) {
      console.log('❌ Admin user not found!')
      return
    }

    console.log('📋 Current admin user status:')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Name: ${adminUser.name}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   Email Verified: ${adminUser.emailVerified}`)
    console.log(`   Is Blocked: ${adminUser.isBlocked}`)

    // Fix email verification if needed
    if (!adminUser.emailVerified) {
      console.log('🔧 Fixing email verification for admin user...')
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          emailVerified: new Date(),
          isBlocked: false
        }
      })
      
      console.log('✅ Admin user email verification fixed!')
    } else {
      console.log('✅ Admin user email is already verified!')
    }

    // Ensure user is not blocked
    if (adminUser.isBlocked) {
      console.log('🔧 Unblocking admin user...')
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          isBlocked: false,
          blockedReason: null
        }
      })
      
      console.log('✅ Admin user unblocked!')
    }

    console.log('\n🎉 Admin user is ready for login!')
    console.log('📧 Email: admin@windevexpert.com')
    console.log('🔑 Password: admin123')
    console.log('🌐 Login URL: http://localhost:3000/auth/signin')

  } catch (error) {
    console.error('❌ Error fixing admin email verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminEmailVerification()