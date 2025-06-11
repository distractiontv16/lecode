import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ActivityDay {
  day: string;
  quizCount: number;
  height: number;
}

interface WeeklyActivityChartProps {
  data?: ActivityDay[];
}

export default function WeeklyActivityChart({ data = [] }: WeeklyActivityChartProps) {
  console.log('WeeklyActivityChart received data:', data);
  const barAnimations = useRef<Animated.Value[]>([]);

  // Initialiser les animations si nécessaire
  useEffect(() => {
    if (barAnimations.current.length !== data.length) {
      barAnimations.current = data.map(() => new Animated.Value(0));
    }

    if (data.length === 0) return;

    const animations = barAnimations.current.map((anim, index) =>
      Animated.timing(anim, {
        toValue: data[index].height / 150, // Normaliser la hauteur par rapport à la hauteur max du barWrapper
        duration: 1000,
        delay: index * 100,
        useNativeDriver: true,
      })
    );
    console.log('Starting animations for bars, data:', data);
    Animated.parallel(animations).start();
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Aucune donnée disponible</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {data.map((day, index) => (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barWrapper}>
              <View style={[styles.barBackground]}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      transform: [{
                        scaleY: barAnimations.current[index] || new Animated.Value(0)
                      }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    style={styles.gradientFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                </Animated.View>
              </View>
            </View>
            <Text style={styles.dayLabel}>{day.day}</Text>
            <Text style={styles.quizCount}>{day.quizCount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    height: 200,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: 20,
    height: 150,
    justifyContent: 'flex-end',
  },
  barBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    bottom: 0,
    borderRadius: 10,
  },
  gradientFill: {
    width: '100%',
    height: '100%',
  },
  dayLabel: {
    marginTop: 8,
    fontSize: 10,
    color: '#666',
  },
  quizCount: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
}); 