import React from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface FlagIndicatorProps {
  label: string;
  isActive: boolean;
  size?: number;
}

export function FlagIndicator({
  label,
  isActive,
  size = 12,
}: FlagIndicatorProps) {
  const colors = useColors();
  const indicatorColor = isActive ? colors.success : colors.border;

  return (
    <View className="flex-row items-center gap-2">
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: indicatorColor,
          borderWidth: 1,
          borderColor: isActive ? colors.success : colors.muted,
        }}
      />
      <Text className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted'}`}>
        {label}
      </Text>
    </View>
  );
}
