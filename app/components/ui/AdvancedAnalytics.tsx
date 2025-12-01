import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText, Defs, LinearGradient, Stop, G, Polygon, Rect } from 'react-native-svg';
import { Flame, Target, Brain, Zap, Clock, TrendingUp } from 'lucide-react-native';
import { COLORS, FONTS } from '../../theme';

// Types for the response data
interface ResponseData {
  thinkingTime: number;
  xpEarned: number;
  topicName: string;
  thinkingTimes?: number[]; // Array of times per question
}

interface TopicStats {
  name: string;
  totalXp: number;
  count: number;
  avgXp: number;
}

interface AdvancedAnalyticsProps {
  responses: ResponseData[];
  level: number;
  xp: number;
  streak: number;
}

const CHART_HEIGHT = 180;
const RADAR_SIZE = 160;

// ==================== SCATTER PLOT: Deep Work Analysis ====================
const DeepWorkScatter: React.FC<{ data: ResponseData[]; width: number }> = ({ data, width }) => {
  const padding = { top: 30, right: 20, bottom: 40, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = CHART_HEIGHT - padding.top - padding.bottom;

  // Calculate bounds
  const maxTime = Math.max(...data.map(d => d.thinkingTime), 300); // min 5 minutes
  const maxXp = Math.max(...data.map(d => d.xpEarned), 50);
  const midTime = maxTime / 2;
  const midXp = maxXp / 2;

  // Map data to coordinates
  const points = data.map(d => ({
    x: padding.left + (d.thinkingTime / maxTime) * chartWidth,
    y: padding.top + chartHeight - (d.xpEarned / maxXp) * chartHeight,
    time: d.thinkingTime,
    xp: d.xpEarned,
  }));

  // Zone colors (with transparency)
  const zones = [
    { x: padding.left + chartWidth / 2, y: padding.top, w: chartWidth / 2, h: chartHeight / 2, color: COLORS.accent.secondary + '15', label: 'Deep Work' },
    { x: padding.left, y: padding.top + chartHeight / 2, w: chartWidth / 2, h: chartHeight / 2, color: '#FF6B6B15', label: 'Rushing' },
    { x: padding.left, y: padding.top, w: chartWidth / 2, h: chartHeight / 2, color: COLORS.accent.primary + '15', label: 'Flow State' },
    { x: padding.left + chartWidth / 2, y: padding.top + chartHeight / 2, w: chartWidth / 2, h: chartHeight / 2, color: '#FFA50015', label: 'Struggle' },
  ];

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Target size={18} color={COLORS.accent.primary} />
        <Text style={styles.chartTitle}>Deep Work Analysis</Text>
      </View>
      <Text style={styles.chartSubtitle}>Effort (Time) vs Performance (XP)</Text>
      
      <Svg width={width} height={CHART_HEIGHT}>
        {/* Zone backgrounds */}
        {zones.map((zone, i) => (
          <Rect
            key={i}
            x={zone.x}
            y={zone.y}
            width={zone.w}
            height={zone.h}
            fill={zone.color}
          />
        ))}

        {/* Grid lines */}
        <Line x1={padding.left} y1={padding.top + chartHeight / 2} x2={padding.left + chartWidth} y2={padding.top + chartHeight / 2} stroke={COLORS.border.subtle} strokeDasharray="4,4" />
        <Line x1={padding.left + chartWidth / 2} y1={padding.top} x2={padding.left + chartWidth / 2} y2={padding.top + chartHeight} stroke={COLORS.border.subtle} strokeDasharray="4,4" />

        {/* Axes */}
        <Line x1={padding.left} y1={padding.top + chartHeight} x2={padding.left + chartWidth} y2={padding.top + chartHeight} stroke={COLORS.text.muted} strokeWidth={1} />
        <Line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke={COLORS.text.muted} strokeWidth={1} />

        {/* Zone labels */}
        <SvgText x={padding.left + chartWidth * 0.75} y={padding.top + 20} fontSize={9} fill={COLORS.accent.secondary} textAnchor="middle" fontWeight="600">Deep Work</SvgText>
        <SvgText x={padding.left + chartWidth * 0.25} y={padding.top + chartHeight - 10} fontSize={9} fill="#FF6B6B" textAnchor="middle" fontWeight="600">Rushing</SvgText>
        <SvgText x={padding.left + chartWidth * 0.25} y={padding.top + 20} fontSize={9} fill={COLORS.accent.primary} textAnchor="middle" fontWeight="600">Flow</SvgText>
        <SvgText x={padding.left + chartWidth * 0.75} y={padding.top + chartHeight - 10} fontSize={9} fill="#FFA500" textAnchor="middle" fontWeight="600">Struggle</SvgText>

        {/* Axis labels */}
        <SvgText x={padding.left + chartWidth / 2} y={CHART_HEIGHT - 5} fontSize={10} fill={COLORS.text.muted} textAnchor="middle">Time (seconds)</SvgText>
        <SvgText x={12} y={padding.top + chartHeight / 2} fontSize={10} fill={COLORS.text.muted} textAnchor="middle" rotation="-90" originX={12} originY={padding.top + chartHeight / 2}>XP</SvgText>

        {/* Y-axis ticks */}
        <SvgText x={padding.left - 5} y={padding.top + 4} fontSize={8} fill={COLORS.text.muted} textAnchor="end">{maxXp}</SvgText>
        <SvgText x={padding.left - 5} y={padding.top + chartHeight / 2 + 3} fontSize={8} fill={COLORS.text.muted} textAnchor="end">{Math.round(maxXp / 2)}</SvgText>
        <SvgText x={padding.left - 5} y={padding.top + chartHeight + 3} fontSize={8} fill={COLORS.text.muted} textAnchor="end">0</SvgText>

        {/* X-axis ticks */}
        <SvgText x={padding.left} y={padding.top + chartHeight + 12} fontSize={8} fill={COLORS.text.muted} textAnchor="middle">0</SvgText>
        <SvgText x={padding.left + chartWidth / 2} y={padding.top + chartHeight + 12} fontSize={8} fill={COLORS.text.muted} textAnchor="middle">{Math.round(maxTime / 2)}s</SvgText>
        <SvgText x={padding.left + chartWidth} y={padding.top + chartHeight + 12} fontSize={8} fill={COLORS.text.muted} textAnchor="middle">{maxTime}s</SvgText>

        {/* Data points */}
        {points.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={6}
            fill={COLORS.accent.primary}
            opacity={0.8}
            stroke={COLORS.background.secondary}
            strokeWidth={2}
          />
        ))}
      </Svg>

      {/* Legend */}
      <View style={styles.scatterLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.accent.secondary + '40' }]} />
          <Text style={styles.legendText}>High effort, High reward</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.accent.primary + '40' }]} />
          <Text style={styles.legendText}>Quick wins</Text>
        </View>
      </View>
    </View>
  );
};

