import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, RefreshControl, Alert } from 'react-native';
import { Stack } from 'expo-router';
import MetricCard from '../../components/ui/MetricCard';
import WeeklyActivityChart from '../../components/ui/WeeklyActivityChart';
import CategoryProgressChart from '../../components/ui/CategoryProgressChart';
import ScoreTrendChart from '../../components/ui/ScoreTrendChart';
import PerformanceStatsCard from '../../components/ui/PerformanceStatsCard';
import WeakPointsCard from '../../components/ui/WeakPointsCard';
import CategoryDetailCard from '../../components/ui/CategoryDetailCard';
import SessionHistoryCard from '../../components/ui/SessionHistoryCard';
import GoalsCard from '../../components/ui/GoalsCard';
import ComparisonCard from '../../components/ui/ComparisonCard';
import LeaderboardCard from '../../components/ui/LeaderboardCard';
import StatsTabs from '../../components/ui/StatsTabs';
import PeriodFilter from '../../components/ui/PeriodFilter';
import StatsLoadingSkeleton from '../../components/ui/StatsLoadingSkeleton';
import { statisticsService, PerformanceStats, CategoryStats } from '../services/statistics.service';
import { useAuth } from '../contexts/AuthContext';

interface WeeklyActivityData {
  day: string;
  quizCount: number;
  height: number;
}

