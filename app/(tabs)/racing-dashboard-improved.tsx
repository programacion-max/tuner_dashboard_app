/**
 * Racing Dashboard Mejorado - Inspirado en TunerView
 * Diseño optimizado para pista con RPM prominente
 */

import React, { useMemo } from 'react';
import { View, ScrollView, Pressable, Text, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useOBD1 } from '@/lib/obd1-context';
import { useDashboard } from '@/lib/dashboard-context';
import { WidgetRenderer } from '@/components/widget-renderer';
import { RACING_THEME } from '@/lib/dashboard-types';

export default function RacingDashboardImproved() {
  const colors = useColors();
  const { data, isConnected } = useOBD1();
  const { activeDashboard, isLoading } = useDashboard();

  // Usar el dashboard Racing del contexto o el layout por defecto
  const dashboard = activeDashboard?.id === 'racing' ? activeDashboard : null;

  const getParameterValue = (parameter: string): number => {
    if (!data) return 0;
    const key = parameter as keyof typeof data;
    return typeof data[key] === 'number' ? (data[key] as number) : 0;
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const theme = dashboard?.theme || RACING_THEME;

  return (
    <ScreenContainer
      className="p-0"
      containerClassName={`flex-1`}
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Header con estado de conexión */}
      <View
        className="px-4 py-3 flex-row items-center justify-between"
        style={{ borderBottomColor: theme.gridColor, borderBottomWidth: 1 }}
      >
        <Text className="text-lg font-bold" style={{ color: theme.textColor }}>
          Racing Dashboard
        </Text>
        <View
          className={`px-3 py-1 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <Text className="text-xs font-semibold text-white">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </Text>
        </View>
      </View>

      {/* Canvas de widgets */}
      <View
        className="flex-1 relative"
        style={{
          backgroundColor: theme.backgroundColor,
          overflow: 'hidden',
        }}
      >
        {dashboard?.widgets.map((widget) => (
          <WidgetRenderer
            key={widget.id}
            widget={widget}
            value={getParameterValue(widget.parameter)}
            theme={{
              backgroundColor: theme.backgroundColor,
              textColor: theme.textColor,
              warningColor: theme.warningColor,
              criticalColor: theme.criticalColor,
            }}
          />
        ))}
      </View>

      {/* Footer con info */}
      {!isConnected && (
        <View
          className="px-4 py-3"
          style={{ backgroundColor: theme.criticalColor }}
        >
          <Text className="text-sm font-semibold text-white text-center">
            Conecta un dispositivo Bluetooth para ver datos en vivo
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}
