import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useThemeMode } from '@/context/ThemeContext';
import Colors from '@/constants/Colors';
import SharedTransition from '@/components/navigation/SharedTransition';
import { DISEASES_BY_CATEGORY } from '@/constants/diseases';
import { Disease } from '@/types/diseases';

export default function DiseasesListScreen() {
  const { theme } = useThemeMode();
  const router = useRouter();
  const { category, title } = useLocalSearchParams();
  
  const diseases = DISEASES_BY_CATEGORY[category as string] || [];

  const navigateToDisease = (diseaseId: string, diseaseTitle: string) => {
    router.push({
      pathname: `/learn/${category}/disease/${diseaseId}`,
      params: { title: diseaseTitle }
    });
  };

  return (
    <SharedTransition transitionKey={`category-${category}`}>
      <ScrollView 
        style={[styles.container, { backgroundColor: Colors[theme].background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.categoryTitle, { color: Colors[theme].text }]}>
          {title}
        </Text>

        {diseases.map((disease) => (
          <TouchableOpacity
            key={disease.id}
            style={[styles.diseaseCard, { backgroundColor: Colors[theme].card }]}
            onPress={() => navigateToDisease(disease.id, disease.title)}
          >
            <View style={styles.diseaseContent}>
              <Image 
                source={disease.image}
                style={styles.diseaseImage}
                resizeMode="contain"
              />
              <View style={styles.diseaseInfo}>
                <Text style={[styles.diseaseTitle, { color: Colors[theme].text }]}>
                  {disease.title}
                </Text>
                <Text style={[styles.diseaseDescription, { color: Colors[theme].textSecondary }]}>
                  {disease.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SharedTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  diseaseCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  diseaseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diseaseImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  diseaseDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
}); 