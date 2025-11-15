import { PrismaClient } from '@prisma/client';
import { ALL_WILAYAS_DATA, ALL_COMMUNES_DATA, ALGERIA_STATS } from './all-58-wilayas-data.js';

const prisma = new PrismaClient();

async function seedAlgeriaGeography() {
  console.log('🇩🇿 Début de l\'injection des données géographiques complètes de l\'Algérie...');
  console.log(`📊 Source: ${ALGERIA_STATS.source}`);
  console.log(`📅 Téléchargé le: ${ALGERIA_STATS.downloadDate}`);
  console.log(`📈 Total: ${ALGERIA_STATS.totalWilayas} wilayas, ${ALGERIA_STATS.totalCommunes} communes`);
  
  try {
    // Supprimer toutes les données existantes
    console.log('🗑️ Suppression des données existantes...');
    await prisma.commune.deleteMany({});
    await prisma.wilaya.deleteMany({});
    console.log('✅ Données existantes supprimées');

    let totalWilayasCreated = 0;
    let totalCommunesCreated = 0;

    // Créer toutes les wilayas et leurs communes
    for (const wilayaData of ALL_WILAYAS_DATA) {
      console.log(`📍 Création de la wilaya: ${wilayaData.name} (${wilayaData.nameAr}) - Code: ${wilayaData.code}`);
      
      // Créer la wilaya
      const wilaya = await prisma.wilaya.create({
        data: {
          code: wilayaData.code,
          name: wilayaData.name,
          nameAr: wilayaData.nameAr,
        },
      });
      totalWilayasCreated++;

      // Récupérer les communes de cette wilaya
      const communesData = ALL_COMMUNES_DATA[wilayaData.code] || [];
      
      if (communesData.length > 0) {
        console.log(`  📋 Création de ${communesData.length} communes pour ${wilayaData.name}...`);
        
        // Créer toutes les communes de cette wilaya
        for (const communeData of communesData) {
          await prisma.commune.create({
            data: {
              code: communeData.code,
              name: communeData.name,
              nameAr: communeData.nameAr,
              wilayaId: wilaya.id,
            },
          });
          totalCommunesCreated++;
        }
        
        console.log(`  ✅ ${communesData.length} communes créées pour ${wilayaData.name}`);
      } else {
        console.log(`  ⚠️ Aucune commune trouvée pour ${wilayaData.name}`);
      }
    }

    console.log('\n🎉 Injection terminée avec succès !');
    console.log(`📊 Statistiques finales:`);
    console.log(`   - Wilayas créées: ${totalWilayasCreated}/${ALGERIA_STATS.totalWilayas}`);
    console.log(`   - Communes créées: ${totalCommunesCreated}/${ALGERIA_STATS.totalCommunes}`);
    
    // Vérification finale
    const wilayaCount = await prisma.wilaya.count();
    const communeCount = await prisma.commune.count();
    
    console.log(`\n🔍 Vérification en base de données:`);
    console.log(`   - Wilayas en base: ${wilayaCount}`);
    console.log(`   - Communes en base: ${communeCount}`);
    
    if (wilayaCount === ALGERIA_STATS.totalWilayas && communeCount === ALGERIA_STATS.totalCommunes) {
      console.log('✅ Toutes les données ont été correctement injectées !');
    } else {
      console.log('⚠️ Il y a une différence entre les données attendues et celles en base');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'injection des données:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script directement
seedAlgeriaGeography()
  .then(() => {
    console.log('🏁 Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });

export { seedAlgeriaGeography };