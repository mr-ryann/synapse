import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../components/navigation/BackButton';
import { COLORS, FONTS } from '../theme';

interface ChallengeStep {
  id: string;
  type: 'ice-breaker' | 'article' | 'video' | 'mcq' | 'task' | 'thought-drop';
  content: string;
  options?: string[];
}

// Mock data for testing
const mockSteps: ChallengeStep[] = [
  {
    id: '1',
    type: 'ice-breaker',
    content: 'What is the meaning of life to you?',
  },
  {
    id: '2',
    type: 'article',
    content: 'Read this article about philosophical perspectives on life...',
  },
  {
    id: '3',
    type: 'mcq',
    content: 'Which philosopher said "I think, therefore I am"?',
    options: ['Socrates', 'Plato', 'Descartes', 'Aristotle'],
  },
  {
    id: '4',
    type: 'thought-drop',
    content: 'Write your thoughts on the meaning of life.',
  },
];

export default function ChallengePlayer() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentStep = mockSteps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < mockSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setSelectedOption(null);
    } else {
      // Challenge complete
      router.push('/challenge-list');
    }
  };

  const renderStep = () => {
    switch (currentStep.type) {
      case 'ice-breaker':
      case 'article':
      case 'thought-drop':
        return (
          <View style={styles.stepSection}>
            <Text style={styles.stepText}>{currentStep.content}</Text>
            {currentStep.type === 'thought-drop' && (
              <Text style={styles.placeholder}>Text input would go here</Text>
            )}
          </View>
        );
      case 'mcq':
        return (
          <View style={styles.stepSection}>
            <Text style={styles.stepText}>{currentStep.content}</Text>
            {currentStep.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  selectedOption === option && styles.optionSelected,
                ]}
                onPress={() => setSelectedOption(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return <Text>Unsupported step type</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.progress}>
          Step {currentStepIndex + 1} of {mockSteps.length}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.inner}>
          {renderStep()}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStepIndex < mockSteps.length - 1 ? 'Next' : 'Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    backgroundColor: COLORS.background.secondary,
  },
  progress: {
    fontSize: 14,
    fontFamily: FONTS.body,
    fontWeight: '600',
    color: COLORS.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  stepSection: {
    gap: 12,
  },
  stepText: {
    fontSize: 20,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    lineHeight: 26,
  },
  placeholder: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.background.elevated,
    marginBottom: 10,
  },
  optionSelected: {
    borderColor: COLORS.accent.primary,
    backgroundColor: 'rgba(224, 59, 140, 0.12)',
  },
  optionText: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.text.secondary,
  },
  optionTextSelected: {
    color: COLORS.text.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    backgroundColor: COLORS.background.secondary,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  nextButtonText: {
    color: COLORS.background.primary,
    fontSize: 16,
    fontFamily: FONTS.body,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
