import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { useColors } from '@/hooks/use-colors';

export interface GaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  width?: number;
  height?: number;
  getColor?: (value: number, min: number, max: number) => string;
}

export function Gauge({
  value,
  min,
  max,
  unit,
  label,
  width = 200,
  height = 200,
  getColor,
}: GaugeProps) {
  const colors = useColors();
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  // Convertir valor a ángulo (0° a 270°, donde 0° es arriba-izquierda)
  const normalizedValue = Math.max(min, Math.min(max, value));
  const percentage = (normalizedValue - min) / (max - min);
  const startAngle = 135; // Inicio en arriba-izquierda
  const endAngle = 405; // Fin en arriba-derecha
  const currentAngle = startAngle + percentage * (endAngle - startAngle);

  // Convertir ángulo a radianes
  const angleRad = (currentAngle * Math.PI) / 180;
  const needleLength = radius * 0.75;
  const needleX = centerX + needleLength * Math.sin(angleRad);
  const needleY = centerY - needleLength * Math.cos(angleRad);

  // Determinar color
  const defaultColor = colors.accent;
  const gaugeColor = getColor
    ? getColor(normalizedValue, min, max)
    : defaultColor;

  // Crear arco de fondo
  const arcStartRad = (startAngle * Math.PI) / 180;
  const arcEndRad = (endAngle * Math.PI) / 180;
  const arcStartX = centerX + radius * Math.sin(arcStartRad);
  const arcStartY = centerY - radius * Math.cos(arcStartRad);
  const arcEndX = centerX + radius * Math.sin(arcEndRad);
  const arcEndY = centerY - radius * Math.cos(arcEndRad);

  const arcPath = `M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 0 1 ${arcEndX} ${arcEndY}`;

  // Crear arco de valor
  const valueArcEndRad = angleRad;
  const valueArcEndX = centerX + radius * Math.sin(valueArcEndRad);
  const valueArcEndY = centerY - radius * Math.cos(valueArcEndRad);
  const largeArc = percentage > 0.5 ? 1 : 0;
  const valueArcPath = `M ${arcStartX} ${arcStartY} A ${radius} ${radius} 0 ${largeArc} 1 ${valueArcEndX} ${valueArcEndY}`;

  return (
    <View className="items-center gap-2">
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Arco de fondo */}
        <Path
          d={arcPath}
          stroke={colors.border}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />

        {/* Arco de valor */}
        <Path
          d={valueArcPath}
          stroke={gaugeColor}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />

        {/* Centro del gauge */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={12}
          fill={colors.surface}
          stroke={gaugeColor}
          strokeWidth={2}
        />

        {/* Aguja */}
        <Path
          d={`M ${centerX} ${centerY} L ${needleX} ${needleY}`}
          stroke={gaugeColor}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Marcas de escala */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, idx) => {
          const tickAngle = startAngle + tick * (endAngle - startAngle);
          const tickRad = (tickAngle * Math.PI) / 180;
          const outerX = centerX + radius * Math.sin(tickRad);
          const outerY = centerY - radius * Math.cos(tickRad);
          const innerX = centerX + (radius - 12) * Math.sin(tickRad);
          const innerY = centerY - (radius - 12) * Math.cos(tickRad);

          return (
            <Path
              key={`tick-${idx}`}
              d={`M ${outerX} ${outerY} L ${innerX} ${innerY}`}
              stroke={colors.muted}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}

        {/* Números en la escala */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, idx) => {
          const tickAngle = startAngle + tick * (endAngle - startAngle);
          const tickRad = (tickAngle * Math.PI) / 180;
          const labelRadius = radius - 30;
          const labelX = centerX + labelRadius * Math.sin(tickRad);
          const labelY = centerY - labelRadius * Math.cos(tickRad);
          const tickValue = Math.round(min + tick * (max - min));

          return (
            <SvgText
              key={`label-${idx}`}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              fontSize={12}
              fill={colors.muted}
              fontWeight="600"
            >
              {tickValue}
            </SvgText>
          );
        })}
      </Svg>

      {/* Valor y unidad */}
      <View className="items-center gap-1">
        <Text className="text-4xl font-bold text-foreground">
          {normalizedValue.toFixed(0)}
        </Text>
        <Text className="text-sm text-muted">{unit}</Text>
        <Text className="text-xs text-muted">{label}</Text>
      </View>
    </View>
  );
}
