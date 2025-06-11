import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Text, TouchableOpacity } from 'react-native';
import { DailyObjectives } from '../../../components/layout/DailyObjectives';
import { CategoryCard } from '../../../components/game/CategoryCard';
import { useRouter } from 'expo-router';
import SharedTransition from '@/components/navigation/SharedTransition';

const screenWidth = Dimensions.get('window').width;

interface Category {
  id: string;
  title: string;
  progress: number;
  color: string;
  image: any;
  isNew?: boolean;
  locked?: boolean;
}

export default function LearnScreen() {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const router = useRouter();
  
  // Daily objectives definition
  const dailyObjectives = [
    { id: '1', title: 'Quiz du jour', completed: true },
    { id: '2', title: 'Lecture santé', completed: false },
  ];

  const mainCategories: Category[] = [
    { 
      id: '1', 
      title: 'Troubles de la Digestion', 
      progress: 75, 
      color: '#FF9800', 
      image: require('../../../assets/images/nutrition.png')
    },
    { 
      id: '2', 
      title: 'Infections et Virus', 
      progress: 45, 
      color: '#F44336', 
      image: require('../../../assets/images/infections_virus.png')
    },
    { 
      id: '3', 
      title: 'Problèmes du Cerveau', 
      progress: 30, 
      color: '#2196F3', 
      image: require('../../../assets/images/cerveau.png')
    },
    { 
      id: '5', 
      title: 'Problèmes de Respiration', 
      progress: 60, 
      color: '#9C27B0', 
      image: require('../../../assets/images/respiration.png')
    },
  ];

  const additionalCategories: Category[] = [
    { 
      id: '6', 
      title: 'Maladies du Sang', 
      progress: 20, 
      color: '#607D8B', 
      image: require('../../../assets/images/sang.png')
    },
    { 
      id: '7', 
      title: 'Santé du Cœur', 
      progress: 55, 
      color: '#795548', 
      image: require('../../../assets/images/coeurs.png')
    },
    { 
      id: '4', 
      title: 'Défenses Immunitaires', 
      progress: 0, 
      color: '#4CAF50', 
      image: require('../../../assets/images/defenses_immunitaires.png'),
      isNew: true
    },
    { 
      id: '8', 
      title: 'Os et Muscles', 
      progress: 0, 
      color: '#3F51B5', 
      image: require('../../../assets/images/muscles.png'),
      isNew: true
    },
  ];

  const allCategories = [...mainCategories, ...(showAllCategories ? additionalCategories : [])];
  
  const toggleShowAllCategories = () => {
    setShowAllCategories(!showAllCategories);
  };

  // Fonction pour diviser les catégories en paires pour le rendu en rangées
  const renderCategoryRows = (categories: Category[]) => {
    const rows = [];
    for (let i = 0; i < categories.length; i += 2) {
      const leftCategory = categories[i];
      const rightCategory = categories[i + 1];
      
      rows.push(
        <View key={`row-${i}`} style={styles.categoriesRow}>
          <View style={styles.categoryItem}>
            <CategoryCard
              title={leftCategory.title}
              progress={leftCategory.progress}
              color={leftCategory.color}
              image={leftCategory.image}
              onPress={() => router.push({
                pathname: `/learn/${leftCategory.id}`,
                params: { title: leftCategory.title }
              })}
              isNew={leftCategory.isNew}
              locked={leftCategory.locked}
            />
          </View>
          
          {rightCategory && (
            <View style={styles.categoryItem}>
              <CategoryCard
                title={rightCategory.title}
                progress={rightCategory.progress}
                color={rightCategory.color}
                image={rightCategory.image}
                onPress={() => router.push({
                  pathname: `/learn/${rightCategory.id}`,
                  params: { title: rightCategory.title }
                })}
                isNew={rightCategory.isNew}
                locked={rightCategory.locked}
              />
            </View>
          )}
        </View>
      );
    }
    
    return rows;
  };

  return (
    <SharedTransition transitionKey="learn-screen">
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <DailyObjectives objectives={dailyObjectives} />
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <TouchableOpacity onPress={toggleShowAllCategories}>
            <Text style={styles.seeAllButton}>
              {showAllCategories ? 'Voir moins' : 'Voir tout'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.categoriesContainer}>
          {renderCategoryRows(allCategories)}
        </View>
      </ScrollView>
    </SharedTransition>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20, // Réduit car le padding est déjà géré par le layout parent
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 30,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryItem: {
    width: (screenWidth - 40) / 2,  // Largeur identique basée sur la largeur de l'écran
  },
}); 