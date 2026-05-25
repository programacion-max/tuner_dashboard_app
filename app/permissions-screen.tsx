import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

const REQUIRED_PERMISSIONS = [
  'BLUETOOTH',
  'BLUETOOTH_SCAN',
  'BLUETOOTH_CONNECT',
  'ACCESS_FINE_LOCATION',
];

interface PermissionStatus {
  name: string;
  status: 'granted' | 'denied' | 'pending' | 'undetermined';
  description: string;
}

export default function PermissionsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [permissions, setPermissions] = useState<PermissionStatus[]>([]);
  const [allGranted, setAllGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar permisos
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // En Android 11+, verificar permisos de Bluetooth
      if (Platform.OS === 'android') {
        const permissionsList: PermissionStatus[] = [];

        // Verificar BLUETOOTH_SCAN
        try {
          const scanStatus = await Permissions.getAsync('BLUETOOTH_SCAN');
          permissionsList.push({
            name: 'BLUETOOTH_SCAN',
            status: scanStatus.status as any,
            description: 'Escanear dispositivos Bluetooth',
          });
        } catch (e) {
          console.warn('BLUETOOTH_SCAN no disponible:', e);
        }

        // Verificar BLUETOOTH_CONNECT
        try {
          const connectStatus = await Permissions.getAsync('BLUETOOTH_CONNECT');
          permissionsList.push({
            name: 'BLUETOOTH_CONNECT',
            status: connectStatus.status as any,
            description: 'Conectar a dispositivos Bluetooth',
          });
        } catch (e) {
          console.warn('BLUETOOTH_CONNECT no disponible:', e);
        }

        // Verificar ACCESS_FINE_LOCATION
        try {
          const locationStatus = await Permissions.getAsync('ACCESS_FINE_LOCATION');
          permissionsList.push({
            name: 'ACCESS_FINE_LOCATION',
            status: locationStatus.status as any,
            description: 'Ubicación precisa (requerida para Bluetooth)',
          });
        } catch (e) {
          console.warn('ACCESS_FINE_LOCATION no disponible:', e);
        }

        setPermissions(permissionsList);

        // Verificar si todos están concedidos
        const allGrantedStatus = permissionsList.every(
          (p) => p.status === 'granted'
        );
        setAllGranted(allGrantedStatus);

        if (allGrantedStatus) {
          // Navegar al dashboard después de 500ms
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 500);
        }
      } else {
        // En iOS, los permisos se solicitan automáticamente
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Error checking permissions:', err);
      setError('Error al verificar permisos. Por favor, reinicia la app.');
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (Platform.OS === 'android') {
        // Solicitar permisos de Bluetooth
        const results: any = {};

        try {
          const scanResult = await Permissions.askAsync('BLUETOOTH_SCAN');
          results['BLUETOOTH_SCAN'] = scanResult;
        } catch (e) {
          console.warn('Error solicitando BLUETOOTH_SCAN:', e);
        }

        try {
          const connectResult = await Permissions.askAsync('BLUETOOTH_CONNECT');
          results['BLUETOOTH_CONNECT'] = connectResult;
        } catch (e) {
          console.warn('Error solicitando BLUETOOTH_CONNECT:', e);
        }

        try {
          const locationResult = await Permissions.askAsync('ACCESS_FINE_LOCATION');
          results['ACCESS_FINE_LOCATION'] = locationResult;
        } catch (e) {
          console.warn('Error solicitando ACCESS_FINE_LOCATION:', e);
        }

        // Verificar resultados
        await checkPermissions();
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
      setError('Error al solicitar permisos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const openSettings = async () => {
    try {
      // Abrir configuración de la app
      if (Platform.OS === 'android') {
        // En Android, abrir configuración de la app
        const { openSettings } = require('expo-intent-launcher');
        openSettings();
      }
    } catch (err) {
      console.error('Error opening settings:', err);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="gap-6">
        {/* Header */}
        <View className="gap-2 mt-4">
          <Text className="text-3xl font-bold text-foreground">OBD1 Dashboard</Text>
          <Text className="text-sm text-muted">
            Permisos necesarios para conectar con tu vehículo
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-error/10 border border-error rounded-lg p-4">
            <Text className="text-error text-sm font-semibold">{error}</Text>
          </View>
        )}

        {/* Permissions List */}
        {permissions.length > 0 ? (
          <View className="bg-surface rounded-lg p-4 gap-3">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Estado de Permisos
            </Text>
            {permissions.map((perm) => (
              <View
                key={perm.name}
                className="flex-row items-center justify-between p-3 bg-background rounded"
              >
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-foreground">
                    {perm.description}
                  </Text>
                  <Text className="text-xs text-muted mt-1">{perm.name}</Text>
                </View>
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    perm.status === 'granted' ? 'bg-success' : 'bg-error'
                  }`}
                >
                  <Text className="text-white font-bold">
                    {perm.status === 'granted' ? '✓' : '✕'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Info Box */}
        <View className="bg-primary/10 border border-primary rounded-lg p-4">
          <Text className="text-xs text-foreground leading-relaxed">
            <Text className="font-semibold">Por qué necesitamos estos permisos:</Text>
            {'\n\n'}
            • <Text className="font-semibold">Bluetooth:</Text> Para conectar con el módulo HC-05
            {'\n'}
            • <Text className="font-semibold">Ubicación:</Text> Requerida por Android 11+ para escanear Bluetooth
          </Text>
        </View>

        {/* Buttons */}
        <View className="gap-3 mt-auto">
          {!allGranted ? (
            <>
              <TouchableOpacity
                onPress={requestPermissions}
                disabled={loading}
                className={`rounded-lg p-4 items-center ${
                  loading ? 'bg-primary/50' : 'bg-primary'
                }`}
              >
                <Text className="text-background font-semibold">
                  {loading ? 'Solicitando...' : 'Solicitar Permisos'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openSettings}
                className="rounded-lg p-4 items-center border border-primary"
              >
                <Text className="text-primary font-semibold">
                  Abrir Configuración
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace('/(tabs)')}
                className="rounded-lg p-4 items-center"
              >
                <Text className="text-muted font-semibold">
                  Continuar sin permisos (limitado)
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              className="rounded-lg p-4 items-center bg-success"
            >
              <Text className="text-background font-semibold">
                Continuar al Dashboard
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
