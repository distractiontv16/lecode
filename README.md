# MEDUCARE

MEDUCARE est une application mobile éducative dédiée à l'apprentissage de la santé et des premiers secours. Elle offre une expérience d'apprentissage interactive et ludique pour tous les âges.

## Fonctionnalités

- **Apprentissage par catégories**: Nutrition, Premiers Secours, Santé Mentale, Droit Médical
- **Quiz interactifs**: Testez vos connaissances avec des quiz thématiques
- **Suivi de progression**: Suivez votre évolution et débloquez des niveaux
- **Système de récompenses**: Gagnez des étoiles et des cœurs en progressant

## Fonctionnalités Gamification Meducare

### Niveaux et Barres de Progression
- Implémentation des niveaux (Facile, Moyen, Difficile) avec barres de progression
- Chaque niveau se remplit selon les catégories terminées (5 catégories = 100%)
- Les niveaux supérieurs sont débloqués quand le niveau précédent atteint 100%
- Bonus de 1000 XP pour la complétion d'un niveau entier

### Catégories de Maladies
- Système d'icônes indiquant l'état des catégories:
  - 🔒 Verrouillé: La catégorie précédente n'est pas terminée
  - 📖 Débloqué: La catégorie est disponible mais pas terminée
  - ✅ Terminé: Au moins un quiz complété dans la catégorie
- Badge 🏆 affiché quand tous les quiz d'une catégorie sont validés

### Déblocage Progressif des Quiz
- Un quiz est débloqué si le quiz précédent a été réussi avec score ≥ 60%
- L'écran de résultats affiche les XP gagnés, le temps passé et les statistiques détaillées
- Bouton d'accès direct au quiz suivant débloqué

### Système de Points (XP)
- Animation d'XP gagnés apparaissant dans le header après complétion
- Les étoiles et les XP sont unifiés dans l'interface
- Bonus de vitesse pour les quiz terminés rapidement

### Système de Cœurs (Vies)
- Maximum de 5 cœurs avec visuel dans le header
- Un cœur est perdu en cas d'échec à un quiz (<60%)
- Régénération automatique (1 cœur/heure)
- Sauvegarde des cœurs dans Firebase avec cache local
- Affichage du temps restant avant la prochaine régénération

## Installation

1. Clonez ce dépôt
2. Installez les dépendances avec `npm install`
3. Lancez l'application avec `npx expo start`

## Technologies utilisées

- React Native
- Expo
- TypeScript
- React Navigation (Drawer Navigation)

## Structure du projet

- `/app`: Fichiers de navigation et écrans principaux
- `/components`: Composants réutilisables
- `/constants`: Constantes de l'application (couleurs, layout)
- `/assets`: Images et ressources
- `/types`: Définitions de types TypeScript

## Captures d'écran

*À venir*

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Ce projet est sous licence MIT.


Je vais d'abord analyser le code existant pour proposer une structure adaptée.

Ran tool
Je vois que nous avons déjà une structure de base pour une application React Native. Pour intégrer Firebase et gérer l'authentification et les quiz, je propose d'ajouter une structure backend dédiée. Je vais créer un script batch pour mettre en place cette structure.

Voici la structure que je propose d'ajouter :

```
backend/
  ├── config/
  │   └── firebase.config.ts
  ├── services/
  │   ├── auth.service.ts
  │   └── quiz.service.ts
  ├── models/
  │   ├── user.model.ts
  │   └── quiz.model.ts
  ├── controllers/
  │   ├── auth.controller.ts
  │   └── quiz.controller.ts
  └── types/
      ├── auth.types.ts
      └── quiz.types.ts
```

Je vais créer un script batch pour générer cette structure :

```batch:scripts/create-backend-structure.bat
@echo off

mkdir backend
mkdir backend\config
mkdir backend\services
mkdir backend\models
mkdir backend\controllers
mkdir backend\types

type nul > backend\config\firebase.config.ts
type nul > backend\services\auth.service.ts
type nul > backend\services\quiz.service.ts
type nul > backend\models\user.model.ts
type nul > backend\models\quiz.model.ts
type nul > backend\controllers\auth.controller.ts
type nul > backend\controllers\quiz.controller.ts
type nul > backend\types\auth.types.ts
type nul > backend\types\quiz.types.ts

echo Structure backend créée avec succès !
pause
```
Maintenant, nous devons installer les dépendances nécessaires pour Firebase. Je vais vérifier les dépendances actuelles :

Read file: package.json
Je vois que vous avez déjà les dépendances Firebase installées ! C'est parfait. Maintenant, je vais créer un fichier de configuration Firebase de base :

```typescript:backend/config/firebase.config.ts
import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const firebaseConfig = {
  // TODO: Ajouter vos configurations Firebase ici
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services Firebase
export const firebaseAuth = auth();
export const firebaseDB = firestore();

export default app;
```
Voici ce que nous venons de mettre en place :

1. Une structure backend organisée avec :
   - `config/` : Pour la configuration Firebase
   - `services/` : Pour les services d'authentification et de quiz
   - `models/` : Pour définir les modèles de données
   - `controllers/` : Pour la logique métier
   - `types/` : Pour les types TypeScript

2. Un script batch pour créer automatiquement cette structure
3. Une configuration Firebase de base

Pour continuer, voici les prochaines étapes :

1. Exécutez le script `scripts/create-backend-structure.bat` pour créer la structure
2. Vous devrez remplacer les valeurs de configuration dans `backend/config/firebase.config.ts` avec vos propres informations Firebase
3. Ensuite, nous pourrons implémenter les services d'authentification et de quiz

Voulez-vous que nous passions à l'implémentation des services d'authentification ou avez-vous des questions sur la structure proposée ?
#   m e d u c a r e V 3  
 