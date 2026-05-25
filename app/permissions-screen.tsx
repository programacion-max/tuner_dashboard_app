import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

interface PermissionStatus {
  name: string;
  status: string;
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
          const scanStatus = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
          );
          permissionsList.push({
            name: 'BLUETOOTH_SCAN',
            status: scanStatus ? 'granted' : 'denied',
            description: 'Escanear dispositivos Bluetooth',
          });
        } catch (e) {
          console.warn('BLUETOOTH_SCAN no disponible:', e);
        }

        // Verificar BLUETOOTH_CONNECT
        try {
          const connectStatus = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
          );
          permissionsList.push({
            name: 'BLUETOOTH_CONNECT',
            status: connectStatus ? 'granted' : 'denied',
            description: 'Conectar a dispositivos Bluetooth',
          });
        } catch (e) {
          console.warn('BLUETOOTH_CONNECT no disponible:', e);
        }

        // Verificar ACCESS_FINE_LOCATION
        try {
          const locationStatus = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          permissionsList.push({
            name: 'ACCESS_FINE_LOCATION',
            status: locationStatus ? 'granted' : 'denied',
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
      } else {
        // En iOS, los permisos se solicitan automáticamente
        setAllGranted(true);
      }
    } catch (err) {
      console.error('Error checking permissions:', err);
      setError('Error al verificar permisos');
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    setLoading(true);
    setError(null);

    if (Platform.OS === 'android') {
      try {
        const permissionsToRequest = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        const results = await PermissionsAndroid.requestMultiple(
          permissionsToRequest
        );

        // Verificar resultados
        const allGrantedStatus = Object.values(results).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );

        if (allGrantedStatus) {
          setAllGranted(true);
          // Navegar al dashboard después de 500ms
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 500);
        } else {
          setError('Se requieren todos los permisos para continuar');
          await checkPermissions();
        }
      } catch (err) {
        console.error('Error requesting permissions:', err);
        setError('Error al solicitar permisos');
      }
    } else {
      // En iOS, asumir que está permitido
      setAllGranted(true);
      router.replace('/(tabs)');
    }

    setLoading(false);
  };

  const handleSkip = () => {
    // Permitir continuar sin permisos (mostrará error en Bluetooth)
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="gap-6">
        {/* Encabezado */}
        <View className="gap-2 mt-8">
          <Text className="text-3xl font-bold text-foreground">
            Permisos Requeridos
          </Text>
          <Text className="text-base text-muted">
            La app necesita acceso a Bluetooth para conectarse a tu ECU
          </Text>
        </View>

        {/* Loading */}
        {loading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-4 text-muted">Verificando permisos...</Text>
          </View>
        )}

        {/* Error */}
        {error && !loading && (
          <View className="bg-error/20 border border-error rounded-lg p-4">
            <Text className="text-error font-semibold">{error}</Text>
          </View>
        )}

        {/* Permisos List */}
        {!loading && permissions.length > 0 && (
          <View className="gap-3">
            {permissions.map((perm) => (
              <View
                key={perm.name}
                className="flex-row items-center gap-3 bg-surface rounded-lg p-4 border border-border"
              >
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center ${
                    perm.status === 'granted'
                      ? 'bg-success'
                      : 'bg-warning'
                  }`}
                >
                  <Text className="text-white text-xs font-bold">
                    {perm.status === 'granted' ? '✓' : '!'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">
                    {perm.name}
                  </Text>
                  <Text className="text-sm text-muted">
                    {perm.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Botones */}
        {!loading && (
          <View className="gap-3 mt-auto mb-8">
            {!allGranted ? (
              <>
                <TouchableOpacity
                  onPress={requestPermissions}
                  className="bg-primary rounded-lg p-4 items-center active:opacity-80"
                >
                  <Text className="text-background font-bold text-lg">
                    Solicitar Permisos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSkip}
                  className="border border-border rounded-lg p-4 items-center active:opacity-80"
                >
                  <Text className="text-foreground font-semibold">
                    Continuar sin permisos
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => router.replace('/(tabs)')}
                className="bg-success rounded-lg p-4 items-center active:opacity-80"
              >
                <Text className="text-background font-bold text-lg">
                  Continuar al Dashboard
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
