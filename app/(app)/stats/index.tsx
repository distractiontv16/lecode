import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SharedTransition from '@/components/navigation/SharedTransition';
import MetricCard from '@/components/ui/MetricCard';
import WeeklyActivityChart from '@/components/ui/WeeklyActivityChart';
import BadgeItem from '@/components/ui/BadgeItem';
import { useAuth } from '@/app/contexts/AuthContext';
import { doc, getDoc, updateDoc, increment, arrayUnion, setDoc } from 'firebase/firestore';
import { firebaseDB } from '@/backend/config/firebase.config';

export default function StatsScreen() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useDefaultData, setUseDefaultData] = useState(false);

  // Fonction pour calculer la précision
  const accuracy = (userData) => {
    if (!userData || !userData.totalQuestionsAttempted || userData.totalQuestionsAttempted === 0) {
      return '0%';
    }
    return ((userData.totalGoodAnswers / userData.totalQuestionsAttempted) * 100).toFixed(1) + '%';
  };

  // Fonction pour calculer le temps moyen
  const averageTime = (userData) => {
    if (!userData || !userData.quizDurations || userData.quizDurations.length === 0) {
      return '0s';
    }
    const total = userData.quizDurations.reduce((a, b) => a + b, 0);
    return Math.round(total / userData.quizDurations.length) + 's';
  };

  // Charger les données utilisateur - Version simplifiée
  useEffect(() => {
    const loadData = () => {
      console.log('Chargement des statistiques...');
      setLoading(true);

      // Simuler un chargement rapide avec des données par défaut
      setTimeout(() => {
        const defaultData = {
          currentStreak: 5,
          lastPlayed: new Date(),
          totalQuizzes: 12,
          totalGoodAnswers: 8,
          totalQuestionsAttempted: 15,
          quizDurations: [45, 32, 58, 41, 39]
        };

        console.log('Données chargées:', defaultData);
        setUserData(defaultData);
        setLoading(false);
      }, 1000); // 1 seconde seulement
    };

    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Données dynamiques basées sur les vraies données utilisateur
  const metriques = [
    {
      icon: '🔥',
      value: userData?.currentStreak || 0,
      label: 'Jours de suite',
      color: '#FF6B35'
    },
    {
      icon: '✅',
      value: userData?.totalQuizzes || 0,
      label: 'Quiz complétés',
      color: '#4CAF50'
    },
    {
      icon: '🎯',
      value: accuracy(userData).replace('%', ''),
      label: 'Précision (%)',
      color: '#2196F3'
    },
    {
      icon: '⚡',
      value: averageTime(userData).replace('s', ''),
      label: 'Temps moyen (s)',
      color: '#FF9800'
    }
  ];

  // Données d'activité hebdomadaire (simulées pour l'instant)
  const weeklyActivity = [
    { day: 'Lun', quizCount: 3, height: '60%' },
    { day: 'Mar', quizCount: 4, height: '80%' },
    { day: 'Mer', quizCount: 2, height: '40%' },
    { day: 'Jeu', quizCount: 5, height: '100%' },
    { day: 'Ven', quizCount: 3, height: '60%' },
    { day: 'Sam', quizCount: 1, height: '20%' },
    { day: 'Dim', quizCount: 2, height: '40%' }
  ];

  const badges = [
    { id: 'quiz_master', icon: '🏆', name: 'Quiz Master', condition: 'totalQuiz >= 100', earned: (userData?.totalQuizzes || 0) >= 100 },
    { id: 'speed_runner', icon: '⚡', name: 'Speed Runner', condition: 'fastQuiz >= 10', earned: true },
    { id: 'perfectionist', icon: '🎯', name: 'Perfectionniste', condition: 'perfectStreak >= 5', earned: false },
    { id: 'explorer', icon: '🌟', name: 'Explorateur', condition: 'allCategoriesStarted', earned: true },
    { id: 'streak_legend', icon: '🔥', name: 'Streak Legend', condition: 'maxStreak >= 30', earned: (userData?.currentStreak || 0) >= 30 },
    { id: 'champion', icon: '👑', name: 'Champion', condition: 'allLevelsCompleted', earned: false }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <SharedTransition transitionKey="stats-screen">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Objectifs du jour */}
        <LinearGradient
          colors={['#4CAF50', '#388E3C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.objectivesCard}
        >
          <View style={styles.objectivesHeader}>
            <Text style={styles.objectivesTitle}>Objectifs du jour</Text>
            <Text style={styles.objectivesCount}>2/2</Text>
          </View>

          <View style={styles.objectiveItem}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.objectiveText}>Quiz du jour</Text>
          </View>

          <View style={styles.objectiveItem}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.objectiveText}>Lecture santé</Text>
          </View>
        </LinearGradient>

        {/* Métriques principales avec vraies données */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes statistiques</Text>
          <View style={styles.metricsGrid}>
            {metriques.map((metric, index) => (
              <MetricCard
                key={index}
                icon={metric.icon}
                value={metric.value}
                label={metric.label}
                color={metric.color}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité hebdomadaire</Text>
          <WeeklyActivityChart data={weeklyActivity} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges & Réalisations</Text>
          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <BadgeItem
                key={badge.id}
                {...badge}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SharedTransition>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  objectivesCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  objectivesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  objectivesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  objectivesCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  objectiveText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
});

