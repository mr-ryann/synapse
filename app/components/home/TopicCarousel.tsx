import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MiniTopicCard } from '../cards/MiniTopicCard';
import { COLORS, FONTS } from '../../theme';

interface TopicCarouselProps {
  topics: Array<{
    name: string;
    count: number;
  }>;
  onTopicSelect: (topicName: string) => void;
}

export const TopicCarousel = React.memo<TopicCarouselProps>(({ topics, onTopicSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Explore Topics</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.carouselContainer}
      >
        {topics.map((topic) => (
          <MiniTopicCard 
            key={topic.name} 
            topic={topic} 
            onPress={() => onTopicSelect(topic.name)} 
          />
        ))}
      </ScrollView>
    </View>
  );
});

TopicCarousel.displayName = 'TopicCarousel';

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  carouselContainer: {
    paddingRight: 16,
  },
});
