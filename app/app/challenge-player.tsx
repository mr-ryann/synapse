import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

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
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Challenge Player - Step {currentStepIndex + 1} of {mockSteps.length}
      </Text>
      {renderStep()}
      <TouchableOpacity
        style={{
          padding: 16,
          backgroundColor: '#007AFF',
          borderRadius: 8,
          marginTop: 16,
        }}
        onPress={handleNext}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {currentStepIndex < mockSteps.length - 1 ? 'Next' : 'Complete'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
