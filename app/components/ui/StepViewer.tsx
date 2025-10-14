import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { ChallengeStep } from '../../types';

interface StepViewerProps {
  step: ChallengeStep;
  onOptionSelect?: (option: string) => void;
  selectedOption?: string;
}

export const StepViewer = React.memo<StepViewerProps>(({
  step,
  onOptionSelect,
  selectedOption
}) => {
  const renderContent = () => {
    switch (step.stepType) {
      case 'ice-breaker':
      case 'thought-drop':
      case 'text':
        return (
          <Text style={{
            fontSize: 16,
            color: COLORS.text.primary,
            lineHeight: 24,
          }}>
            {step.content}
          </Text>
        );
      case 'mcq':
        return (
          <View>
            <Text style={{
              fontSize: 16,
              color: COLORS.text.primary,
              marginBottom: 16,
              lineHeight: 24,
            }}>
              {step.content}
            </Text>
            {step.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onOptionSelect?.(option)}
                style={{
                  backgroundColor: selectedOption === option ? COLORS.background.elevated : COLORS.background.secondary,
                  borderRadius: 8,
                  padding: 12,
                  marginVertical: 4,
                  borderWidth: selectedOption === option ? 2 : 0,
                  borderColor: COLORS.accent.primary,
                }}
              >
                <Text style={{
                  color: selectedOption === option ? COLORS.accent.primary : COLORS.text.primary,
                  fontWeight: selectedOption === option ? '600' : 'normal',
                }}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'image':
        // Placeholder for future image support
        return (
          <Text style={{ color: COLORS.text.secondary }}>
            Image step (future feature): {step.content}
          </Text>
        );
      case 'puzzle':
        // Placeholder for future puzzle support
        return (
          <Text style={{ color: COLORS.text.secondary }}>
            Puzzle step (future feature): {step.content}
          </Text>
        );
      default:
        return (
          <Text style={{ color: COLORS.text.secondary }}>
            Unsupported step type: {step.stepType}
          </Text>
        );
    }
  };

  return (
    <View style={{
      flex: 1,
      padding: 20,
      justifyContent: 'center',
    }}>
      {renderContent()}
    </View>
  );
});
