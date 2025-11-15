import fs from 'fs';
import path from 'path';

// URL du fichier JSON officiel contenant toutes les données
const ALGERIA_DATA_URL = 'https://raw.githubusercontent.com/othmanus/algeria-cities/master/json/algeria_cities.json';

interface CommuneData {
  id: number;
  commune_name_ascii: string;
  commune_name: string;
  daira_name_ascii: string;
  daira_name: string;
  wilaya_code: string;
  wilaya_name_ascii: string;
  wilaya_name: string;
}

async function downloadAndTransformAlgeriaData(): Promise<void> {
  try {
    console.log('📥 Téléchargement des données officielles depuis othmanus/algeria-cities...');
    
    const response = await fetch(ALGERIA_DATA_URL);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const rawData: CommuneData[] = await response.json();
    console.log(`✅ Données téléchargées avec succès: ${rawData.length} communes`);
    
    // Grouper les données par wilaya
    const wilayasMap = new Map<string, {
      code: string;
      name: string;
      nameAr: string;
      communes: Array<{code: string, name: string, nameAr: string}>;
    }>();
    
    for (const commune of rawData) {
      const wilayaCode = commune.wilaya_code;
      
      if (!wilayasMap.has(wilayaCode)) {
        wilayasMap.set(wilayaCode, {
          code: wilayaCode,
          name: commune.wilaya_name_ascii,
          nameAr: commune.wilaya_name,
          communes: []
        });
      }
      
      const wilaya = wilayasMap.get(wilayaCode)!;
      wilaya.communes.push({
        code: commune.id.toString(),
        name: commune.commune_name_ascii,
        nameAr: commune.commune_name
      });
    }
    
    // Convertir en tableaux triés
    const wilayas = Array.from(wilayasMap.values())
      .sort((a, b) => parseInt(a.code) - parseInt(b.code))
      .map(w => ({
        code: w.code,
        name: w.name,
        nameAr: w.nameAr
      }));
    
    const communes: Record<string, Array<{code: string, name: string, nameAr: string}>> = {};
    for (const [code, wilaya] of wilayasMap) {
      communes[code] = wilaya.communes.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    console.log(`📊 Données transformées:`);
    console.log(`   - ${wilayas.length} wilayas`);
    console.log(`   - ${Object.values(communes).flat().length} communes au total`);
    
    // Générer le contenu du fichier TypeScript
    const fileContent = `// Données complètes des 58 wilayas d'Algérie selon les sources officielles
// Source: https://github.com/othmanus/algeria-cities
// Téléchargé le: ${new Date().toISOString()}
// Total: ${wilayas.length} wilayas, ${Object.values(communes).flat().length} communes

export const ALL_WILAYAS_DATA = ${JSON.stringify(wilayas, null, 2)};

export const ALL_COMMUNES_DATA: Record<string, Array<{code: string, name: string, nameAr: string}>> = ${JSON.stringify(communes, null, 2)};

// Statistiques
export const ALGERIA_STATS = {
  totalWilayas: ${wilayas.length},
  totalCommunes: ${Object.values(communes).flat().length},
  downloadDate: '${new Date().toISOString()}',
  source: 'https://github.com/othmanus/algeria-cities'
};

// Fonction utilitaire pour obtenir les communes d'une wilaya
export function getCommunesByWilaya(wilayaCode: string) {
  return ALL_COMMUNES_DATA[wilayaCode] || [];
}

// Fonction utilitaire pour obtenir une wilaya par son code
export function getWilayaByCode(code: string) {
  return ALL_WILAYAS_DATA.find(w => w.code === code);
}
`;
    
    // Écrire le fichier
    const outputPath = path.join(process.cwd(), 'scripts', 'complete-algeria-data.ts');
    fs.writeFileSync(outputPath, fileContent, 'utf8');
    
    console.log(`✅ Fichier généré: ${outputPath}`);
    console.log(`📈 Statistiques détaillées:`);
    console.log(`   - Wilayas: ${wilayas.length}`);
    console.log(`   - Communes: ${Object.values(communes).flat().length}`);
    
    // Afficher quelques exemples
    console.log(`\n📋 Exemples de données:`);
    const firstWilaya = wilayas[0];
    console.log(`   Première wilaya: ${firstWilaya.name} (${firstWilaya.nameAr}) - Code: ${firstWilaya.code}`);
    console.log(`   Communes de ${firstWilaya.name}: ${communes[firstWilaya.code].length}`);
    console.log(`   Première commune: ${communes[firstWilaya.code][0].name} (${communes[firstWilaya.code][0].nameAr})`);
    
    const lastWilaya = wilayas[wilayas.length - 1];
    console.log(`   Dernière wilaya: ${lastWilaya.name} (${lastWilaya.nameAr}) - Code: ${lastWilaya.code}`);
    console.log(`   Communes de ${lastWilaya.name}: ${communes[lastWilaya.code].length}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error);
    throw error;
  }
}

// Exécuter le script
downloadAndTransformAlgeriaData();