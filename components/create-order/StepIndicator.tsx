import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography, Fonts } from '@/constants/theme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <React.Fragment key={stepNum}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isActive && styles.circleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      (isCompleted || isActive) && styles.circleTextActive,
                    ]}
                  >
                    {isCompleted ? '✓' : stepNum}
                  </Text>
                </View>
                <Text
                  style={[styles.label, isActive && styles.labelActive]}
                  numberOfLines={1}
                >
                  {labels[index]}
                </Text>
              </View>
              {index < totalSteps - 1 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
    width: 72,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  circleActive: {
    borderColor: Colors.primaryText,
    backgroundColor: Colors.primaryText,
  },
  circleCompleted: {
    borderColor: Colors.success,
    backgroundColor: Colors.success,
  },
  circleText: {
    ...Typography.caption1,
    fontFamily: Fonts.sansSemiBold,
    color: Colors.secondaryText,
  },
  circleTextActive: {
    color: Colors.background,
  },
  label: {
    ...Typography.caption2,
    color: Colors.secondaryText,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.primaryText,
    fontFamily: Fonts.sansSemiBold,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginTop: 13,
    marginHorizontal: -4,
  },
  connectorCompleted: {
    backgroundColor: Colors.success,
  },
});