// ==================== RADAR CHART: Cognitive Web ====================
const CognitiveRadar: React.FC<{ data: ResponseData[]; width: number }> = ({ data, width }) => {
  const centerX = width / 2;
  const centerY = RADAR_SIZE / 2 + 20;
  const radius = RADAR_SIZE / 2 - 30;

  // Aggregate XP by topic
  const topicStats = useMemo(() => {
    const stats: Record<string, TopicStats> = {};
    
    data.forEach(d => {
      const topic = d.topicName || 'General';
      if (!stats[topic]) {
        stats[topic] = { name: topic, totalXp: 0, count: 0, avgXp: 0 };
      }
      stats[topic].totalXp += d.xpEarned;
      stats[topic].count += 1;
    });

    // Calculate averages and get top topics
    Object.values(stats).forEach(s => {
      s.avgXp = s.count > 0 ? s.totalXp / s.count : 0;
    });

    // Get top 6 topics by total XP
    return Object.values(stats)
      .sort((a, b) => b.totalXp - a.totalXp)
      .slice(0, 6);
  }, [data]);

  if (topicStats.length < 3) {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Brain size={18} color={COLORS.accent.secondary} />
          <Text style={styles.chartTitle}>Cognitive Web</Text>
        </View>
        <Text style={styles.chartSubtitle}>Topic strengths & weaknesses</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Complete more challenges across different topics to see your cognitive profile</Text>
        </View>
      </View>
    );
  }

  const numPoints = topicStats.length;
  const angleStep = (2 * Math.PI) / numPoints;
  const maxXp = Math.max(...topicStats.map(t => t.totalXp), 1);

  // Calculate polygon points
  const polygonPoints = topicStats.map((topic, i) => {
    const angle = i * angleStep - Math.PI / 2; // Start from top
    const value = topic.totalXp / maxXp;
    const x = centerX + Math.cos(angle) * radius * value;
    const y = centerY + Math.sin(angle) * radius * value;
    return { x, y, topic };
  });

  const polygonPath = polygonPoints.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  // Grid circles
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Brain size={18} color={COLORS.accent.secondary} />
        <Text style={styles.chartTitle}>Cognitive Web</Text>
      </View>
      <Text style={styles.chartSubtitle}>Topic strengths & weaknesses</Text>
      
      <View style={{ position: 'relative', height: RADAR_SIZE + 60 }}>
        <Svg width={width} height={RADAR_SIZE + 40}>
        <Defs>
          <LinearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.accent.primary} stopOpacity="0.4" />
            <Stop offset="1" stopColor={COLORS.accent.secondary} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>

        {/* Grid circles */}
        {gridLevels.map((level, i) => (
          <Circle
            key={i}
            cx={centerX}
            cy={centerY}
            r={radius * level}
            fill="none"
            stroke={COLORS.border.subtle}
            strokeWidth={1}
            strokeDasharray={i < gridLevels.length - 1 ? "4,4" : "0"}
          />
        ))}

        {/* Axis lines */}
        {topicStats.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          return (
            <Line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke={COLORS.border.subtle}
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <Path
          d={polygonPath}
          fill="url(#radarGradient)"
          stroke={COLORS.accent.primary}
          strokeWidth={2}
        />

        {/* Data points */}
        {polygonPoints.map((point, i) => (
          <Circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={5}
            fill={COLORS.accent.primary}
            stroke={COLORS.background.secondary}
            strokeWidth={2}
          />
        ))}

        {/* Labels - rendered outside SVG for multi-line support */}
      </Svg>
      
      {/* Topic labels positioned outside SVG for multi-line text */}
      <View style={[styles.radarLabelsContainer, { width, height: RADAR_SIZE + 40 }]}>
        {topicStats.map((topic, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = radius + 35;
          const x = centerX + Math.cos(angle) * labelRadius;
          const y = centerY + Math.sin(angle) * labelRadius;
          return (
            <View
              key={i}
              style={[
                styles.radarLabel,
                {
                  position: 'absolute',
                  left: x - 40,
                  top: y - 8,
                  width: 80,
                }
              ]}
            >
              <Text style={styles.radarLabelText}>{topic.name}</Text>
            </View>
          );
        })}
      </View>
      </View>
    </View>
  );
};

