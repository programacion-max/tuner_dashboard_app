import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface ProgressBarProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit?: string;
  getColor?: (value: number, min: number, max: number) => string;
  height?: number;
}

export function ProgressBar({
  value,
  min,
  max,
  label,
  unit = '%',
  getColor,
  height = 8,
}: ProgressBarProps) {
  const colors = useColors();
  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = ((normalizedValue - min) / (max - min)) * 100;

  const defaultColor = colors.accent;
  const barColor = getColor
    ? getColor(normalizedValue, min, max)
    : defaultColor;

  return (
    <View className="gap-1">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text className="text-sm text-muted">
          {normalizedValue.toFixed(1)}{unit}
        </Text>
      </View>
      <View
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: colors.border }}
      >
        <View
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: height / 2,
          }}
        />
      </View>
    </View>
  );
}
