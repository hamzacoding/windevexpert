const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function debugAuthFlow() {
  try {
    console.log('🔍 Starting comprehensive authentication debugging...\n')
    
    // 1. Check database connection
    console.log('1️⃣ Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful\n')
    
    // 2. Check admin user details
    console.log('2️⃣ Checking admin user details...')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@windevexpert.com' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        emailVerified: true,
        isBlocked: true,
        blockedReason: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!adminUser) {
      console.log('❌ Admin user not found!')
      return
    }

    console.log('📋 Admin user details:')
    console.log(`   ID: ${adminUser.id}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Name: ${adminUser.name}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   Email Verified: ${adminUser.emailVerified}`)
    console.log(`   Is Blocked: ${adminUser.isBlocked}`)
    console.log(`   Blocked Reason: ${adminUser.blockedReason}`)
    console.log(`   Password Hash Length: ${adminUser.password ? adminUser.password.length : 'NULL'}`)
    console.log(`   Created At: ${adminUser.createdAt}`)
    console.log(`   Updated At: ${adminUser.updatedAt}\n`)

    // 3. Test password verification
    console.log('3️⃣ Testing password verification...')
    if (!adminUser.password) {
      console.log('❌ No password hash found!')
      return
    }

    const testPassword = 'admin123'
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password)
    console.log(`   Testing password "${testPassword}": ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`)

    // Test with different passwords to ensure bcrypt is working
    const wrongPassword = 'wrongpassword'
    const isWrongPasswordValid = await bcrypt.compare(wrongPassword, adminUser.password)
    console.log(`   Testing wrong password "${wrongPassword}": ${isWrongPasswordValid ? '❌ SHOULD BE INVALID' : '✅ CORRECTLY INVALID'}\n`)

    // 4. Check authentication conditions
    console.log('4️⃣ Checking authentication conditions...')
    
    const conditions = [
      { name: 'User exists', passed: !!adminUser },
      { name: 'Password exists', passed: !!adminUser.password },
      { name: 'Password is valid', passed: isPasswordValid },
      { name: 'Email is verified', passed: !!adminUser.emailVerified },
      { name: 'User is not blocked', passed: !adminUser.isBlocked }
    ]

    conditions.forEach(condition => {
      console.log(`   ${condition.passed ? '✅' : '❌'} ${condition.name}`)
    })

    const allConditionsPassed = conditions.every(c => c.passed)
    console.log(`\n   Overall authentication should: ${allConditionsPassed ? '✅ SUCCEED' : '❌ FAIL'}\n`)

    // 5. Check NextAuth environment variables
    console.log('5️⃣ Checking NextAuth environment variables...')
    const envVars = [
      { name: 'NEXTAUTH_SECRET', value: process.env.NEXTAUTH_SECRET },
      { name: 'NEXTAUTH_URL', value: process.env.NEXTAUTH_URL },
      { name: 'DATABASE_URL', value: process.env.DATABASE_URL }
    ]

    envVars.forEach(envVar => {
      console.log(`   ${envVar.value ? '✅' : '❌'} ${envVar.name}: ${envVar.value ? 'SET' : 'NOT SET'}`)
    })

    // 6. Test database query performance
    console.log('\n6️⃣ Testing database query performance...')
    const startTime = Date.now()
    await prisma.user.findUnique({ where: { email: 'admin@windevexpert.com' } })
    const queryTime = Date.now() - startTime
    console.log(`   Query time: ${queryTime}ms ${queryTime < 100 ? '✅' : '⚠️'}\n`)

    // 7. Summary and recommendations
    console.log('📊 SUMMARY:')
    if (allConditionsPassed) {
      console.log('✅ All authentication conditions are met')
      console.log('🔍 The 401 error might be caused by:')
      console.log('   - NextAuth configuration issues')
      console.log('   - Session/JWT token problems')
      console.log('   - Network/timing issues')
      console.log('   - Browser cache/cookies')
    } else {
      console.log('❌ Authentication conditions not met')
      console.log('🔧 Fix the failed conditions above')
    }

    console.log('\n🔗 Test login at: http://localhost:3000/auth/signin')
    console.log('📧 Email: admin@windevexpert.com')
    console.log('🔑 Password: admin123')

  } catch (error) {
    console.error('❌ Error during authentication debugging:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAuthFlow()