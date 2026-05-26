import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useOBD1 } from '@/lib/obd1-context';
import { BigNumber } from '@/components/big-number';
import { ProgressBar } from '@/components/progress-bar';
import { FlagIndicator } from '@/components/flag-indicator';
import { useColors } from '@/hooks/use-colors';

export default function StreetDashboardScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data, isConnected } = useOBD1();

  const getTemperatureColor = (value: number) => {
    if (value < 80) return '#0099FF';
    if (value < 100) return colors.success;
    if (value < 110) return colors.warning;
    return colors.error;
  };

  const getBatteryColor = (value: number) => {
    if (value < 11) return colors.error;
    if (value < 12) return colors.warning;
    return colors.success;
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
            <Text className="text-2xl font-bold text-foreground">Street Dashboard</Text>
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

        {/* Principales - Grid 2x2 */}
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <BigNumber
                value={data.rpm}
                label="RPM"
                unit="rpm"
                decimals={0}
              />
            </View>
            <View className="flex-1">
              <BigNumber
                value={data.vss}
                label="Velocidad"
                unit="km/h"
                decimals={0}
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <BigNumber
                value={data.ect}
                label="Motor"
                unit="°C"
                decimals={1}
                getColor={getTemperatureColor}
              />
            </View>
            <View className="flex-1">
              <BigNumber
                value={data.iat}
                label="Aire"
                unit="°C"
                decimals={1}
                getColor={getTemperatureColor}
              />
            </View>
          </View>
        </View>

        {/* Batería y Alternador */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <BigNumber
              value={data.batteryVoltage}
              label="Batería"
              unit="V"
              decimals={2}
              getColor={getBatteryColor}
            />
          </View>
          <View className="flex-1">
            <BigNumber
              value={0}
              label="Alternador"
              unit="%"
              decimals={1}
            />
          </View>
        </View>

        {/* Sensores */}
        <View className="bg-surface rounded-lg p-4 gap-3">
          <Text className="text-sm font-semibold text-foreground mb-1">Sensores</Text>
          <ProgressBar
            value={data.o2}
            min={0}
            max={5}
            label="O2 Sensor"
            unit="V"
          />
          <ProgressBar
            value={data.injectionTime}
            min={0}
            max={25}
            label="Inyección"
            unit="ms"
          />
          <ProgressBar
            value={data.map}
            min={0}
            max={130}
            label="MAP"
            unit="kPa"
          />
        </View>

        {/* Correcciones de combustible */}
        <View className="bg-surface rounded-lg p-4 gap-3">
          <Text className="text-sm font-semibold text-foreground mb-1">Fuel Trim</Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <BigNumber
                value={0}
                label="STFT"
                unit="%"
                decimals={1}
              />
            </View>
            <View className="flex-1">
              <BigNumber
                value={0}
                label="LTFT"
                unit="%"
                decimals={1}
              />
            </View>
          </View>
        </View>

        {/* Estado */}
        <View className="bg-surface rounded-lg p-4 gap-3">
          <Text className="text-sm font-semibold text-foreground mb-1">Estado</Text>
          <FlagIndicator label="VTEC" isActive={data.flags.vtec} />
          <FlagIndicator label="Check Engine" isActive={data.flags.checkEngine} />
          <FlagIndicator label="Closed Loop" isActive={data.flags.closedLoop} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