// ==================== FATIGUE ANALYSIS: Per-Question Time ====================
const FatigueAnalysis: React.FC<{ data: ResponseData[]; width: number }> = ({ data, width }) => {
  const padding = { top: 30, right: 20, bottom: 40, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = CHART_HEIGHT - padding.top - padding.bottom;

  // Aggregate thinking times across all responses
  const aggregatedTimes = useMemo(() => {
    const questionTimes: number[][] = [];
    
    data.forEach(d => {
      if (d.thinkingTimes && d.thinkingTimes.length > 0) {
        d.thinkingTimes.forEach((time, i) => {
          if (!questionTimes[i]) questionTimes[i] = [];
          questionTimes[i].push(time);
        });
      }
    });

    // Calculate averages per question position
    return questionTimes.map((times, i) => ({
      question: i + 1,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
    }));
  }, [data]);

  if (aggregatedTimes.length < 2) {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Clock size={18} color={COLORS.accent.primary} />
          <Text style={styles.chartTitle}>Fatigue Analysis</Text>
        </View>
        <Text style={styles.chartSubtitle}>Time per question position</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Complete more multi-question challenges to analyze your cognitive fatigue patterns</Text>
        </View>
      </View>
    );
  }

  const maxTime = Math.max(...aggregatedTimes.map(t => t.maxTime), 60);
  const numQuestions = aggregatedTimes.length;

  // Create path for average line
  const avgPath = aggregatedTimes.map((t, i) => {
    const x = padding.left + (i / (numQuestions - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - (t.avgTime / maxTime) * chartHeight;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Create area path for min-max range
  const areaPath = useMemo(() => {
    const topPoints = aggregatedTimes.map((t, i) => {
      const x = padding.left + (i / (numQuestions - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - (t.maxTime / maxTime) * chartHeight;
      return { x, y };
    });
    const bottomPoints = aggregatedTimes.map((t, i) => {
      const x = padding.left + (i / (numQuestions - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - (t.minTime / maxTime) * chartHeight;
      return { x, y };
    }).reverse();

    const allPoints = [...topPoints, ...bottomPoints];
    return allPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  }, [aggregatedTimes, chartWidth, chartHeight, maxTime]);

  // Determine fatigue trend
  const firstHalf = aggregatedTimes.slice(0, Math.ceil(aggregatedTimes.length / 2));
  const secondHalf = aggregatedTimes.slice(Math.ceil(aggregatedTimes.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b.avgTime, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b.avgTime, 0) / secondHalf.length;
  const fatigueTrend = secondAvg > firstAvg * 1.1 ? 'slowing' : secondAvg < firstAvg * 0.9 ? 'rushing' : 'steady';

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Clock size={18} color={COLORS.accent.primary} />
        <Text style={styles.chartTitle}>Fatigue Analysis</Text>
      </View>
      <Text style={styles.chartSubtitle}>Time per question position</Text>
      
      <Svg width={width} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="fatigueGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.accent.secondary} stopOpacity="0.2" />
            <Stop offset="1" stopColor={COLORS.accent.secondary} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Axes */}
        <Line x1={padding.left} y1={padding.top + chartHeight} x2={padding.left + chartWidth} y2={padding.top + chartHeight} stroke={COLORS.text.muted} strokeWidth={1} />
        <Line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke={COLORS.text.muted} strokeWidth={1} />

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((ratio, i) => (
          <Line
            key={i}
            x1={padding.left}
            y1={padding.top + chartHeight * (1 - ratio)}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight * (1 - ratio)}
            stroke={COLORS.border.subtle}
            strokeDasharray="4,4"
          />
        ))}

        {/* Range area */}
        <Path d={areaPath} fill="url(#fatigueGradient)" />

        {/* Average line */}
        <Path
          d={avgPath}
          fill="none"
          stroke={COLORS.accent.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Data points */}
        {aggregatedTimes.map((t, i) => {
          const x = padding.left + (i / (numQuestions - 1 || 1)) * chartWidth;
          const y = padding.top + chartHeight - (t.avgTime / maxTime) * chartHeight;
          return (
            <Circle
              key={i}
              cx={x}
              cy={y}
              r={5}
              fill={COLORS.accent.primary}
              stroke={COLORS.background.secondary}
              strokeWidth={2}
            />
          );
        })}

        {/* Axis labels */}
        <SvgText x={padding.left + chartWidth / 2} y={CHART_HEIGHT - 5} fontSize={10} fill={COLORS.text.muted} textAnchor="middle">Question Number</SvgText>
        <SvgText x={12} y={padding.top + chartHeight / 2} fontSize={10} fill={COLORS.text.muted} textAnchor="middle" rotation="-90" originX={12} originY={padding.top + chartHeight / 2}>Time (s)</SvgText>

        {/* Y-axis ticks */}
        <SvgText x={padding.left - 5} y={padding.top + 4} fontSize={8} fill={COLORS.text.muted} textAnchor="end">{Math.round(maxTime)}s</SvgText>
        <SvgText x={padding.left - 5} y={padding.top + chartHeight + 3} fontSize={8} fill={COLORS.text.muted} textAnchor="end">0</SvgText>

        {/* X-axis ticks */}
        {aggregatedTimes.map((t, i) => {
          const x = padding.left + (i / (numQuestions - 1 || 1)) * chartWidth;
          return (
            <SvgText key={i} x={x} y={padding.top + chartHeight + 15} fontSize={9} fill={COLORS.text.muted} textAnchor="middle">Q{t.question}</SvgText>
          );
        })}
      </Svg>

      {/* Trend indicator */}
      <View style={styles.trendRow}>
        <Text style={styles.trendLabel}>Pattern:</Text>
        <View style={[styles.trendBadge, { 
          backgroundColor: fatigueTrend === 'slowing' ? '#FFA50020' : 
                          fatigueTrend === 'rushing' ? '#FF6B6B20' : 
                          COLORS.accent.secondary + '20' 
        }]}>
          <Text style={[styles.trendText, {
            color: fatigueTrend === 'slowing' ? '#FFA500' : 
                   fatigueTrend === 'rushing' ? '#FF6B6B' : 
                   COLORS.accent.secondary
          }]}>
            {fatigueTrend === 'slowing' ? '📉 Slowing Down' : 
             fatigueTrend === 'rushing' ? '⚡ Rushing at End' : 
             '✓ Steady Pace'}
          </Text>
        </View>
      </View>
    </View>
  );
};

// ==================== MAIN COMPONENT ====================
export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  responses,
  level,
  xp,
  streak,
}) => {
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width - 40);
  const scrollRef = useRef<ScrollView>(null);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  // Quick stats
  const totalXp = responses.reduce((sum, r) => sum + r.xpEarned, 0);
  const avgTime = responses.length > 0 
    ? Math.round(responses.reduce((sum, r) => sum + r.thinkingTime, 0) / responses.length)
    : 0;
  const deepWorkCount = responses.filter(r => r.thinkingTime > 120 && r.xpEarned > 20).length;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.headerStat}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>LVL {level}</Text>
          </View>
          <View style={styles.xpDisplay}>
            <Text style={styles.xpValue}>{xp}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
        </View>
        <View style={styles.headerDivider} />
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStat}>
            <Flame size={14} color={COLORS.accent.primary} />
            <Text style={styles.quickStatValue}>{streak}</Text>
          </View>
          <View style={styles.quickStat}>
            <Zap size={14} color={COLORS.accent.secondary} />
            <Text style={styles.quickStatValue}>{deepWorkCount}</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Charts */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.chartsScrollView}
        contentContainerStyle={styles.chartsContainer}
        snapToInterval={containerWidth}
        decelerationRate="fast"
      >
        <View style={[styles.chartPage, { width: containerWidth }]}>
          <DeepWorkScatter data={responses} width={containerWidth - 32} />
        </View>
        <View style={[styles.chartPage, { width: containerWidth }]}>
          <CognitiveRadar data={responses} width={containerWidth - 32} />
        </View>
        <View style={[styles.chartPage, { width: containerWidth }]}>
          <FatigueAnalysis data={responses} width={containerWidth - 32} />
        </View>
      </ScrollView>

      {/* Page Indicator */}
      <View style={styles.pageIndicator}>
        <View style={styles.pageDot} />
        <View style={[styles.pageDot, styles.pageDotInactive]} />
        <View style={[styles.pageDot, styles.pageDotInactive]} />
      </View>

      {/* Chart Labels */}
      <View style={styles.chartLabels}>
        <Text style={styles.chartLabelText}>Swipe to see more charts →</Text>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  headerStat: {
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
  xpDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  xpValue: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.text.primary,
  },
  xpLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.muted,
  },
  headerDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border.default,
    marginHorizontal: 12,
  },
  quickStatsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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
  chartsScrollView: {
    marginHorizontal: -16,
  },
  chartsContainer: {
    paddingHorizontal: 16,
  },
  chartPage: {
    paddingHorizontal: 0,
  },
  chartContainer: {
    marginBottom: 8,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  chartTitle: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  chartSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.muted,
    marginBottom: 12,
  },
  emptyState: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.text.muted,
    textAlign: 'center',
  },
  scatterLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.text.muted,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  trendLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.muted,
  },
  trendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    fontWeight: '600',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.primary,
  },
  pageDotInactive: {
    backgroundColor: COLORS.border.default,
  },
  chartLabels: {
    alignItems: 'center',
    marginTop: 8,
  },
  chartLabelText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.muted,
  },
  radarLabelsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  radarLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarLabelText: {
    fontFamily: FONTS.body,
    fontSize: 9,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default AdvancedAnalytics;
