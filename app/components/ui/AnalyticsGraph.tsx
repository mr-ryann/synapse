import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { TrendingUp, TrendingDown, Minus, Flame, Zap, Brain, Clock } from 'lucide-react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, FONTS } from '../../theme';

interface ActivityDataPoint {
  date: string;
  challenges: number;
  xp: number;
  thinkingTime: number;
}

type MetricType = 'challenges' | 'xp' | 'thinkingTime';
type TimeRange = '7d' | '30d' | 'all';

interface AnalyticsGraphProps {
  data: ActivityDataPoint[];
  xp: number;
  level: number;
  streak: number;
  trend: 'up' | 'down' | 'stable';
  xpProgress: number;
  totalChallenges: number;
  averageThinkingTime: number;
  onTimeRangeChange?: (range: TimeRange) => void;
  timeRange?: TimeRange;
}

const GRAPH_HEIGHT = 120;
const GRAPH_PADDING = { top: 20, right: 16, bottom: 30, left: 40 };

export const AnalyticsGraph: React.FC<AnalyticsGraphProps> = ({
  data,
  xp,
  level,
  streak,
  trend,
  xpProgress,
  totalChallenges,
  averageThinkingTime,
  onTimeRangeChange,
  timeRange = '30d',
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('challenges');
  const screenWidth = Dimensions.get('window').width - 40; // Account for padding

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (timeRange === '7d') return data.slice(-7);
    if (timeRange === '30d') return data.slice(-30);
    return data;
  }, [data, timeRange]);

  // Calculate graph dimensions
  const graphWidth = screenWidth - GRAPH_PADDING.left - GRAPH_PADDING.right;
  const graphHeight = GRAPH_HEIGHT - GRAPH_PADDING.top - GRAPH_PADDING.bottom;

  // Get metric values
  const getMetricValue = (point: ActivityDataPoint): number => {
    switch (selectedMetric) {
      case 'challenges': return point.challenges;
      case 'xp': return point.xp;
      case 'thinkingTime': return Math.round(point.thinkingTime / 60); // Convert to minutes
    }
  };

  // Calculate max value for scaling
  const maxValue = useMemo(() => {
    const values = filteredData.map(getMetricValue);
    return Math.max(...values, 1);
  }, [filteredData, selectedMetric]);

  // Generate SVG path for line chart
  const linePath = useMemo(() => {
    if (filteredData.length === 0) return '';

    const points = filteredData.map((point, index) => {
      const x = GRAPH_PADDING.left + (index / (filteredData.length - 1 || 1)) * graphWidth;
      const y = GRAPH_PADDING.top + graphHeight - (getMetricValue(point) / maxValue) * graphHeight;
      return { x, y };
    });

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    // Create smooth curve using cubic bezier
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
    }

    return path;
  }, [filteredData, maxValue, graphWidth, graphHeight, selectedMetric]);

  // Generate area fill path
  const areaPath = useMemo(() => {
    if (!linePath || filteredData.length === 0) return '';
    
    const startX = GRAPH_PADDING.left;
    const endX = GRAPH_PADDING.left + graphWidth;
    const bottomY = GRAPH_PADDING.top + graphHeight;
    
    return `${linePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  }, [linePath, filteredData.length, graphWidth, graphHeight]);

  // Data points for dots
  const dataPoints = useMemo(() => {
    return filteredData.map((point, index) => ({
      x: GRAPH_PADDING.left + (index / (filteredData.length - 1 || 1)) * graphWidth,
      y: GRAPH_PADDING.top + graphHeight - (getMetricValue(point) / maxValue) * graphHeight,
      value: getMetricValue(point),
      date: point.date,
    }));
  }, [filteredData, maxValue, graphWidth, graphHeight, selectedMetric]);

  // Format metric labels
  const getMetricLabel = (metric: MetricType): string => {
    switch (metric) {
      case 'challenges': return 'Challenges';
      case 'xp': return 'XP Earned';
      case 'thinkingTime': return 'Think Time';
    }
  };

  const getMetricUnit = (metric: MetricType): string => {
    switch (metric) {
      case 'challenges': return '';
      case 'xp': return 'xp';
      case 'thinkingTime': return 'min';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={14} color={COLORS.accent.secondary} />;
    if (trend === 'down') return <TrendingDown size={14} color="#FF6B6B" />;
    return <Minus size={14} color={COLORS.text.muted} />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return COLORS.accent.secondary;
    if (trend === 'down') return '#FF6B6B';
    return COLORS.text.muted;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  return (
    <View style={styles.container}>
      {/* Header Stats Row */}
      <View style={styles.headerStats}>
        <View style={styles.mainStat}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LVL {level}</Text>
          </View>
          <View style={styles.xpInfo}>
            <Text style={styles.xpValue}>{xp.toLocaleString()}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
        </View>
        
        <View style={styles.statsDivider} />
        
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Flame size={16} color={COLORS.accent.primary} />
            <Text style={styles.quickStatValue}>{streak}</Text>
          </View>
          <View style={styles.quickStat}>
            <Brain size={16} color={COLORS.accent.secondary} />
            <Text style={styles.quickStatValue}>{totalChallenges}</Text>
          </View>
          <View style={styles.quickStat}>
            <Clock size={16} color={COLORS.text.muted} />
            <Text style={styles.quickStatValue}>{formatTime(averageThinkingTime)}</Text>
          </View>
        </View>
      </View>

      {/* XP Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${xpProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(xpProgress)}% to Level {level + 1}</Text>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeRow}>
        {(['7d', '30d', 'all'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.timeRangeButton, timeRange === range && styles.timeRangeButtonActive]}
            onPress={() => onTimeRangeChange?.(range)}
          >
            <Text style={[styles.timeRangeText, timeRange === range && styles.timeRangeTextActive]}>
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Metric Selector */}
      <View style={styles.metricRow}>
        {(['challenges', 'xp', 'thinkingTime'] as MetricType[]).map((metric) => (
          <TouchableOpacity
            key={metric}
            style={[styles.metricButton, selectedMetric === metric && styles.metricButtonActive]}
            onPress={() => setSelectedMetric(metric)}
          >
            <Text style={[styles.metricText, selectedMetric === metric && styles.metricTextActive]}>
              {getMetricLabel(metric)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Graph */}
      <View style={styles.graphContainer}>
        <Svg width={screenWidth} height={GRAPH_HEIGHT}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={COLORS.accent.primary} stopOpacity="0.3" />
              <Stop offset="1" stopColor={COLORS.accent.primary} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <Line
              key={i}
              x1={GRAPH_PADDING.left}
              y1={GRAPH_PADDING.top + graphHeight * (1 - ratio)}
              x2={GRAPH_PADDING.left + graphWidth}
              y2={GRAPH_PADDING.top + graphHeight * (1 - ratio)}
              stroke={COLORS.border.subtle}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}

          {/* Y-axis labels */}
          {[0, 0.5, 1].map((ratio, i) => (
            <SvgText
              key={i}
              x={GRAPH_PADDING.left - 8}
              y={GRAPH_PADDING.top + graphHeight * (1 - ratio) + 4}
              fontSize={10}
              fill={COLORS.text.muted}
              textAnchor="end"
            >
              {Math.round(maxValue * ratio)}
            </SvgText>
          ))}

          {/* Area fill */}
          {areaPath && (
            <Path
              d={areaPath}
              fill="url(#areaGradient)"
            />
          )}

          {/* Line */}
          {linePath && (
            <Path
              d={linePath}
              stroke={COLORS.accent.primary}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {dataPoints.filter((_, i) => i % Math.ceil(dataPoints.length / 10) === 0 || i === dataPoints.length - 1).map((point, i) => (
            <Circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={COLORS.accent.primary}
              stroke={COLORS.background.secondary}
              strokeWidth={2}
            />
          ))}
        </Svg>

        {/* Trend indicator */}
        <View style={[styles.trendBadge, { backgroundColor: getTrendColor() + '20' }]}>
          {getTrendIcon()}
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {trend === 'up' ? 'Trending Up' : trend === 'down' ? 'Trending Down' : 'Stable'}
          </Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {filteredData.reduce((sum, d) => sum + d.challenges, 0)}
          </Text>
          <Text style={styles.summaryLabel}>Challenges</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {filteredData.reduce((sum, d) => sum + d.xp, 0).toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>XP Earned</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {formatTime(filteredData.reduce((sum, d) => sum + d.thinkingTime, 0))}
          </Text>
          <Text style={styles.summaryLabel}>Think Time</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    backgroundColor: COLORS.accent.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    color: COLORS.background.primary,
    letterSpacing: 1,
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  xpValue: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.text.primary,
  },
  xpLabel: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text.muted,
  },
  statsDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border.default,
    marginHorizontal: 16,
  },
  quickStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickStatValue: {
    fontFamily: FONTS.body,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background.elevated,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent.primary,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.muted,
    textAlign: 'right',
  },
  timeRangeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background.elevated,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: COLORS.accent.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.accent.primary,
  },
  timeRangeText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.muted,
  },
  timeRangeTextActive: {
    color: COLORS.accent.primary,
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  metricButtonActive: {
    backgroundColor: COLORS.background.elevated,
  },
  metricText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.muted,
  },
  metricTextActive: {
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  graphContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  trendBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.text.primary,
  },
  summaryLabel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.muted,
    marginTop: 2,
  },
});

export default AnalyticsGraph;
