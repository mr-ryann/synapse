import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, LayoutChangeEvent } from 'react-native';
import { TrendingUp, TrendingDown, Minus, Flame, BarChart2, X, Check } from 'lucide-react-native';
import Svg, { Path, Line, Text as SvgText, Defs, LinearGradient, Stop, G } from 'react-native-svg';
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

const GRAPH_HEIGHT = 100;
const GRAPH_PADDING = { top: 16, right: 12, bottom: 24, left: 32 };
const XP_PER_LEVEL = 100; // XP needed per level

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
  const [showMetricMenu, setShowMetricMenu] = useState(false);
  const [containerWidth, setContainerWidth] = useState(280);

  // Calculate XP for current level (reset each level)
  const xpNeededForLevel = level * XP_PER_LEVEL;
  const currentLevelXp = xp % XP_PER_LEVEL || (xp > 0 && xp % XP_PER_LEVEL === 0 ? XP_PER_LEVEL : 0);

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (timeRange === '7d') return data.slice(-7);
    if (timeRange === '30d') return data.slice(-30);
    return data;
  }, [data, timeRange]);

  // Calculate graph dimensions
  const graphWidth = containerWidth - GRAPH_PADDING.left - GRAPH_PADDING.right;
  const graphHeight = GRAPH_HEIGHT - GRAPH_PADDING.top - GRAPH_PADDING.bottom;

  // Get metric values
  const getMetricValue = (point: ActivityDataPoint): number => {
    switch (selectedMetric) {
      case 'challenges': return point.challenges;
      case 'xp': return point.xp;
      case 'thinkingTime': return Math.round(point.thinkingTime / 60);
    }
  };

  // Calculate max value for scaling
  const maxValue = useMemo(() => {
    const values = filteredData.map(getMetricValue);
    return Math.max(...values, 1);
  }, [filteredData, selectedMetric]);

  // Calculate data points
  const dataPoints = useMemo(() => {
    if (filteredData.length === 0) return [];
    return filteredData.map((point, index) => ({
      x: GRAPH_PADDING.left + (index / (filteredData.length - 1 || 1)) * graphWidth,
      y: GRAPH_PADDING.top + graphHeight - (getMetricValue(point) / maxValue) * graphHeight,
      value: getMetricValue(point),
      date: point.date,
    }));
  }, [filteredData, maxValue, graphWidth, graphHeight, selectedMetric]);

  // Generate smooth curve path
  const linePath = useMemo(() => {
    if (dataPoints.length === 0) return '';

    let path = `M ${dataPoints[0].x} ${dataPoints[0].y}`;
    for (let i = 1; i < dataPoints.length; i++) {
      const prev = dataPoints[i - 1];
      const curr = dataPoints[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
    }
    return path;
  }, [dataPoints]);

  // Generate area fill path
  const areaPath = useMemo(() => {
    if (!linePath || dataPoints.length === 0) return '';
    const startX = dataPoints[0].x;
    const endX = dataPoints[dataPoints.length - 1].x;
    const bottomY = GRAPH_PADDING.top + graphHeight;
    return `${linePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  }, [linePath, dataPoints, graphHeight]);

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={12} color={COLORS.accent.secondary} />;
    if (trend === 'down') return <TrendingDown size={12} color="#FF6B6B" />;
    return <Minus size={12} color={COLORS.text.muted} />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return COLORS.accent.secondary;
    if (trend === 'down') return '#FF6B6B';
    return COLORS.text.muted;
  };

  const getMetricLabel = (metric: MetricType): string => {
    switch (metric) {
      case 'challenges': return 'Challenges';
      case 'xp': return 'XP Earned';
      case 'thinkingTime': return 'Think Time';
    }
  };

  const metricOptions: { key: MetricType; label: string }[] = [
    { key: 'challenges', label: 'Challenges' },
    { key: 'xp', label: 'XP Earned' },
    { key: 'thinkingTime', label: 'Think Time' },
  ];

  return (
    <View style={styles.container}>
      {/* Header Stats Row */}
      <View style={styles.headerStats}>
        <View style={styles.mainStat}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LVL {level}</Text>
          </View>
          <View style={styles.xpInfo}>
            <Text style={styles.xpValue}>{currentLevelXp}</Text>
            <Text style={styles.xpDivider}>/</Text>
            <Text style={styles.xpNeeded}>{xpNeededForLevel}</Text>
          </View>
        </View>
        
        <View style={styles.statsDivider} />
        
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Flame size={14} color={COLORS.accent.primary} />
            <Text style={styles.quickStatValue}>{streak}</Text>
          </View>
          <View style={[styles.trendBadge, { backgroundColor: getTrendColor() + '20' }]}>
            {getTrendIcon()}
          </View>
          {/* Metric Selector Button */}
          <TouchableOpacity
            style={styles.metricButton}
            onPress={() => setShowMetricMenu(true)}
            activeOpacity={0.8}
          >
            <BarChart2 size={16} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* XP Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${xpProgress}%` }]} />
        </View>
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
              {range === '7d' ? '7D' : range === '30d' ? '30D' : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Current Metric Label */}
      <Text style={styles.currentMetricLabel}>
        Days vs {getMetricLabel(selectedMetric)}
      </Text>

      {/* Graph Container - Area Chart Only */}
      <View 
        style={styles.graphContainer}
        onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Svg width={containerWidth} height={GRAPH_HEIGHT}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={COLORS.accent.primary} stopOpacity="0.3" />
              <Stop offset="1" stopColor={COLORS.accent.primary} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio, i) => (
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
              x={GRAPH_PADDING.left - 6}
              y={GRAPH_PADDING.top + graphHeight * (1 - ratio) + 3}
              fontSize={9}
              fill={COLORS.text.muted}
              textAnchor="end"
            >
              {Math.round(maxValue * ratio)}
            </SvgText>
          ))}

          {/* Area Chart */}
          <G>
            {areaPath && (
              <Path
                d={areaPath}
                fill="url(#areaGradient)"
              />
            )}
            {linePath && (
              <Path
                d={linePath}
                stroke={COLORS.accent.primary}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
              />
            )}
          </G>
        </Svg>
      </View>

      {/* Metric Menu Modal */}
      <Modal
        visible={showMetricMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMetricMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowMetricMenu(false)}
        >
          <View style={styles.metricMenu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Graph Axis</Text>
              <TouchableOpacity onPress={() => setShowMetricMenu(false)}>
                <X size={20} color={COLORS.text.muted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.menuSubtitle}>Days vs</Text>
            {metricOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.metricOption,
                  selectedMetric === option.key && styles.metricOptionActive,
                ]}
                onPress={() => {
                  setSelectedMetric(option.key);
                  setShowMetricMenu(false);
                }}
              >
                <Text style={[
                  styles.metricOptionText,
                  selectedMetric === option.key && styles.metricOptionTextActive,
                ]}>
                  {option.label}
                </Text>
                {selectedMetric === option.key && (
                  <Check size={16} color={COLORS.accent.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelBadge: {
    backgroundColor: COLORS.accent.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  levelText: {
    fontFamily: FONTS.heading,
    fontSize: 12,
    color: COLORS.background.primary,
    letterSpacing: 1,
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  xpValue: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.text.primary,
  },
  xpDivider: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text.muted,
    marginHorizontal: 2,
  },
  xpNeeded: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text.muted,
  },
  statsDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border.default,
    marginHorizontal: 12,
  },
  quickStats: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickStatValue: {
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  trendBadge: {
    padding: 6,
    borderRadius: 12,
  },
  metricButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.background.elevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent.primary,
    borderRadius: 2,
  },
  timeRangeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
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
    fontSize: 11,
    color: COLORS.text.muted,
  },
  timeRangeTextActive: {
    color: COLORS.accent.primary,
    fontWeight: '600',
  },
  currentMetricLabel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.muted,
    marginBottom: 8,
  },
  graphContainer: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  metricMenu: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 280,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuTitle: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  menuSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.muted,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  metricOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  metricOptionActive: {
    backgroundColor: COLORS.accent.primary + '15',
  },
  metricOptionText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  metricOptionTextActive: {
    color: COLORS.accent.primary,
    fontWeight: '500',
  },
});

export default AnalyticsGraph;
