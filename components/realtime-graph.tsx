/**
 * Gráfica en Tiempo Real
 * Muestra tendencias de parámetros OBD1 en los últimos 60 segundos
 */

import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Polyline, Line, Text as SvgText } from 'react-native-svg';
import { useColors } from '@/hooks/use-colors';

export interface RealtimeGraphProps {
  label: string;
  unit: string;
  dataPoints: number[];
  min: number;
  max: number;
  color?: string;
  width?: number;
  height?: number;
  maxDataPoints?: number;
}

export function RealtimeGraph({
  label,
  unit,
  dataPoints,
  min,
  max,
  color,
  width = 300,
  height = 150,
  maxDataPoints = 60,
}: RealtimeGraphProps) {
  const colors = useColors();
  const graphColor = color || colors.primary;

  // Calcular puntos para la gráfica
  const points = useMemo(() => {
    if (dataPoints.length === 0) return [];

    const padding = 20;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    return dataPoints.map((value, index) => {
      // Normalizar valor entre 0 y 1
      const normalized = (value - min) / (max - min);
      const clipped = Math.max(0, Math.min(1, normalized));

      // Calcular posición X (distribuir puntos uniformemente)
      const x = padding + (index / Math.max(1, dataPoints.length - 1)) * graphWidth;

      // Calcular posición Y (invertida porque Y aumenta hacia abajo)
      const y = padding + (1 - clipped) * graphHeight;

      return `${x},${y}`;
    });
  }, [dataPoints, min, max, width, height]);

  // Calcular rango visible
  const visibleMin = Math.min(...dataPoints, min);
  const visibleMax = Math.max(...dataPoints, max);
  const range = visibleMax - visibleMin || 1;

  // Líneas de referencia (grid)
  const gridLines = useMemo(() => {
    const padding = 20;
    const lines = [];

    // Línea mínima
    const minY = padding + (height - padding * 2);
    lines.push(
      <Line
        key="min-line"
        x1={padding}
        y1={minY}
        x2={width - padding}
        y2={minY}
        stroke={colors.border}
        strokeWidth={1}
        strokeDasharray="4,4"
      />
    );

    // Línea máxima
    const maxY = padding;
    lines.push(
      <Line
        key="max-line"
        x1={padding}
        y1={maxY}
        x2={width - padding}
        y2={maxY}
        stroke={colors.border}
        strokeWidth={1}
        strokeDasharray="4,4"
      />
    );

    // Línea media
    const midY = padding + (height - padding * 2) / 2;
    lines.push(
      <Line
        key="mid-line"
        x1={padding}
        y1={midY}
        x2={width - padding}
        y2={midY}
        stroke={colors.border}
        strokeWidth={1}
        strokeDasharray="2,2"
        opacity={0.5}
      />
    );

    return lines;
  }, [width, height, colors.border]);

  const currentValue = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1] : 0;
  const avgValue = dataPoints.length > 0 ? dataPoints.reduce((a, b) => a + b) / dataPoints.length : 0;

  return (
    <View className="gap-2">
      {/* Header */}
      <View className="flex-row items-center justify-between px-2">
        <View>
          <Text className="text-sm font-semibold text-foreground">{label}</Text>
          <Text className="text-xs text-muted">
            Actual: {currentValue.toFixed(1)} {unit} | Promedio: {avgValue.toFixed(1)} {unit}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold" style={{ color: graphColor }}>
            {currentValue.toFixed(1)}
          </Text>
          <Text className="text-xs text-muted">{unit}</Text>
        </View>
      </View>

      {/* Gráfica */}
      <View className="bg-surface rounded-lg overflow-hidden border border-border">
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Grid */}
          {gridLines}

          {/* Línea de datos */}
          {points.length > 1 && (
            <Polyline
              points={points.join(' ')}
              fill="none"
              stroke={graphColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Puntos */}
          {points.map((point, index) => {
            const [x, y] = point.split(',').map(Number);
            return (
              <circle
                key={`point-${index}`}
                cx={x}
                cy={y}
                r={dataPoints.length > 20 ? 1 : 2}
                fill={graphColor}
                opacity={0.7}
              />
            );
          })}

          {/* Etiquetas de ejes */}
          <SvgText
            x={10}
            y={25}
            fontSize={10}
            fill={colors.muted}
            textAnchor="start"
          >
            {max.toFixed(0)}
          </SvgText>
          <SvgText
            x={10}
            y={height - 10}
            fontSize={10}
            fill={colors.muted}
            textAnchor="start"
          >
            {min.toFixed(0)}
          </SvgText>
        </Svg>
      </View>

      {/* Estadísticas */}
      <View className="flex-row gap-4 px-2">
        <View>
          <Text className="text-xs text-muted">Mín</Text>
          <Text className="text-sm font-semibold text-foreground">
            {Math.min(...dataPoints, min).toFixed(1)}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-muted">Máx</Text>
          <Text className="text-sm font-semibold text-foreground">
            {Math.max(...dataPoints, max).toFixed(1)}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-muted">Puntos</Text>
          <Text className="text-sm font-semibold text-foreground">
            {dataPoints.length}
          </Text>
        </View>
      </View>
    </View>
  );
}
