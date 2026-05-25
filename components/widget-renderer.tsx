/**
 * Renderizador de widgets para dashboards
 * Renderiza diferentes tipos de widgets según su configuración
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Widget, PARAMETER_INFO } from '@/lib/dashboard-types';
import { Gauge } from './gauge';
import { ProgressBar } from './progress-bar';
import { FlagIndicator } from './flag-indicator';
import { BigNumber } from './big-number';

interface WidgetRendererProps {
  widget: Widget;
  value: number;
  theme: {
    backgroundColor: string;
    textColor: string;
    warningColor: string;
    criticalColor: string;
  };
  isEditing?: boolean;
  onSelect?: (widgetId: string) => void;
}

export function WidgetRenderer({
  widget,
  value,
  theme,
  isEditing,
  onSelect,
}: WidgetRendererProps) {
  const paramInfo = PARAMETER_INFO[widget.parameter];
  const config = widget.config;

  // Determinar color según rango
  const getColor = useMemo(() => {
    if (config.criticalThreshold && value >= config.criticalThreshold) {
      return theme.criticalColor;
    }
    if (config.warningThreshold && value >= config.warningThreshold) {
      return theme.warningColor;
    }
    return config.color || theme.textColor;
  }, [value, config, theme]);

  const containerStyle = {
    position: 'absolute' as const,
    left: widget.position.x,
    top: widget.position.y,
    width: widget.position.width,
    height: widget.position.height,
    borderWidth: isEditing ? 2 : 0,
    borderColor: isEditing ? '#00bcd4' : 'transparent',
    borderRadius: 8,
    overflow: 'hidden' as const,
  };

  const handlePress = () => {
    if (isEditing && onSelect) {
      onSelect(widget.id);
    }
  };

  switch (widget.type) {
    case 'gauge':
      return (
        <View style={containerStyle} onTouchEnd={handlePress}>
          <Gauge
            value={value}
            min={config.min || paramInfo.min}
            max={config.max || paramInfo.max}
            unit={config.unit || paramInfo.unit}
            label={config.label || paramInfo.label}
            getColor={() => getColor}
          />
        </View>
      );

    case 'bar':
      return (
        <View
          style={[
            containerStyle,
            {
              backgroundColor: config.backgroundColor || theme.backgroundColor,
              justifyContent: 'center',
              paddingHorizontal: 8,
            },
          ]}
          onTouchEnd={handlePress}
        >
          <Text
            style={{
              color: theme.textColor,
              fontSize: config.fontSize || 12,
              marginBottom: 4,
            }}
          >
            {config.label || paramInfo.label}
          </Text>
          <ProgressBar
            value={value}
            min={config.min || paramInfo.min}
            max={config.max || paramInfo.max}
            label={config.label || paramInfo.label}
            unit={config.unit || paramInfo.unit}
            getColor={() => getColor}
            height={20}
          />
        </View>
      );

    case 'number':
      return (
        <View
          style={[
            containerStyle,
            {
              backgroundColor: config.backgroundColor || theme.backgroundColor,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
          onTouchEnd={handlePress}
        >
          <BigNumber
            value={value}
            unit={config.unit || paramInfo.unit}
            label={config.label || paramInfo.label}
            getColor={() => getColor}
            decimals={config.decimals || paramInfo.decimals}
          />
        </View>
      );

    case 'flag':
      return (
        <View
          style={[
            containerStyle,
            {
              backgroundColor: config.backgroundColor || theme.backgroundColor,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
          onTouchEnd={handlePress}
        >
          <FlagIndicator
            isActive={value > 0}
            label={config.label || paramInfo.label}
            size={Math.min(widget.position.width, widget.position.height) * 0.6}
          />
        </View>
      );

    case 'text':
      return (
        <View
          style={[
            containerStyle,
            {
              backgroundColor: config.backgroundColor || theme.backgroundColor,
              justifyContent: 'center',
              paddingHorizontal: 8,
            },
          ]}
          onTouchEnd={handlePress}
        >
          <Text
            style={{
              color: theme.textColor,
              fontSize: config.fontSize || 14,
              fontWeight: '600',
            }}
          >
            {config.label || paramInfo.label}
          </Text>
        </View>
      );

    case 'graph':
      // Placeholder para gráficas en tiempo real
      return (
        <View
          style={[
            containerStyle,
            {
              backgroundColor: config.backgroundColor || theme.backgroundColor,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
          onTouchEnd={handlePress}
        >
          <Text style={{ color: theme.textColor, fontSize: 12 }}>
            Gráfica: {config.label || paramInfo.label}
          </Text>
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
