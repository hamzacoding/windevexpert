const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdminUser() {
  console.log('🔍 Vérification de l\'utilisateur admin...\n');

  try {
    // Chercher l'utilisateur admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@windevexpert.com' }
    });

    if (!adminUser) {
      console.log('❌ Utilisateur admin non trouvé!');
      console.log('📝 Création de l\'utilisateur admin...');
      
      // Créer l'utilisateur admin
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@windevexpert.com',
          name: 'Administrateur',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date(),
        }
      });
      
      console.log('✅ Utilisateur admin créé avec succès!');
      console.log(`   - ID: ${newAdmin.id}`);
      console.log(`   - Email: ${newAdmin.email}`);
      console.log(`   - Rôle: ${newAdmin.role}`);
    } else {
      console.log('✅ Utilisateur admin trouvé:');
      console.log(`   - ID: ${adminUser.id}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Nom: ${adminUser.name}`);
      console.log(`   - Rôle: ${adminUser.role}`);
      console.log(`   - Email vérifié: ${adminUser.emailVerified ? 'Oui' : 'Non'}`);
      console.log(`   - Mot de passe hashé: ${adminUser.password ? 'Oui' : 'Non'}`);
      
      // Vérifier le mot de passe
      if (adminUser.password) {
        const isValidPassword = await bcrypt.compare('admin123', adminUser.password);
        console.log(`   - Mot de passe valide: ${isValidPassword ? 'Oui' : 'Non'}`);
        
        if (!isValidPassword) {
          console.log('🔧 Mise à jour du mot de passe admin...');
          const hashedPassword = await bcrypt.hash('admin123', 12);
          await prisma.user.update({
            where: { id: adminUser.id },
            data: { password: hashedPassword }
          });
          console.log('✅ Mot de passe admin mis à jour!');
        }
      } else {
        console.log('🔧 Ajout du mot de passe manquant...');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { password: hashedPassword }
        });
        console.log('✅ Mot de passe admin ajouté!');
      }
    }

    // Vérifier tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        password: true
      }
    });

    console.log(`\n📊 Total utilisateurs: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ${user.password ? 'Avec mot de passe' : 'Sans mot de passe'}`);
    });

    console.log('\n🎯 Informations de connexion admin:');
    console.log('   - Email: admin@windevexpert.com');
    console.log('   - Mot de passe: admin123');
    console.log('   - URL de connexion: http://localhost:3000/auth/signin');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();