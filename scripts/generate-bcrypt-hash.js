const bcrypt = require('bcryptjs')

async function generateBcryptHash() {
  const password = 'admin123'
  const saltRounds = 12
  
  try {
    const hash = await bcrypt.hash(password, saltRounds)
    console.log('🔑 Hash bcrypt pour le mot de passe "admin123":')
    console.log('')
    console.log(hash)
    console.log('')
    console.log('📋 Copie ce hash dans la colonne "password" de ta base de données')
    console.log('⚠️  Assure-toi que emailVerified n\'est pas NULL (mets la date actuelle)')
    console.log('⚠️  Assure-toi que isBlocked = false')
  } catch (error) {
    console.error('❌ Erreur lors de la génération du hash:', error)
  }
}

generateBcryptHash()