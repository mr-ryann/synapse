import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS } from '../../theme';

interface ActivityGraphProps {
  data: Array<{ date: string; count: number }>;
  weeks?: number;
}

const ActivityGraph: React.FC<ActivityGraphProps> = ({ data, weeks = 15 }) => {
  const { grid, maxCount, monthLabels } = useMemo(() => {
    const today = new Date();
    const totalDays = weeks * 7;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    // Create a map of date -> count
    const dateCountMap: Record<string, number> = {};
    data.forEach(item => {
      dateCountMap[item.date] = item.count;
    });

    // Find max count for intensity scaling
    let max = 0;
    data.forEach(item => {
      if (item.count > max) max = item.count;
    });

    // Generate grid (7 rows x weeks columns)
    const gridData: Array<Array<{ date: string; count: number }>> = [];
    
    // Initialize 7 rows (days of week)
    for (let i = 0; i < 7; i++) {
      gridData.push([]);
    }

    // Track months for labels - use a Set to avoid duplicates
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsMap = new Map<number, { label: string; colIndex: number }>();

    // Fill the grid
    const currentDate = new Date(startDate);
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayOfWeek = currentDate.getDay();
        const count = dateCountMap[dateStr] || 0;
        
        // Track month at the start of each week (d === 0) or first occurrence of the month
        const month = currentDate.getMonth();
        if (!monthsMap.has(month)) {
          // Record the first week where this month appears
          monthsMap.set(month, { label: monthNames[month], colIndex: w });
        }
        
        gridData[dayOfWeek].push({ date: dateStr, count });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Convert map to sorted array by column index
    const months = Array.from(monthsMap.values()).sort((a, b) => a.colIndex - b.colIndex);

    return { grid: gridData, maxCount: max || 1, monthLabels: months };
  }, [data, weeks]);

  const getIntensityColor = (count: number) => {
    if (count === 0) return COLORS.background.elevated;
    const intensity = Math.min(count / maxCount, 1);
    if (intensity <= 0.25) return COLORS.accent.secondary + '40';
    if (intensity <= 0.5) return COLORS.accent.secondary + '70';
    if (intensity <= 0.75) return COLORS.accent.secondary + 'A0';
    return COLORS.accent.secondary;
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {/* Month labels */}
      <View style={styles.monthLabelsContainer}>
        <View style={styles.dayLabelSpacer} />
        <View style={styles.monthLabels}>
          {monthLabels.map((month, index) => (
            <Text
              key={index}
              style={[
                styles.monthLabel,
                { left: month.colIndex * 15 },
              ]}
            >
              {month.label}
            </Text>
          ))}
        </View>
      </View>
      
      <View style={styles.graphContainer}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {dayLabels.map((label, index) => (
            <Text key={index} style={styles.dayLabel}>
              {index % 2 === 0 ? label : ''}
            </Text>
          ))}
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => (
                <View
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.cell,
                    { backgroundColor: getIntensityColor(cell.count) },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        <View style={[styles.legendCell, { backgroundColor: COLORS.background.elevated }]} />
        <View style={[styles.legendCell, { backgroundColor: COLORS.accent.secondary + '40' }]} />
        <View style={[styles.legendCell, { backgroundColor: COLORS.accent.secondary + '70' }]} />
        <View style={[styles.legendCell, { backgroundColor: COLORS.accent.secondary + 'A0' }]} />
        <View style={[styles.legendCell, { backgroundColor: COLORS.accent.secondary }]} />
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
};

export default ActivityGraph;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  monthLabelsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayLabelSpacer: {
    width: 32,
  },
  monthLabels: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
    height: 16,
  },
  monthLabel: {
    position: 'absolute',
    fontSize: 10,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
  },
  graphContainer: {
    flexDirection: 'row',
  },
  dayLabels: {
    marginRight: 8,
    justifyContent: 'space-around',
    width: 24,
  },
  dayLabel: {
    fontSize: 9,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
    height: 12,
    lineHeight: 12,
  },
  grid: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  cell: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  legendText: {
    fontSize: 10,
    fontFamily: FONTS.body,
    color: COLORS.text.muted,
    marginHorizontal: 4,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
