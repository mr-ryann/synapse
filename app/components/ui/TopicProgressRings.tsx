/**
 * TopicProgressRings
 * 
 * Multiple circular progress rings showing completion % per topic
 * Color-coded: <50% red, 50-80% yellow, >80% green
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import { THEME } from '../../theme';
import { GradientBorderCard } from './GradientBorderCard';

const screenWidth = Dimensions.get('window').width;

interface TopicProgressData {
  topic: string;
  answered: number;
  total: number;
  percentage: number; // 0.0 to 1.0
}

interface TopicProgressRingsProps {
  data: TopicProgressData[];
}

export const TopicProgressRings = React.memo<TopicProgressRingsProps>(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <GradientBorderCard borderWidth={2} borderRadius={20}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>⭕ Topic Progress</Text>
            <Text style={styles.subtitle}>Completion percentage per topic</Text>
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Select topics in onboarding to track progress
            </Text>
          </View>
        </View>
      </GradientBorderCard>
    );
  }

  // Take top 4 topics (chart works best with 2-4 rings)
  const topicsToShow = data.slice(0, 4);
  const percentages = topicsToShow.map(item => item.percentage);

  // Calculate overall progress
  const overallProgress = data.reduce((sum, item) => sum + item.percentage, 0) / data.length;
  const completedTopics = data.filter(item => item.percentage === 1).length;

  // Determine colors based on progress
  const getProgressColor = (percentage: number) => {
    if (percentage >= 0.8) return THEME.success[500]; // >80%
    if (percentage >= 0.5) return THEME.warning[500]; // 50-80%
    return THEME.error[500]; // <50%
  };

  const chartConfig = {
    backgroundGradientFrom: THEME.dark.bg,
    backgroundGradientTo: THEME.dark.bg,
    color: (opacity = 1, index = 0) => {
      const percentage = percentages[index] || 0;
      const baseColor = getProgressColor(percentage);
      // Convert hex to rgba
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    strokeWidth: 2,
    decimalPlaces: 0,
    labelColor: () => THEME.neutral[500],
  };

  return (
    <GradientBorderCard borderWidth={2} borderRadius={20}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>⭕ Topic Progress</Text>
          <Text style={styles.subtitle}>Completion percentage per topic</Text>
        </View>

        <ProgressChart
          data={{
            labels: topicsToShow.map(item => item.topic),
            data: percentages.length > 0 ? percentages : [0],
          }}
          width={screenWidth - 72}
          height={200}
          strokeWidth={12}
          radius={28}
          chartConfig={chartConfig}
          hideLegend={false}
          style={styles.chart}
        />

        <View style={styles.topicsList}>
          {topicsToShow.map((topic, index) => (
            <View key={topic.topic} style={styles.topicItem}>
              <View style={[
                styles.colorIndicator,
                { backgroundColor: getProgressColor(topic.percentage) }
              ]} />
              <View style={styles.topicInfo}>
                <Text style={styles.topicName}>{topic.topic}</Text>
                <Text style={styles.topicStats}>
                  {topic.answered}/{topic.total} questions ({Math.round(topic.percentage * 100)}%)
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.insights}>
          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>📊 Overall</Text>
            <Text style={styles.insightValue}>
              {Math.round(overallProgress * 100)}%
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.insightItem}>
            <Text style={styles.insightLabel}>✅ Completed</Text>
            <Text style={styles.insightValue}>
              {completedTopics}/{data.length}
            </Text>
          </View>

          {completedTopics < data.length && (
            <>
              <View style={styles.divider} />
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>🎯 Next Up</Text>
                <Text style={styles.insightValue}>
                  {data.find(t => t.percentage < 1)?.topic.substring(0, 10) || 'None'}
                </Text>
              </View>
            </>
          )}
        </View>

        {overallProgress >= 0.8 && (
          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>
              🎉 Amazing! You're {Math.round(overallProgress * 100)}% through your selected topics!
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
  topicsList: {
    marginTop: 16,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.neutral.white,
    marginBottom: 2,
  },
  topicStats: {
    fontSize: 12,
    color: THEME.neutral[500],
  },
  insights: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
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
    fontSize: 16,
    fontWeight: '700',
    color: THEME.primary[500],
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: THEME.neutral[800],
    marginHorizontal: 8,
  },
  tipContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: `${THEME.success[500]}15`,
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
