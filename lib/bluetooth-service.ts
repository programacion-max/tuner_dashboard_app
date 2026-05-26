/**
 * Servicio de comunicación Bluetooth para stream continuo QD3
 * Usa QDStreamParser para detectar frames automáticamente
 */

import { BleManager, Device } from 'react-native-ble-plx';
import { Platform } from 'react-native';
import { QDStreamParser, QDFrame } from './qd-stream-parser';

// Polyfill para Buffer en React Native
if (typeof global.Buffer === 'undefined') {
  try {
    global.Buffer = require('buffer').Buffer;
  } catch (e) {
    console.warn('Buffer polyfill failed:', e);
  }
}

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
}

class BluetoothService {
  private manager: BleManager | null = null;
  private device: Device | null = null;
  private characteristic: any | null = null;
  private isScanning = false;
  private isConnected = false;
  private readSubscription: any = null;
  private parser: QDStreamParser | null = null;

  onFrameReceived: (frame: QDFrame) => void = () => {};
  onConnectionChange: (connected: boolean) => void = () => {};
  onError: (error: string) => void = () => {};

  constructor() {
    // Lazy initialization - solo en Android/iOS, no en web
    if (Platform.OS !== 'web') {
      try {
        this.manager = new BleManager();
        this.parser = new QDStreamParser();

        // Configurar callbacks del parser
        this.parser.onFrame = (frame) => {
          this.onFrameReceived(frame);
        };

        this.parser.onError = (error) => {
          console.warn('Parser error:', error);
        };
      } catch (error) {
        console.warn('BluetoothService initialization failed:', error);
        this.manager = null;
        this.parser = null;
      }
    }
  }

  private getManager(): BleManager {
    if (!this.manager) {
      if (Platform.OS === 'web') {
        throw new Error('Bluetooth is not supported on web');
      }
      try {
        this.manager = new BleManager();
      } catch (error) {
        throw new Error(`Failed to initialize BleManager: ${error}`);
      }
    }
    return this.manager;
  }

  private getParser(): QDStreamParser {
    if (!this.parser) {
      this.parser = new QDStreamParser();
      this.parser.onFrame = (frame) => {
        this.onFrameReceived(frame);
      };
    }
    return this.parser;
  }

  /**
   * Escanear dispositivos Bluetooth disponibles
   */
  async scanDevices(duration: number = 5000): Promise<BluetoothDevice[]> {
    return new Promise((resolve, reject) => {
      try {
        const manager = this.getManager();
        const devices: Map<string, BluetoothDevice> = new Map();
        this.isScanning = true;

        manager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            console.error('Scan error:', error);
            this.isScanning = false;
            try {
              manager.stopDeviceScan();
            } catch (e) {
              console.warn('Error stopping scan:', e);
            }
            reject(new Error(`Bluetooth scan failed: ${error.message}`));
            return;
          }

          if (device && device.name) {
            devices.set(device.id, {
              id: device.id,
              name: device.name,
              rssi: device.rssi ?? undefined,
            });
          }
        });

        setTimeout(() => {
          try {
            manager.stopDeviceScan();
          } catch (e) {
            console.warn('Error stopping scan:', e);
          }
          this.isScanning = false;
          resolve(Array.from(devices.values()));
        }, duration);
      } catch (error) {
        this.isScanning = false;
        reject(error);
      }
    });
  }

  /**
   * Conectar a dispositivo Bluetooth
   */
  async connect(deviceId: string): Promise<boolean> {
    try {
      if (!deviceId) {
        throw new Error('Device ID is required');
      }

      const manager = this.getManager();
      this.device = await manager.connectToDevice(deviceId);

      if (!this.device) {
        throw new Error('Failed to connect to device');
      }

      // Descubrir servicios y características
      await this.device.discoverAllServicesAndCharacteristics();

      // Buscar característica de lectura (SPP típicamente)
      const services = await this.device.services();
      if (!services || services.length === 0) {
        throw new Error('No services found on device');
      }

      let foundCharacteristic = false;

      for (const service of services) {
        const characteristics = await service.characteristics();
        for (const char of characteristics) {
          const charAny = char as any;

          // Buscar características que permitan lectura
          if (charAny.isReadable || charAny.isNotifiable) {
            this.characteristic = char;
            foundCharacteristic = true;
            console.log(
              `Found readable characteristic: ${char.uuid} in service ${service.uuid}`
            );
            break;
          }
        }
        if (foundCharacteristic) break;
      }

      if (!this.characteristic) {
        throw new Error('No readable characteristic found');
      }

      // Iniciar lectura continua
      await this.startContinuousRead();

      this.isConnected = true;
      this.onConnectionChange(true);

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      this.isConnected = false;
      this.onConnectionChange(false);
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.onError(errorMsg);
      throw error;
    }
  }

  /**
   * Iniciar lectura continua de stream
   */
  private async startContinuousRead(): Promise<void> {
    if (!this.characteristic || !this.device) {
      throw new Error('Device or characteristic not initialized');
    }

    try {
      const parser = this.getParser();

      // Suscribirse a notificaciones (push de datos)
      this.readSubscription = this.characteristic.monitor(
        (error: any, characteristic: any) => {
          if (error) {
            console.error('Monitor error:', error);
            this.onError(`Read error: ${error.message}`);
            this.disconnect();
            return;
          }

          if (characteristic && characteristic.value) {
            try {
              // Decodificar base64 a bytes
              const base64Data = characteristic.value;
              const bytes = this.base64ToBytes(base64Data);

              // Enviar al parser
              parser.push(bytes);
            } catch (parseError) {
              console.warn('Parse error:', parseError);
            }
          }
        }
      );

      console.log('Continuous read started');
    } catch (error) {
      console.error('Failed to start continuous read:', error);
      throw error;
    }
  }

  /**
   * Convertir base64 a array de bytes
   */
  private base64ToBytes(base64: string): number[] {
    try {
      const binaryString = atob(base64);
      const bytes: number[] = [];
      for (let i = 0; i < binaryString.length; i++) {
        bytes.push(binaryString.charCodeAt(i));
      }
      return bytes;
    } catch (error) {
      console.error('Base64 decode error:', error);
      return [];
    }
  }

  /**
   * Desconectar del dispositivo
   */
  async disconnect(): Promise<void> {
    try {
      if (this.readSubscription) {
        this.readSubscription.remove();
        this.readSubscription = null;
      }

      if (this.device) {
        await this.device.cancelConnection();
        this.device = null;
      }

      this.characteristic = null;
      this.isConnected = false;
      this.onConnectionChange(false);

      if (this.parser) {
        this.parser.reset();
      }

      console.log('Disconnected from device');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  /**
   * Obtener estado de conexión
   */
  getConnectionStatus(): {
    isConnected: boolean;
    device: string | null;
    parserStats: any;
  } {
    return {
      isConnected: this.isConnected,
      device: this.device?.name || null,
      parserStats: this.parser?.getStats() || null,
    };
  }

  /**
   * Verificar si está conectado
   */
  isDeviceConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton
export const bluetoothService = new BluetoothService();
