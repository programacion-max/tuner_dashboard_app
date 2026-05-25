import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useOBD1 } from '@/lib/obd1-context';
import { bluetoothService } from '@/lib/bluetooth-service';
import { useColors } from '@/hooks/use-colors';

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { isConnected, setConnected, setReading } = useOBD1();
  const [updateFrequency, setUpdateFrequency] = useState(50);

  const handleDisconnect = async () => {
    await bluetoothService.disconnect();
    setConnected(false);
    setReading(false);
    router.replace('/bluetooth-connect');
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="gap-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-2xl font-bold text-foreground">Configuración</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-lg bg-surface active:opacity-70"
          >
            <Text className="text-xl">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Conexión Bluetooth */}
        <View className="bg-surface rounded-lg p-4 gap-3">
          <Text className="text-sm font-semibold text-foreground mb-1">Conexión Bluetooth</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-muted">Estado</Text>
            <View className="flex-row items-center gap-2">
              <View
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: isConnected ? colors.success : colors.error,
                }}
              />
              <Text className="text-sm font-semibold text-foreground">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Text>
            </View>
          </View>

          {isConnected && (
            <TouchableOpacity
              onPress={handleDisconnect}
              className="bg-error p-3 rounded-lg active:opacity-80 mt-2"
            >
              <Text className="text-center text-sm font-semibold text-background">
                Desconectar
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Frecuencia de actualización */}
        <View className="bg-surface rounded-lg p-4 gap-3">
          <Text className="text-sm font-semibold text-foreground mb-1">
            Frecuencia de Actualización
          </Text>
          <Text className="text-xs text-muted">
            Intervalo entre lecturas de datos (ms)
          </Text>

          <View className="gap-2">
            {[20, 50, 100, 200].map((freq) => (
              <TouchableOpacity
                key={freq}
                onPress={() => setUpdateFrequency(freq)}
                className={`p-3 rounded-lg flex-row items-center justify-between ${
                  updateFrequency === freq ? 'bg-primary' : 'bg-background border border-border'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    updateFrequency === freq ? 'text-background' : 'text-foreground'
                  }`}
                >
                  {freq}ms
                </Text>
                <Text
                  className={`text-xs ${
                    updateFrequency === freq ? 'text-background opacity-70' : 'text-muted'
                  }`}
                >
                  {Math.round(1000 / freq)} Hz
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Información */}
        <View className="bg-surface rounded-lg p-4 gap-2">
          <Text className="text-sm font-semibold text-foreground mb-1">Información</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Aplicación</Text>
              <Text className="text-xs font-semibold text-foreground">OBD1 Dashboard</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Versión</Text>
              <Text className="text-xs font-semibold text-foreground">1.0.0</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Protocolo</Text>
              <Text className="text-xs font-semibold text-foreground">Crome QD3</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Baudrate</Text>
              <Text className="text-xs font-semibold text-foreground">38400 bps</Text>
            </View>
          </View>
        </View>

        {/* Instrucciones */}
        <View className="bg-surface rounded-lg p-4 gap-2">
          <Text className="text-sm font-semibold text-foreground mb-1">Instrucciones</Text>
          <Text className="text-xs text-muted leading-relaxed">
            1. Asegúrate de que el módulo HC-05 esté conectado a la ECU{'\n'}
            2. Verifica que el jumper J12 (big case) o J4 (small case) esté removido{'\n'}
            3. Conecta el módulo a través de Bluetooth{'\n'}
            4. Monitorea los parámetros en tiempo real{'\n'}
            5. Usa los diferentes dashboards para diferentes modos
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
