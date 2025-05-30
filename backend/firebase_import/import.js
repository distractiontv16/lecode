// Script d'importation Firebase pour quizzes.json
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de configuration Firebase
const serviceAccount = require('../config/serviceAccountKey.json');

// Initialiser l'application Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importQuizzes() {
  try {
    console.log('Lecture du fichier quizzes.json...');
    const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'quizzes.json'), 'utf8'));
    
    // Vérifier la structure brute du fichier
    console.log('Structure brute du fichier:');
    console.log(JSON.stringify(Object.keys(rawData), null, 2));
    
    // Examiner le contenu pour déterminer la structure
    let quizzesData;
    
    // Si le fichier a une structure avec "quizzes" comme clé principale
    if (rawData.quizzes) {
      console.log('Structure détectée: { quizzes: { ... } }');
      quizzesData = rawData.quizzes;
    } else {
      console.log('Structure détectée: structure directe par difficulté');
      quizzesData = rawData;
    }
    
    // Parcourir toutes les difficultés (facile, moyen, difficile)
    for (const difficulty in quizzesData) {
      console.log(`\nDifficulté: ${difficulty}`);
      const categoryData = quizzesData[difficulty];
      
      // Vérifier si la catégorie est un objet ou un tableau
      if (Array.isArray(categoryData)) {
        // C'est un tableau de quiz directement
        console.log(`Import de ${categoryData.length} quiz pour ${difficulty}...`);
        
        // Créer une collection pour cette difficulté
        const categoryId = `maladies_${difficulty}`;
        for (let i = 0; i < categoryData.length; i++) {
          const quiz = categoryData[i];
          const quizIndex = i + 1;
          const quizId = `${categoryId}_quiz_${quizIndex}`;
          
          console.log(`  - Import du quiz: ${quizId}`);
          
          // Créer la référence à la collection et au document
          const quizRef = db.collection('quizzes')
                           .doc(difficulty)
                           .collection(categoryId)
                           .doc(quizId);
          
          // Enregistrer le quiz
          await quizRef.set({
            ...quiz,
            id: quizId,
            index: quizIndex
          });
        }
      } else {
        // C'est un objet avec des catégories
        for (const categoryId in categoryData) {
          const quizzes = categoryData[categoryId];
          
          // Vérifier si c'est un objet ou un tableau
          if (!Array.isArray(quizzes)) {
            console.log(`  - Catégorie ${categoryId}: format non valide (doit être un tableau)`);
            continue;
          }
          
          console.log(`  - Catégorie ${categoryId}: ${quizzes.length} quiz`);
          
          // Créer une collection pour cette catégorie
          for (let i = 0; i < quizzes.length; i++) {
            const quiz = quizzes[i];
            const quizIndex = quiz.index || i + 1;
            const quizId = quiz.id || `${categoryId}_quiz_${quizIndex}`;
            
            console.log(`    - Import du quiz: ${quizId}`);
            
            // Créer la référence à la collection et au document
            const quizRef = db.collection('quizzes')
                             .doc(difficulty)
                             .collection(categoryId)
                             .doc(quizId);
            
            // Enregistrer le quiz
            await quizRef.set({
              ...quiz,
              id: quizId,
              index: quizIndex
            });
          }
        }
      }
    }
    
    console.log('\nImportation terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'importation:', error);
  }
}

// Exécuter l'importation
importQuizzes()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 