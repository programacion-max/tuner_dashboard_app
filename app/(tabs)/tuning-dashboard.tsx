import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useOBD1 } from '@/lib/obd1-context';
import { BigNumber } from '@/components/big-number';
import { useColors } from '@/hooks/use-colors';

export default function TuningDashboardScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data, isConnected, getHistory } = useOBD1();
  const [selectedParams, setSelectedParams] = useState(['rpm', 'ect', 'map', 'tps']);

  const history = getHistory();

  // Datos para tabla
  const tableData = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'RPM', value: data.rpm.toFixed(0), unit: 'rpm' },
      { label: 'Velocidad', value: data.vss.toFixed(0), unit: 'km/h' },
      { label: 'ECT', value: data.ect.toFixed(1), unit: '°C' },
      { label: 'IAT', value: data.iat.toFixed(1), unit: '°C' },
      { label: 'MAP', value: data.map.toFixed(1), unit: 'kPa' },
      { label: 'TPS', value: data.tps.toFixed(1), unit: '%' },
      { label: 'O2', value: data.o2.toFixed(2), unit: 'V' },
      { label: 'Batería', value: data.batteryVoltage.toFixed(2), unit: 'V' },
      { label: 'Inyección', value: data.injectionTime.toFixed(2), unit: 'ms' },
      { label: 'Ignición', value: data.ignition.toFixed(1), unit: '°' },
      { label: 'Duty Cycle', value: data.dutyCycle.toFixed(1), unit: '%' },
      { label: 'STFT', value: data.stft.toFixed(1), unit: '%' },
      { label: 'LTFT', value: data.ltft.toFixed(1), unit: '%' },
      { label: 'IACV', value: data.iacv.toFixed(1), unit: '%' },
      { label: 'Alternador', value: data.alternatorLoad.toFixed(1), unit: '%' },
    ];
  }, [data]);

  // Estadísticas de historial
  const stats = useMemo(() => {
    if (history.length === 0) return null;

    const rpmValues = history.map((d) => d.rpm);
    const ectValues = history.map((d) => d.ect);
    const mapValues = history.map((d) => d.map);

    return {
      rpm: {
        min: Math.min(...rpmValues),
        max: Math.max(...rpmValues),
        avg: Math.round(rpmValues.reduce((a, b) => a + b, 0) / rpmValues.length),
      },
      ect: {
        min: Math.min(...ectValues),
        max: Math.max(...ectValues),
        avg: (ectValues.reduce((a, b) => a + b, 0) / ectValues.length).toFixed(1),
      },
      map: {
        min: Math.min(...mapValues),
        max: Math.max(...mapValues),
        avg: (mapValues.reduce((a, b) => a + b, 0) / mapValues.length).toFixed(1),
      },
    };
  }, [history]);

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
            <Text className="text-2xl font-bold text-foreground">Tuning Dashboard</Text>
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

        {/* Duty Cycle Prominente */}
        <View className="bg-surface rounded-lg p-4">
          <BigNumber
            value={data.dutyCycle}
            label="Duty Cycle"
            unit="%"
            decimals={2}
          />
        </View>

        {/* Estadísticas */}
        {stats && (
          <View className="bg-surface rounded-lg p-4 gap-3">
            <Text className="text-sm font-semibold text-foreground mb-1">Estadísticas (últimos 60s)</Text>

            <View className="gap-2">
              <View className="flex-row justify-between p-2 bg-background rounded">
                <Text className="text-xs text-muted">RPM</Text>
                <Text className="text-xs font-semibold text-foreground">
                  Min: {stats.rpm.min} | Avg: {stats.rpm.avg} | Max: {stats.rpm.max}
                </Text>
              </View>

              <View className="flex-row justify-between p-2 bg-background rounded">
                <Text className="text-xs text-muted">ECT</Text>
                <Text className="text-xs font-semibold text-foreground">
                  Min: {stats.ect.min.toFixed(1)} | Avg: {stats.ect.avg} | Max: {stats.ect.max.toFixed(1)}
                </Text>
              </View>

              <View className="flex-row justify-between p-2 bg-background rounded">
                <Text className="text-xs text-muted">MAP</Text>
                <Text className="text-xs font-semibold text-foreground">
                  Min: {stats.map.min.toFixed(1)} | Avg: {stats.map.avg} | Max: {stats.map.max.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tabla de parámetros */}
        <View className="bg-surface rounded-lg p-4">
          <Text className="text-sm font-semibold text-foreground mb-3">Parámetros en Tiempo Real</Text>
          <FlatList
            scrollEnabled={false}
            data={tableData}
            keyExtractor={(item) => item.label}
            renderItem={({ item, index }) => (
              <View
                className={`flex-row justify-between items-center py-2 px-2 ${
                  index % 2 === 0 ? 'bg-background' : ''
                }`}
              >
                <Text className="text-xs text-muted flex-1">{item.label}</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {item.value}
                  <Text className="text-xs text-muted"> {item.unit}</Text>
                </Text>
              </View>
            )}
          />
        </View>

        {/* Información de historial */}
        <View className="bg-surface rounded-lg p-4 gap-2">
          <Text className="text-sm font-semibold text-foreground">Información</Text>
          <View className="flex-row justify-between">
            <Text className="text-xs text-muted">Puntos de datos</Text>
            <Text className="text-xs font-semibold text-foreground">{history.length}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-muted">Duración</Text>
            <Text className="text-xs font-semibold text-foreground">
              {((history.length * 50) / 1000).toFixed(1)}s
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
