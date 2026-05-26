import React, { useMemo } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useOBD1 } from '@/lib/obd1-context';
import { Gauge } from '@/components/gauge';
import { ProgressBar } from '@/components/progress-bar';
import { FlagIndicator } from '@/components/flag-indicator';
import { BigNumber } from '@/components/big-number';
import { useColors } from '@/hooks/use-colors';

export default function RacingDashboardScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data, isConnected } = useOBD1();

  // Funciones de color dinámico
  const getRPMColor = (value: number) => {
    if (value < 3000) return colors.success;
    if (value < 6000) return colors.warning;
    return colors.error;
  };

  const getTemperatureColor = (value: number) => {
    if (value < 80) return '#0099FF'; // Azul
    if (value < 100) return colors.success; // Verde
    if (value < 110) return colors.warning; // Amarillo
    return colors.error; // Rojo
  };

  const getTPS_Color = (value: number) => {
    if (value < 10) return colors.success;
    if (value < 50) return colors.warning;
    return colors.error;
  };

  const getMAP_Color = (value: number) => {
    if (value < 50) return colors.success;
    if (value < 100) return colors.warning;
    return colors.error;
  };

  if (!data) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-muted">Cargando datos...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="gap-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-2xl font-bold text-foreground">Racing Dashboard</Text>
            <Text className={`text-xs font-semibold ${isConnected ? 'text-success' : 'text-error'}`}>
              {isConnected ? '● Conectado' : '● Desconectado'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            className="p-2 rounded-lg bg-surface active:opacity-70"
          >
            <Text className="text-xl">⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* RPM Gauge - Prominente */}
        <View className="bg-surface rounded-lg p-4 items-center">
          <Gauge
            value={data.rpm}
            min={0}
            max={9000}
            unit="RPM"
            label="Motor"
            width={240}
            height={240}
            getColor={getRPMColor}
          />
        </View>

        {/* Velocidad y Temperatura - Row */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-surface rounded-lg p-4">
            <BigNumber
              value={data.vss}
              label="Velocidad"
              unit="km/h"
              decimals={0}
            />
          </View>
          <View className="flex-1 bg-surface rounded-lg p-4">
            <BigNumber
              value={data.ect}
              label="Temperatura"
              unit="°C"
              decimals={1}
              getColor={getTemperatureColor}
            />
          </View>
        </View>

        {/* MAP y TPS - Barras */}
        <View className="bg-surface rounded-lg p-4 gap-4">
          <ProgressBar
            value={data.map}
            min={0}
            max={130}
            label="MAP (Presión)"
            unit="kPa"
            getColor={getMAP_Color}
          />
          <ProgressBar
            value={data.tps}
            min={0}
            max={100}
            label="TPS (Acelerador)"
            unit="%"
            getColor={getTPS_Color}
          />
        </View>

        {/* Ignición y Duty Cycle */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-surface rounded-lg p-4">
            <BigNumber
              value={data.ignitionAdvance}
              label="Ignición"
              unit="°"
              decimals={1}
            />
          </View>
          <View className="flex-1 bg-surface rounded-lg p-4">
            <BigNumber
              value={data.dutyCycle}
              label="Duty Cycle"
              unit="%"
              decimals={1}
            />
          </View>
        </View>

        {/* Flags de Estado */}
        <View className="bg-surface rounded-lg p-4 gap-3">
          <Text className="text-sm font-semibold text-foreground mb-1">Estado del Motor</Text>
          <FlagIndicator label="VTEC" isActive={data.flags.vtec} />
          <FlagIndicator label="Check Engine" isActive={data.flags.checkEngine} />
          <FlagIndicator label="A/C Clutch" isActive={data.flags.acClutch} />
          <FlagIndicator label="Closed Loop" isActive={data.flags.closedLoop} />
        </View>

        {/* Información adicional */}
        <View className="bg-surface rounded-lg p-4 gap-2">
          <View className="flex-row justify-between">
            <Text className="text-xs text-muted">Batería</Text>
            <Text className="text-sm font-semibold text-foreground">
              {data.batteryVoltage.toFixed(2)}V
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-muted">O2 Sensor</Text>
            <Text className="text-sm font-semibold text-foreground">
              {data.o2.toFixed(2)}V
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-muted">Inyección</Text>
            <Text className="text-sm font-semibold text-foreground">
              {data.injectionTime.toFixed(2)}ms
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
