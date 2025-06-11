import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useThemeMode } from '@/context/ThemeContext';
import Colors from '@/constants/Colors';
import SharedTransition from '@/components/navigation/SharedTransition';
import { Ionicons } from '@expo/vector-icons';
import { DiseaseSection, DiseaseDetails } from '@/types/diseases';

const { width } = Dimensions.get('window');

type SectionType = 'symptoms' | 'causes' | 'prevention' | 'treatment' | 'whenToConsult';

const SECTIONS: { 
  type: SectionType; 
  title: string; 
  icon: keyof typeof Ionicons.glyphMap;
  emoji: string;
  color: string;
  description: string;
}[] = [
  { 
    type: 'symptoms', 
    title: 'Comment je me sens ?', 
    icon: 'medical-outline',
    emoji: '🤒',
    color: '#FF9800',
    description: 'Découvre les signes qui montrent que tu es malade'
  },
  { 
    type: 'causes', 
    title: 'Pourquoi je suis malade ?', 
    icon: 'help-circle-outline',
    emoji: '🔍',
    color: '#2196F3',
    description: 'Comprends ce qui peut te rendre malade'
  },
  { 
    type: 'prevention', 
    title: 'Comment me protéger ?', 
    icon: 'shield-checkmark-outline',
    emoji: '🛡️',
    color: '#4CAF50',
    description: 'Apprends à te protéger pour rester en bonne santé'
  },
  { 
    type: 'treatment', 
    title: 'Comment me soigner ?', 
    icon: 'fitness-outline',
    emoji: '💊',
    color: '#9C27B0',
    description: 'Découvre les solutions pour aller mieux'
  },
  { 
    type: 'whenToConsult', 
    title: 'Quand voir le docteur ?', 
    icon: 'time-outline',
    emoji: '👨‍⚕️',
    color: '#F44336',
    description: 'Sache quand il faut consulter un médecin'
  },
];

// Importer les détails des maladies depuis les constantes
import { DISEASE_DETAILS } from '@/constants/diseases';

export default function DiseaseDetailScreen() {
  const { theme } = useThemeMode();
  const { id, category } = useLocalSearchParams();
  const [activeSection, setActiveSection] = useState<SectionType>('symptoms');
  
  const diseaseDetails = DISEASE_DETAILS[id as string];

  if (!diseaseDetails) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <Text style={[styles.errorText, { color: Colors[theme].text }]}>
          Maladie non trouvée 😕
        </Text>
      </View>
    );
  }

  const activeColor = SECTIONS.find(s => s.type === activeSection)?.color || Colors.primary;

  return (
    <SharedTransition transitionKey={`disease-${id}`}>
      <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
        <ScrollView style={styles.scrollView}>
          {/* Header Section */}
          <View style={[styles.header, { backgroundColor: activeColor }]}>
            <Image 
              source={diseaseDetails.image}
              style={styles.diseaseImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              {diseaseDetails.title}
            </Text>
          </View>

          {/* Definition Card */}
          <View style={[styles.definitionCard, { backgroundColor: Colors[theme].card }]}>
            <View style={styles.definitionHeader}>
              <Text style={[styles.definitionTitle, { color: Colors[theme].text }]}>
                🤔 C'est quoi cette maladie ?
              </Text>
            </View>
            <Text style={[styles.definitionText, { color: Colors[theme].textSecondary }]}>
              {diseaseDetails.definition || "Une explication simple sera bientôt disponible !"}
            </Text>
            <View style={styles.definitionTips}>
              <Text style={[styles.tipsText, { color: activeColor }]}>
                💡 Le savais-tu ? {diseaseDetails.funFact || ""}
              </Text>
            </View>
          </View>

          {/* Navigation Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
          >
            {SECTIONS.map((section) => (
              <TouchableOpacity
                key={section.type}
                style={[
                  styles.tab,
                  { 
                    backgroundColor: activeSection === section.type 
                      ? section.color
                      : Colors[theme].card,
                    borderColor: section.color,
                    borderWidth: activeSection === section.type ? 0 : 1,
                  }
                ]}
                onPress={() => setActiveSection(section.type)}
              >
                <Text style={styles.tabEmoji}>{section.emoji}</Text>
                <Text
                  style={[
                    styles.tabText,
                    { 
                      color: activeSection === section.type 
                        ? '#fff' 
                        : section.color
                    }
                  ]}
                >
                  {section.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section Description */}
          <View style={styles.sectionDescription}>
            <Text style={[styles.descriptionText, { color: activeColor }]}>
              {SECTIONS.find(s => s.type === activeSection)?.description}
            </Text>
          </View>

          {/* Content Section */}
          <View style={styles.content}>
            {diseaseDetails.sections[activeSection].map((section: DiseaseSection, index: number) => (
              <View 
                key={index}
                style={[
                  styles.sectionCard, 
                  { 
                    backgroundColor: Colors[theme].card,
                    borderLeftColor: activeColor,
                    borderLeftWidth: 4,
                  }
                ]}
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: Colors[theme].text }]}>
                    {section.title}
                  </Text>
                  {section.children && (
                    <View style={[styles.ageBadge, { backgroundColor: '#4CAF50' }]}>
                      <Text style={styles.ageBadgeText}>👶 Enfant</Text>
                    </View>
                  )}
                  {section.adults && (
                    <View style={[styles.ageBadge, { backgroundColor: '#2196F3' }]}>
                      <Text style={styles.ageBadgeText}>🧑 Adulte</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.sectionContent, { color: Colors[theme].textSecondary }]}>
                  {section.content}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SharedTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  diseaseImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    minWidth: width * 0.4,
  },
  tabEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionDescription: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  content: {
    padding: 16,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  ageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  ageBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  definitionCard: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  definitionHeader: {
    marginBottom: 12,
  },
  definitionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  definitionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  definitionTips: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
  },
  tipsText: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 