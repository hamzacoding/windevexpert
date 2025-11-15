const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testClearCart() {
  console.log('🧪 Test du bouton "Vider le panier"...\n');

  try {
    // Générer un sessionId unique pour ce test
    const sessionId = `test_session_${Date.now()}`;
    console.log(`📝 Session ID de test: ${sessionId}`);

    // 1. Ajouter un produit au panier
    console.log('\n1️⃣ Ajout d\'un produit au panier...');
    const addResponse = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId: 'cm5aqhqhj0000uxqhqhqhqhqh', // ID d'un produit existant
        quantity: 2,
        sessionId: sessionId
      })
    });

    if (addResponse.ok) {
      const addResult = await addResponse.json();
      console.log('✅ Produit ajouté avec succès');
      console.log(`   Quantité dans le panier: ${addResult.cart.items.length} article(s)`);
      console.log(`   Total: ${addResult.cart.total}€`);
    } else {
      console.log(`❌ Erreur lors de l'ajout: ${addResponse.status}`);
      const error = await addResponse.text();
      console.log(`   Détails: ${error}`);
      return;
    }

    // 2. Vérifier que le panier contient des articles
    console.log('\n2️⃣ Vérification du contenu du panier...');
    const cartResponse = await fetch(`${BASE_URL}/api/cart?sessionId=${sessionId}`);
    
    if (cartResponse.ok) {
      const cartData = await cartResponse.json();
      console.log(`✅ Panier trouvé avec ${cartData.cart.items.length} article(s)`);
      console.log(`   Total avant vidage: ${cartData.cart.total}€`);
    } else {
      console.log(`❌ Erreur lors de la récupération du panier: ${cartResponse.status}`);
      return;
    }

    // 3. Vider le panier
    console.log('\n3️⃣ Test du bouton "Vider le panier"...');
    const clearResponse = await fetch(`${BASE_URL}/api/cart/clear?sessionId=${sessionId}`, {
      method: 'DELETE'
    });

    if (clearResponse.ok) {
      const clearResult = await clearResponse.json();
      console.log('✅ Panier vidé avec succès !');
      console.log(`   Message: ${clearResult.message}`);
      console.log(`   Articles restants: ${clearResult.cart.items.length}`);
      console.log(`   Total après vidage: ${clearResult.cart.total}€`);
      
      if (clearResult.cart.items.length === 0 && clearResult.cart.total === 0) {
        console.log('\n🎉 TEST RÉUSSI : Le bouton "Vider le panier" fonctionne correctement !');
      } else {
        console.log('\n❌ TEST ÉCHOUÉ : Le panier n\'est pas complètement vide');
      }
    } else {
      console.log(`❌ Erreur lors du vidage: Status ${clearResponse.status}`);
      const error = await clearResponse.text();
      console.log(`   Détails: ${error}`);
    }

    // 4. Vérification finale
    console.log('\n4️⃣ Vérification finale du panier...');
    const finalCartResponse = await fetch(`${BASE_URL}/api/cart?sessionId=${sessionId}`);
    
    if (finalCartResponse.ok) {
      const finalCartData = await finalCartResponse.json();
      console.log(`✅ Vérification finale: ${finalCartData.cart.items.length} article(s) dans le panier`);
      console.log(`   Total final: ${finalCartData.cart.total}€`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testClearCart();