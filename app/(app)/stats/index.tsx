// ANCIEN ÉCRAN DE STATISTIQUES - REMPLACÉ PAR L'ÉCRAN AVANCÉ
// Ce fichier est conservé pour référence mais n'est plus utilisé
// L'écran avancé se trouve dans app/stats/index.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function OldStatsScreen() {
  const router = useRouter();

  React.useEffect(() => {
    // Rediriger automatiquement vers l'écran avancé
    router.replace('/stats');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Redirection vers l'écran de statistiques avancé...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});