import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BackButton } from '../components/navigation/BackButton';

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
          <View>
            <Text style={{ fontSize: 18, marginBottom: 16 }}>
              {currentStep.content}
            </Text>
            {currentStep.type === 'thought-drop' && (
              <Text>Text input would go here</Text>
            )}
          </View>
        );
      case 'mcq':
        return (
          <View>
            <Text style={{ fontSize: 18, marginBottom: 16 }}>
              {currentStep.content}
            </Text>
            {currentStep.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 12,
                  margin: 4,
                  backgroundColor: selectedOption === option ? '#007AFF' : '#f0f0f0',
                  borderRadius: 8,
                }}
                onPress={() => setSelectedOption(option)}
              >
                <Text style={{ color: selectedOption === option ? 'white' : 'black' }}>
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
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  inner: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  nextButton: {
    padding: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
