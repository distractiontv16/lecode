// ANCIEN ÉCRAN DE STATISTIQUES - REMPLACÉ PAR L'ÉCRAN AVANCÉ
// Ce fichier est conservé pour référence mais n'est plus utilisé
// L'écran avancé se trouve dans app/stats/index.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

export default function OldStatsScreen() {
  // Redirection simple sans boucle
  return <Redirect href="/stats" />;
}

