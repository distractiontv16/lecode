import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import MetricCard from '../../components/ui/MetricCard';
import WeeklyActivityChart from '../../components/ui/WeeklyActivityChart';
import { streakService } from '../services/streakService';
import { useAuth } from '../contexts/AuthContext';

interface WeeklyActivityData {
  day: string;
  quizCount: number;
  height: number;
}

export default function StatsScreen() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [averageTime, setAverageTime] = useState(0);

  // Données dynamiques pour le graphique d'activité hebdomadaire
  const [weeklyData, setWeeklyData] = useState<WeeklyActivityData[]>([]);

  useEffect(() => {
    const generateWeeklyData = () => {
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const newWeeklyData: WeeklyActivityData[] = days.map(day => {
        const quizCount = Math.floor(Math.random() * 10) + 1; // 1 à 10 quiz par jour
        return { day, quizCount, height: quizCount * 15 }; // Hauteur basée sur quizCount, max 150
      });
      setWeeklyData(newWeeklyData);
    };

    generateWeeklyData(); // Générer les données au chargement du composant

    const loadStreak = async () => {
      if (user?.uid) {
        try {
          // const streakData = await streakService.getStreak(user.uid);
          // setStreak(streakData.currentStreak);
          const fakeStreak = Math.floor(Math.random() * 30) + 1; // Valeur aléatoire entre 1 et 30
          setStreak(fakeStreak);
        } catch (error) {
          console.error('Erreur lors du chargement du streak (simulation):', error);
          setStreak(0); // Mettre une valeur par défaut en cas d'erreur
        }
      }
    };

    // Simulation du chargement des quiz complétés
    const loadCompletedQuizzes = async () => {
      if (user?.uid && user.metadata) {
        try {
          // À remplacer par un appel réel au service plus tard
          // const stats = await statsService.getGeneralStats(user.uid);
          // setCompletedQuizzes(stats.totalQuizCompleted || 0);

          console.log("Simulation: Chargement des quiz complétés pour l'utilisateur:", user.uid);
          // Simule un délai réseau
          await new Promise(resolve => setTimeout(resolve, 500));

          // const creationTime = new Date(user.metadata.creationTime || 0).getTime();
          // const lastSignInTime = new Date(user.metadata.lastSignInTime || 0).getTime();

          // Si la différence est de moins de 10 secondes, on considère que c'est un nouvel utilisateur pour cette session
          // if (Math.abs(lastSignInTime - creationTime) < 10000) { 
          //   console.log("Simulation: Nouvel utilisateur détecté, initialisation des quiz complétés à 0.");
          //   setCompletedQuizzes(0);
          // } else {
            const fakeCompletedQuizzes = Math.floor(Math.random() * 50) + 10; // Valeur aléatoire entre 10 et 59
            setCompletedQuizzes(fakeCompletedQuizzes);
          // }

        } catch (error) {
          console.error('Erreur lors du chargement des quiz complétés (simulation):', error);
          setCompletedQuizzes(0); // Mettre une valeur par défaut en cas d'erreur
        }
      }
    };

    // Simulation du chargement de la précision
    const loadAccuracy = async () => {
      if (user?.uid && user.metadata) {
        try {
          // À remplacer par un appel réel au service plus tard
          // const stats = await statsService.getGeneralStats(user.uid);
          // setAccuracy(stats.averageScore || 0);

          console.log("Simulation: Chargement de la précision pour l'utilisateur:", user.uid);
          await new Promise(resolve => setTimeout(resolve, 550)); // Léger décalage pour voir l'effet

          // const creationTime = new Date(user.metadata.creationTime || 0).getTime();
          // const lastSignInTime = new Date(user.metadata.lastSignInTime || 0).getTime();

          // if (Math.abs(lastSignInTime - creationTime) < 10000) {
          //   console.log("Simulation: Nouvel utilisateur détecté, initialisation de la précision à 0.");
          //   setAccuracy(0);
          // } else {
            const fakeAccuracy = Math.floor(Math.random() * 31) + 70; // Valeur aléatoire entre 70 et 100
            setAccuracy(fakeAccuracy);
          // }
        } catch (error) {
          console.error('Erreur lors du chargement de la précision (simulation):', error);
          setAccuracy(0);
        }
      }
    };

    // Simulation du chargement du temps moyen
    const loadAverageTime = async () => {
      if (user?.uid && user.metadata) {
        try {
          // À remplacer par un appel réel au service plus tard
          // const stats = await statsService.getGeneralStats(user.uid);
          // setAverageTime(stats.averageTimePerQuiz || 0);

          console.log("Simulation: Chargement du temps moyen pour l'utilisateur:", user.uid);
          await new Promise(resolve => setTimeout(resolve, 600)); // Léger décalage

          // const creationTime = new Date(user.metadata.creationTime || 0).getTime();
          // const lastSignInTime = new Date(user.metadata.lastSignInTime || 0).getTime();

          // if (Math.abs(lastSignInTime - creationTime) < 10000) {
          //   console.log("Simulation: Nouvel utilisateur détecté, initialisation du temps moyen à 0.");
          //   setAverageTime(0);
          // } else {
            // Valeur aléatoire entre 1.0 et 5.0 (avec une décimale)
            const fakeAverageTime = parseFloat((Math.random() * 4 + 1).toFixed(1)); 
            setAverageTime(fakeAverageTime);
          // }
        } catch (error) {
          console.error('Erreur lors du chargement du temps moyen (simulation):', error);
          setAverageTime(0);
        }
      }
    };

    loadStreak();
    loadCompletedQuizzes();
    loadAccuracy();
    loadAverageTime();
  }, [user]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Statistiques',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.metricGrid}>
          <MetricCard
            icon="🔥"
            value={streak}
            label="Jours de suite"
            color="#FF6B35"
          />
          <MetricCard
            icon="✅"
            value={completedQuizzes}
            label="Quiz complétés"
            color="#4CAF50"
          />
          <MetricCard
            icon="🎯"
            value={accuracy}
            label="Précision (%)"
            color="#2196F3"
          />
          <MetricCard
            icon="⚡"
            value={averageTime}
            label="Temps moyen (min)"
            color="#FF9800"
          />
        </View>

        <WeeklyActivityChart data={weeklyData} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 16,
  },
}); 