export default function StatsScreen() {
  const { user } = useAuth();

  // États pour les nouvelles statistiques
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [weakPoints, setWeakPoints] = useState<any[]>([]);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [userGoals, setUserGoals] = useState<any[]>([]);
  const [comparisonStats, setComparisonStats] = useState<any>(null);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // États pour la navigation et les filtres
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Configuration des onglets
  const tabs = [
    { id: 'overview', title: 'Vue d\'ensemble', icon: 'view-dashboard' },
    { id: 'performance', title: 'Performance', icon: 'chart-line', badge: weakPoints.length },
    { id: 'categories', title: 'Catégories', icon: 'book-open-variant' },
    { id: 'social', title: 'Communauté', icon: 'account-group' },
  ];

  // Configuration des périodes
  const periods = [
    { id: 'week', label: 'Cette semaine', shortLabel: '7j', icon: 'calendar-week' },
    { id: 'month', label: 'Ce mois', shortLabel: '30j', icon: 'calendar-month' },
    { id: 'quarter', label: 'Ce trimestre', shortLabel: '3m', icon: 'calendar-range' },
    { id: 'year', label: 'Cette année', shortLabel: '1an', icon: 'calendar' },
  ];

  // États pour la compatibilité avec l'ancien code
  const [weeklyData, setWeeklyData] = useState<WeeklyActivityData[]>([]);

  // Fonction pour charger toutes les statistiques
  const loadStatistics = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Charger les statistiques de performance
      const perfStats = await statisticsService.getPerformanceStats();
      setPerformanceStats(perfStats);

      // Charger les statistiques par catégorie
      const catStats = await statisticsService.getCategoryStats();
      setCategoryStats(catStats);

      // Charger les points faibles
      const weakPointsData = await statisticsService.getWeakPoints();
      setWeakPoints(weakPointsData);

      // Charger l'historique des sessions
      const sessionHistoryData = await statisticsService.getSessionHistory(10);
      setSessionHistory(sessionHistoryData);

      // Charger les objectifs utilisateur
      const goalsData = await statisticsService.getUserGoals();
      setUserGoals(goalsData);

      // Charger les statistiques de comparaison
      const comparisonData = await statisticsService.getComparisonStats();
      setComparisonStats(comparisonData);

      // Charger le leaderboard
      const leaderboard = await statisticsService.getLeaderboard('week');
      setLeaderboardData(leaderboard);

      // Convertir les données d'activité pour le graphique existant
      const weeklyActivityData = perfStats.activityData.map((activity, index) => ({
        day: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][index] || 'Jour',
        quizCount: activity.quizCount,
        height: Math.min(activity.quizCount * 15, 150)
      }));
      setWeeklyData(weeklyActivityData);

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de rafraîchissement
  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  useEffect(() => {
    loadStatistics();

  }, [user]);

  // Fonction pour obtenir les couleurs des catégories
  const getCategoryColor = (index: number) => {
    const colors = [
      '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
      '#F44336', '#00BCD4', '#795548', '#607D8B',
      '#E91E63', '#3F51B5'
    ];
    return colors[index % colors.length];
  };

  // Fonctions de rendu pour chaque onglet
  const renderOverviewTab = () => (
    <>
      {/* Métriques principales */}
      <View style={styles.metricGrid}>
        <MetricCard
          icon="🔥"
          value={performanceStats?.currentStreak || 0}
          label="Jours de suite"
          color="#FF6B35"
        />
        <MetricCard
          icon="✅"
          value={performanceStats?.totalQuizzesCompleted || 0}
          label="Quiz complétés"
          color="#4CAF50"
        />
        <MetricCard
          icon="🎯"
          value={performanceStats?.averageScore || 0}
          label="Précision (%)"
          color="#2196F3"
        />
        <MetricCard
          icon="⚡"
          value={performanceStats?.averageTimePerQuiz || 0}
          label="Temps moyen (min)"
          color="#FF9800"
        />
      </View>

      {/* Graphique d'activité hebdomadaire */}
      <WeeklyActivityChart data={weeklyData} />

      {/* Objectifs utilisateur */}
      <GoalsCard
        goals={userGoals}
        onGoalPress={(goalId) => {
          Alert.alert('Objectif', `Détails de l'objectif ${goalId}`);
        }}
        onAddGoalPress={() => {
          Alert.alert('Nouveau', 'Créer un nouvel objectif');
        }}
      />
    </>
  );

  const renderPerformanceTab = () => (
    <>
      {/* Évolution des scores */}
      {performanceStats?.accuracyTrend && (
        <ScoreTrendChart
          data={performanceStats.accuracyTrend}
          title="Évolution de la précision"
          color="#2196F3"
        />
      )}

      {/* Statistiques de performance détaillées */}
      {performanceStats && (
        <PerformanceStatsCard
          title="Performance détaillée"
          stats={[
            {
              label: 'Temps total',
              value: `${Math.round(performanceStats.totalTimeSpent)}h`,
              icon: 'clock-outline',
              color: '#FF9800',
              subtitle: 'Temps d\'étude'
            },
            {
              label: 'Meilleur streak',
              value: performanceStats.bestStreak,
              icon: 'fire',
              color: '#FF6B35',
              trend: performanceStats.currentStreak - performanceStats.bestStreak + performanceStats.currentStreak
            },
            {
              label: 'Points XP',
              value: performanceStats.totalXP,
              icon: 'star',
              color: '#9C27B0',
              subtitle: 'Expérience totale'
            },
            {
              label: 'Cœurs',
              value: performanceStats.heartsCount,
              icon: 'heart',
              color: '#E91E63',
              subtitle: 'Vies restantes'
            }
          ]}
        />
      )}

      {/* Points faibles et recommandations */}
      <WeakPointsCard
        weakPoints={weakPoints}
        onCategoryPress={(categoryName) => {
          Alert.alert('Navigation', `Redirection vers ${categoryName}`);
        }}
      />

      {/* Historique des sessions */}
      <SessionHistoryCard
        sessions={sessionHistory}
        onSessionPress={(sessionId) => {
          Alert.alert('Session', `Détails de la session ${sessionId}`);
        }}
        onViewAllPress={() => {
          Alert.alert('Navigation', 'Voir tout l\'historique des sessions');
        }}
      />
    </>
  );

  const renderCategoriesTab = () => (
    <>
      {/* Progression par catégorie */}
      {categoryStats.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Progression par catégorie</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScrollView}
          >
            {categoryStats.slice(0, 6).map((category, index) => (
              <CategoryProgressChart
                key={category.categoryId}
                categoryName={category.categoryName}
                progress={category.progressPercentage}
                completedQuizzes={category.completedQuizzes}
                totalQuizzes={category.totalQuizzes}
                averageScore={category.averageScore}
                color={getCategoryColor(index)}
                size={120}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Détails par catégorie */}
      {categoryStats.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Détails par catégorie</Text>
          {categoryStats.slice(0, 4).map((category, index) => (
            <CategoryDetailCard
              key={category.categoryId}
              categoryName={category.categoryName}
              totalQuizzes={category.totalQuizzes}
              completedQuizzes={category.completedQuizzes}
              averageScore={category.averageScore}
              bestScore={category.bestScore}
              averageTime={category.averageTime}
              progressPercentage={category.progressPercentage}
              lastActivity={category.lastActivity}
              weakPoints={category.weakPoints}
              color={getCategoryColor(index)}
              onPress={() => {
                Alert.alert('Navigation', `Voir les détails de ${category.categoryName}`);
              }}
            />
          ))}
        </View>
      )}
    </>
  );

  const renderSocialTab = () => (
    <>
      {/* Comparaison communautaire */}
      {comparisonStats && (
        <ComparisonCard
          comparisonStats={comparisonStats}
          onViewLeaderboardPress={() => {
            Alert.alert('Navigation', 'Voir le classement complet');
          }}
        />
      )}

      {/* Leaderboard */}
      {leaderboardData && (
        <LeaderboardCard
          leaderboard={leaderboardData.topEntries}
          currentUserEntry={leaderboardData.currentUserEntry}
          onViewFullLeaderboard={() => {
            Alert.alert('Navigation', 'Voir le classement complet');
          }}
          title="Top 10 - Cette semaine"
        />
      )}
    </>
  );

  // Fonction pour rendre le contenu selon l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'performance':
        return renderPerformanceTab();
      case 'categories':
        return renderCategoriesTab();
      case 'social':
        return renderSocialTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading && !performanceStats) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Statistiques',
            headerStyle: { backgroundColor: '#fff' },
            headerShadowVisible: false,
          }}
        />
        <StatsLoadingSkeleton />
      </>
    );
  }



  return (
    <>
      <Stack.Screen
        options={{
          title: 'Statistiques',
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
        }}
      />

      {/* Navigation par onglets */}
      <StatsTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />

      {/* Filtre par période */}
      <PeriodFilter
        periods={periods}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      {/* Contenu principal */}
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTabContent()}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoryScrollView: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
});