/**
 * ThinkingTimeBarChart
 * 
 * Bar chart showing average thinking time per topic
 * Color-coded based on thinking duration (fast=green, slow=red)
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { THEME } from '../../theme';
import { GradientBorderCard } from './GradientBorderCard';

const screenWidth = Dimensions.get('window').width;

interface ThinkingTimeData {
  topic: string;
  avgTime: number;  // in seconds
  count: number;
}

interface ThinkingTimeBarChartProps {
  data: ThinkingTimeData[];
}

export const ThinkingTimeBarChart = React.memo<ThinkingTimeBarChartProps>(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <GradientBorderCard borderWidth={2} borderRadius={20}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>⏱️  Thinking Time by Topic</Text>
            <Text style={styles.subtitle}>Average seconds per question</Text>
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Answer questions from multiple topics to see comparison
            </Text>
          </View>
        </View>
      </GradientBorderCard>
    );
  }

  // Take top 5 topics by avgTime (already sorted from backend)
  const topTopics = data.slice(0, 5);
  
  const labels = topTopics.map(item => {
    // Truncate long topic names
    return item.topic.length > 12 
      ? item.topic.substring(0, 12) + '...' 
      : item.topic;
  });
  
  const times = topTopics.map(item => item.avgTime);
  const maxTime = Math.max(...times, 60); // Minimum scale of 60s

  // Determine color based on time (fast, medium, slow)
  const getTimeColor = (time: number) => {
    if (time < 60) return THEME.success[500]; // Fast (<1 min)
    if (time < 120) return THEME.warning[500]; // Medium (1-2 min)
    return THEME.error[500]; // Slow (>2 min)
  };

  // Find fastest and slowest
  const fastestTopic = topTopics.reduce((min, item) => 
    item.avgTime < min.avgTime ? item : min
  );
  const slowestTopic = topTopics.reduce((max, item) => 
    item.avgTime > max.avgTime ? item : max
  );

  const chartConfig = {
    backgroundGradientFrom: THEME.dark.bg,
    backgroundGradientTo: THEME.dark.bg,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalPlaces: 0,
    labelColor: () => THEME.neutral[500],
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: THEME.neutral[800],
      strokeWidth: 1,
    },
  };

  return (
    <GradientBorderCard borderWidth={2} borderRadius={20}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>⏱️  Thinking Time by Topic</Text>
          <Text style={styles.subtitle}>Average seconds per question</Text>
        </View>

        <BarChart
          data={{
            labels: labels,
            datasets: [{
              data: times.length > 0 ? times : [0],
            }],
          }}
          width={screenWidth - 72}
          height={220}
          yAxisLabel=""
          yAxisSuffix="s"
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
          showValuesOnTopOfBars
        />

        <View style={styles.insights}>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>⚡ Fastest</Text>
            <Text style={[styles.insightValue, { color: THEME.success[500] }]}>
              {fastestTopic.topic}
            </Text>
            <Text style={styles.insightTime}>{fastestTopic.avgTime.toFixed(0)}s</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>🐌 Slowest</Text>
            <Text style={[styles.insightValue, { color: THEME.error[500] }]}>
              {slowestTopic.topic}
            </Text>
            <Text style={styles.insightTime}>{slowestTopic.avgTime.toFixed(0)}s</Text>
          </View>
        </View>

        {slowestTopic.avgTime > fastestTopic.avgTime * 1.5 && (
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>
              💡 {slowestTopic.topic} takes {(slowestTopic.avgTime / fastestTopic.avgTime).toFixed(1)}x longer than {fastestTopic.topic}
            </Text>
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
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.neutral[800],
  },
  insightItem: {
    alignItems: 'center',
    flex: 1,
  },
  insightLabel: {
    fontSize: 12,
    color: THEME.neutral[500],
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.neutral.white,
    textAlign: 'center',
    marginBottom: 2,
  },
  insightTime: {
    fontSize: 12,
    color: THEME.neutral[400],
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: THEME.neutral[800],
    marginHorizontal: 16,
  },
  tipContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: `${THEME.primary[500]}15`,
    borderRadius: 12,
  },
  tipText: {
    fontSize: 13,
    color: THEME.neutral[300],
    textAlign: 'center',
    lineHeight: 18,
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
