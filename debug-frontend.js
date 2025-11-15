// Script de débogage pour tester le filtrage frontend
const fetch = require('node-fetch');

async function testFrontendFiltering() {
  try {
    console.log('🔍 Test du filtrage frontend...');
    
    const response = await fetch('http://localhost:3000/api/courses');
    const data = await response.json();
    
    console.log('✅ Formations récupérées:', data.courses?.length || 0);
    
    if (data.courses && data.courses.length > 0) {
      console.log('\n📋 Détails des formations:');
      data.courses.forEach((course, index) => {
        console.log(`\n${index + 1}. ${course.title}`);
        console.log(`   - ID: ${course.id}`);
        console.log(`   - Catégorie: "${course.category}"`);
        console.log(`   - Niveau: "${course.level}"`);
        console.log(`   - Prix Euro: ${course.priceEuro}`);
        console.log(`   - Prix DA: ${course.priceDA}`);
      });
      
      // Test des filtres
      console.log('\n🔍 Test des filtres:');
      
      // Filtre par catégorie "Développement Web"
      const webDevCourses = data.courses.filter(course => 
        course.category === 'Développement Web'
      );
      console.log(`\n📊 Formations "Développement Web": ${webDevCourses.length}`);
      
      // Filtre par niveau "BEGINNER"
      const beginnerCourses = data.courses.filter(course => 
        course.level === 'BEGINNER'
      );
      console.log(`📊 Formations "BEGINNER": ${beginnerCourses.length}`);
      
      // Filtre par niveau "ADVANCED"
      const advancedCourses = data.courses.filter(course => 
        course.level === 'ADVANCED'
      );
      console.log(`📊 Formations "ADVANCED": ${advancedCourses.length}`);
      
      // Filtre par prix 0-100
      const cheapCourses = data.courses.filter(course => 
        course.priceEuro >= 0 && course.priceEuro <= 100
      );
      console.log(`📊 Formations 0-100€: ${cheapCourses.length}`);
      
      // Filtre par prix 100-300
      const midCourses = data.courses.filter(course => 
        course.priceEuro > 100 && course.priceEuro <= 300
      );
      console.log(`📊 Formations 100-300€: ${midCourses.length}`);
      
      // Filtre par prix 300+
      const expensiveCourses = data.courses.filter(course => 
        course.priceEuro > 300
      );
      console.log(`📊 Formations 300€+: ${expensiveCourses.length}`);
      
      // Test avec filtres par défaut (Tous)
      console.log('\n🎯 Test avec filtres par défaut:');
      const defaultFiltered = data.courses.filter(course => {
        // Filtre par catégorie
        const categoryMatch = 'Tous' === 'Tous' || course.category === 'Tous';
        
        // Filtre par niveau  
        const levelMatch = 'Tous' === 'Tous' || course.level === 'Tous';
        
        // Filtre par prix
        const priceMatch = 'all' === 'all';
        
        console.log(`   ${course.title}: catégorie=${categoryMatch}, niveau=${levelMatch}, prix=${priceMatch}`);
        
        return categoryMatch && levelMatch && priceMatch;
      });
      console.log(`📊 Formations après filtrage par défaut: ${defaultFiltered.length}`);
      
    } else {
      console.log('❌ Aucune formation trouvée dans la réponse');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testFrontendFiltering();