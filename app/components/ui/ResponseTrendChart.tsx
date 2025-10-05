/**
 * ResponseTrendChart
 * 
 * Line chart showing daily response activity over last 30 days
 * Uses react-native-chart-kit for smooth, animated line visualization
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { THEME } from '../../theme';
import { GradientBorderCard } from './GradientBorderCard';

const screenWidth = Dimensions.get('window').width;

interface ResponseTrendData {
  date: string;  // YYYY-MM-DD
  count: number;
}

interface ResponseTrendChartProps {
  data: ResponseTrendData[];
  currentStreak?: number;
}

export const ResponseTrendChart = React.memo<ResponseTrendChartProps>(({ 
  data,
  currentStreak = 0 
}) => {
  // Process data for chart
  const labels = data.map(item => {
    const date = new Date(item.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  // Show only every 5th label to avoid crowding
  const displayLabels = labels.map((label, index) => 
    index % 5 === 0 ? label : ''
  );

  const counts = data.map(item => item.count);
  const maxCount = Math.max(...counts, 5); // Minimum scale of 5

  // Calculate insights
  const totalResponses = counts.reduce((sum, count) => sum + count, 0);
  const avgPerDay = (totalResponses / data.length).toFixed(1);
  const mostActiveDay = data.reduce((max, item) => 
    item.count > max.count ? item : max
  , { count: 0, date: '' });

  const chartConfig = {
    backgroundGradientFrom: THEME.dark.bg,
    backgroundGradientTo: THEME.dark.bg,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`, // Primary color
    strokeWidth: 3,
    decimalPlaces: 0,
    labelColor: () => THEME.neutral[500],
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: THEME.neutral[800],
      strokeWidth: 1,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: THEME.primary[500],
      fill: THEME.dark.bg,
    },
    fillShadowGradient: THEME.primary[500],
    fillShadowGradientOpacity: 0.2,
  };

  return (
    <GradientBorderCard borderWidth={2} borderRadius={20}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📈 Response Activity</Text>
          <Text style={styles.subtitle}>Last 30 days</Text>
        </View>

        {totalResponses > 0 ? (
          <>
            <LineChart
              data={{
                labels: displayLabels,
                datasets: [{
                  data: counts.length > 0 ? counts : [0],
                }],
              }}
              width={screenWidth - 72} // Account for padding
              height={200}
              chartConfig={chartConfig}
              bezier // Smooth curves
              style={styles.chart}
              withInnerLines
              withOuterLines
              withVerticalLabels
              withHorizontalLabels
              fromZero
            />

            <View style={styles.insights}>
              {currentStreak > 0 && (
                <View style={styles.insightItem}>
                  <Text style={styles.insightLabel}>🔥 Current Streak</Text>
                  <Text style={styles.insightValue}>{currentStreak} days</Text>
                </View>
              )}
              
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>📊 Avg per Day</Text>
                <Text style={styles.insightValue}>{avgPerDay}</Text>
              </View>

              {mostActiveDay.count > 0 && (
                <View style={styles.insightItem}>
                  <Text style={styles.insightLabel}>⭐ Most Active</Text>
                  <Text style={styles.insightValue}>
                    {new Date(mostActiveDay.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Start answering questions to see your activity trend!</Text>
          </View>
        )}
      </View>
    </GradientBorderCard>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.neutral.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.neutral[400],
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.neutral[800],
  },
  insightItem: {
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 12,
    color: THEME.neutral[500],
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.primary[500],
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: THEME.neutral[400],
    textAlign: 'center',
  },
});
