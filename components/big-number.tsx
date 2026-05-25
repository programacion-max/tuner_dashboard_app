import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface BigNumberProps {
  value: number;
  label: string;
  unit: string;
  getColor?: (value: number) => string;
  decimals?: number;
}

export function BigNumber({
  value,
  label,
  unit,
  getColor,
  decimals = 0,
}: BigNumberProps) {
  const colors = useColors();
  const textColor = getColor ? getColor(value) : colors.foreground;

  return (
    <View className="items-center gap-1 p-4 rounded-lg bg-surface">
      <Text className="text-xs text-muted uppercase tracking-wider">{label}</Text>
      <View className="flex-row items-baseline gap-1">
        <Text className="text-5xl font-bold" style={{ color: textColor }}>
          {value.toFixed(decimals)}
        </Text>
        <Text className="text-lg text-muted">{unit}</Text>
      </View>
    </View>
  );
}
