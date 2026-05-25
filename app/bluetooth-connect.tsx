import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useOBD1 } from '@/lib/obd1-context';
import { bluetoothService, BluetoothDevice } from '@/lib/bluetooth-service';
import { useColors } from '@/hooks/use-colors';

export default function BluetoothConnectScreen() {
  const router = useRouter();
  const colors = useColors();
  const { setConnected, setReading, setError, updateData } = useOBD1();

  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Escanear dispositivos al cargar
    scanDevices();
  }, []);

  const scanDevices = async () => {
    setIsScanning(true);
    try {
      const foundDevices = await bluetoothService.scanDevices(5000);
      if (!foundDevices || foundDevices.length === 0) {
        setError('No se encontraron dispositivos Bluetooth');
      } else {
        setDevices(foundDevices);
        setError(null);
      }
    } catch (error) {
      console.error('Scan error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error al escanear dispositivos';
      setError(errorMsg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (device: BluetoothDevice) => {
    setIsConnecting(true);
    setSelectedDevice(device);
    setError(null);

    try {
      const connected = await bluetoothService.connect(device.id);

      if (connected) {
        setConnected(true);
        setError(null);

        // Iniciar lectura continua
        setReading(true);
        bluetoothService.startContinuousRead((data) => {
          updateData({
            rpm: data.rpm,
            vss: data.vss,
            ect: data.ect,
            iat: data.iat,
            map: data.map,
            baro: data.baro,
            tps: data.tps,
            o2: data.o2,
            o2_2: data.o2_2,
            injectionTime: data.injectionTime,
            ignition: data.ignition,
            ignitionLimit: data.ignitionLimit,
            iacv: data.iacv,
            batteryVoltage: data.batteryVoltage,
            alternatorLoad: data.alternatorLoad,
            stft: data.stft,
            ltft: data.ltft,
            timingAdvance: data.timingAdvance,
            dutyCycle: data.dutyCycle,
            flags: {
              vtec: data.vtec,
              checkEngine: data.checkEngine,
              acClutch: data.acClutch,
              closedLoop: data.closedLoop,
            },
          });
        }, 50);

        // Navegar al dashboard
        router.replace('/(tabs)');
      } else {
        setError('No se pudo conectar al dispositivo');
        setSelectedDevice(null);
      }
    } catch (error) {
      console.error('Connection error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error de conexión';
      setError(errorMsg);
      setSelectedDevice(null);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="gap-6">
        {/* Encabezado */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">OBD1 Dashboard</Text>
          <Text className="text-base text-muted">
            Conecta tu módulo Bluetooth HC-05 para comenzar
          </Text>
        </View>

        {/* Botón de escaneo */}
        <TouchableOpacity
          onPress={scanDevices}
          disabled={isScanning || isConnecting}
          className="bg-primary p-4 rounded-lg active:opacity-80"
        >
          <View className="flex-row items-center justify-center gap-2">
            {isScanning && <ActivityIndicator color={colors.background} size="small" />}
            <Text className="text-base font-semibold text-background">
              {isScanning ? 'Escaneando...' : 'Escanear Dispositivos'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Lista de dispositivos */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">
            Dispositivos Disponibles ({devices.length})
          </Text>

          {devices.length === 0 ? (
            <View className="bg-surface p-4 rounded-lg items-center">
              <Text className="text-muted text-center">
                {isScanning
                  ? 'Buscando dispositivos...'
                  : 'No se encontraron dispositivos. Asegúrate de que el HC-05 esté encendido.'}
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={devices}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleConnect(item)}
                  disabled={isConnecting}
                  className={`p-4 rounded-lg mb-2 flex-row justify-between items-center ${
                    selectedDevice?.id === item.id
                      ? 'bg-primary'
                      : 'bg-surface border border-border'
                  }`}
                >
                  <View className="flex-1 gap-1">
                    <Text
                      className={`font-semibold ${
                        selectedDevice?.id === item.id
                          ? 'text-background'
                          : 'text-foreground'
                      }`}
                    >
                      {item.name}
                    </Text>
                    <Text
                      className={`text-xs ${
                        selectedDevice?.id === item.id
                          ? 'text-background opacity-70'
                          : 'text-muted'
                      }`}
                    >
                      {item.id}
                    </Text>
                  </View>

                  {isConnecting && selectedDevice?.id === item.id ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <Text
                      className={`text-xs font-semibold ${
                        selectedDevice?.id === item.id
                          ? 'text-background'
                          : 'text-muted'
                      }`}
                    >
                      {item.rssi ? `${item.rssi} dBm` : ''}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Información */}
        <View className="bg-surface p-4 rounded-lg gap-2">
          <Text className="text-sm font-semibold text-foreground">Instrucciones:</Text>
          <Text className="text-xs text-muted leading-relaxed">
            1. Asegúrate de que el módulo HC-05 esté emparejado con tu teléfono{'\n'}
            2. Enciende el módulo (LED parpadeante){'\n'}
            3. Toca "Escanear Dispositivos"{'\n'}
            4. Selecciona tu módulo HC-05 de la lista{'\n'}
            5. Espera a que se establezca la conexión
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
