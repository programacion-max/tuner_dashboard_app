import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Platform } from 'react-native';

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

const BAUD_RATE = 38400;
const INIT_SEQUENCE = [0x68, 0x6a, 0xf5, 0xaf, 0xbf, 0xb3, 0xb2, 0xc1, 0xdb, 0xb3, 0xe9];
const INIT_DELAY = 300; // ms

// Comandos de lectura de bloques
const BLOCK_COMMANDS = {
  block1: [0x20, 0x05, 0x00, 0x10, 0xcb], // Offset 0x00, 16 bytes
  block2: [0x20, 0x05, 0x10, 0x10, 0xbb], // Offset 0x10, 16 bytes
  block3: [0x20, 0x05, 0x20, 0x10, 0xab], // Offset 0x20, 16 bytes
};

export interface QD3Data {
  // Bloque 1
  rpm: number;
  vss: number;
  vtec: boolean;
  checkEngine: boolean;
  acClutch: boolean;
  closedLoop: boolean;

  // Bloque 2
  ect: number;
  iat: number;
  map: number;
  baro: number;
  tps: number;
  o2: number;
  o2_2: number;
  injectionTime: number;
  ignition: number;
  ignitionLimit: number;
  iacv: number;
  batteryVoltage: number;
  alternatorLoad: number;

  // Bloque 3
  stft: number;
  ltft: number;
  timingAdvance: number;
  
  // Calculados
  dutyCycle: number;
}

class BluetoothService {
  private manager: BleManager | null = null;
  private device: Device | null = null;
  private characteristic: any | null = null;
  private isScanning = false;
  private readInterval: any = null;

  constructor() {
    // Lazy initialization - solo en Android/iOS, no en web
    if (Platform.OS !== 'web') {
      try {
        this.manager = new BleManager();
      } catch (error) {
        console.warn('BleManager initialization failed:', error);
        this.manager = null;
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

  // Convertir array de números a Buffer
  private numbersToBuffer(numbers: number[]): Buffer {
    return Buffer.from(numbers);
  }

  // Convertir Buffer a array de números
  private bufferToNumbers(buffer: any): number[] {
    if (typeof buffer === 'string') {
      return buffer.split('').map((c) => c.charCodeAt(0));
    }
    return Array.from(buffer);
  }

  // Calcular CRC del protocolo QD3
  private calculateCRC(data: number[]): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((a, b) => a + b, 0);
    return 0xff - ((sum - 1) & 0xff);
  }

  // Parsear respuesta del protocolo QD3
  private parseQD3Response(data: number[]): number[] {
    if (data.length < 7) return [];
    
    // Estructura: [CMD_ECHO, NUM_ECHO, LOC_ECHO, LEN_ECHO, CRC_ECHO, RESP_LEN_HI, RESP_LEN_LO, DATA..., CRC_HI, CRC_LO]
    const respLen = (data[5] << 8) | data[6];
    const dataStart = 7;
    const dataEnd = dataStart + respLen;
    
    if (data.length < dataEnd + 2) return [];
    
    return data.slice(dataStart, dataEnd);
  }

  // Convertir temperatura usando fórmula polinómica
  private convertTemperature(value: number): number {
    const v = value;
    const v2 = v * v;
    const v3 = v2 * v;
    const v4 = v3 * v;
    const v5 = v4 * v;

    return (
      155.04149 -
      v * 3.0414878 +
      v2 * 0.03952185 -
      v3 * 0.00029383913 +
      v4 * 0.0000010792568 -
      v5 * 0.0000000015618437
    );
  }

  // Parsear datos del Bloque 1 (RPM, VSS, Flags)
  private parseBlock1(data: number[]): Partial<QD3Data> {
    if (data.length < 16) return {};

    const rpmHigh = data[0];
    const rpmLow = data[1];
    const rpmRaw = (rpmHigh << 8) | rpmLow;
    const rpm = rpmRaw > 0 ? Math.round(1875000 / (rpmRaw + 1)) : 0;

    const vss = data[2];

    // Flags (simplificado - se pueden expandir según necesidad)
    const flagWord2 = data[4];
    const flagWord3 = data[5];
    const flagWord7 = data[10];

    return {
      rpm: Math.max(0, rpm),
      vss,
      vtec: !!(flagWord3 & 0x01),
      checkEngine: !!(flagWord2 & 0x20),
      acClutch: !!(flagWord3 & 0x04),
      closedLoop: !!(flagWord7 & 0x01),
    };
  }

  // Parsear datos del Bloque 2 (Sensores)
  private parseBlock2(data: number[]): Partial<QD3Data> {
    if (data.length < 16) return {};

    const ect = this.convertTemperature(data[0]);
    const iat = this.convertTemperature(data[1]);
    const map = data[2] * 0.716 - 5.0;
    const baro = data[3] * 0.716 - 5.0;
    const tps = (data[4] - 24) / 2;
    const o2 = data[5] / 51.3;
    const o2_2 = data[6] / 51.3;

    const injHigh = data[7];
    const injLow = data[8];
    const injectionTime = ((injHigh << 8) | injLow) / 250.0;

    const ignition = (data[9] - 128) / 2.0;
    const ignitionLimit = (data[10] - 24) / 4.0;
    const iacv = data[11] / 2.55;
    const batteryVoltage = data[14] / 10.45;
    const alternatorLoad = data[15] / 2.55;

    return {
      ect: Math.round(ect * 10) / 10,
      iat: Math.round(iat * 10) / 10,
      map: Math.round(map * 10) / 10,
      baro: Math.round(baro * 10) / 10,
      tps: Math.max(0, Math.min(100, Math.round(tps * 10) / 10)),
      o2: Math.round(o2 * 100) / 100,
      o2_2: Math.round(o2_2 * 100) / 100,
      injectionTime: Math.round(injectionTime * 100) / 100,
      ignition: Math.round(ignition * 10) / 10,
      ignitionLimit: Math.round(ignitionLimit * 10) / 10,
      iacv: Math.max(0, Math.min(100, Math.round(iacv * 10) / 10)),
      batteryVoltage: Math.round(batteryVoltage * 100) / 100,
      alternatorLoad: Math.max(0, Math.min(100, Math.round(alternatorLoad * 10) / 10)),
    };
  }

  // Parsear datos del Bloque 3 (Fuel Trim, Timing)
  private parseBlock3(data: number[]): Partial<QD3Data> {
    if (data.length < 3) return {};

    const stft = ((data[0] / 128.0) - 1.0) * 100.0;
    const ltft = ((data[2] / 128.0) - 1.0) * 100.0;
    const timingAdvance = ((data[6] - 24) / 2) - 64;

    return {
      stft: Math.round(stft * 10) / 10,
      ltft: Math.round(ltft * 10) / 10,
      timingAdvance: Math.round(timingAdvance * 10) / 10,
    };
  }

  // Escanear dispositivos Bluetooth
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

  // Conectar a dispositivo
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

      await this.device.discoverAllServicesAndCharacteristics();

      // Buscar característica de escritura/lectura (SPP)
      const services = await this.device.services();
      if (!services || services.length === 0) {
        throw new Error('No services found on device');
      }

      for (const service of services) {
        const characteristics = await service.characteristics();
        for (const char of characteristics) {
          const charAny = char as any;
          if (charAny.isWritableWithoutResponse || charAny.isWritable || charAny.isNotifiable) {
            this.characteristic = char as any;
            break;
          }
        }
        if (this.characteristic) break;
      }

      if (!this.characteristic) {
        throw new Error('No suitable characteristic found for read/write');
      }

      // Enviar secuencia de inicialización
      await this.sendInitSequence();
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      this.device = null;
      this.characteristic = null;
      return false;
    }
  }

  // Enviar secuencia de inicialización
  private async sendInitSequence(): Promise<void> {
    if (!this.characteristic) return;

    const initBuffer = this.numbersToBuffer(INIT_SEQUENCE);
    await this.characteristic.write(initBuffer);
    
    // Esperar tiempo de inicialización
    await new Promise((resolve) => setTimeout(resolve, INIT_DELAY));
  }

  // Leer datos del protocolo QD3
  async readQD3Data(): Promise<QD3Data | null> {
    if (!this.characteristic) return null;

    try {
      const results: any = {};

      // Leer Bloque 1
      const block1Cmd = this.numbersToBuffer(BLOCK_COMMANDS.block1);
      await this.characteristic.write(block1Cmd);
      await new Promise((resolve) => setTimeout(resolve, 50));
      let response = await this.characteristic.read();
      let data = this.bufferToNumbers(response.value as any);
      let parsed = this.parseQD3Response(data);
      Object.assign(results, this.parseBlock1(parsed));

      // Leer Bloque 2
      const block2Cmd = this.numbersToBuffer(BLOCK_COMMANDS.block2);
      await this.characteristic.write(block2Cmd);
      await new Promise((resolve) => setTimeout(resolve, 50));
      response = await this.characteristic.read();
      data = this.bufferToNumbers(response.value as any);
      parsed = this.parseQD3Response(data);
      Object.assign(results, this.parseBlock2(parsed));

      // Leer Bloque 3
      const block3Cmd = this.numbersToBuffer(BLOCK_COMMANDS.block3);
      await this.characteristic.write(block3Cmd);
      await new Promise((resolve) => setTimeout(resolve, 50));
      response = await this.characteristic.read();
      data = this.bufferToNumbers(response.value as any);
      parsed = this.parseQD3Response(data);
      Object.assign(results, this.parseBlock3(parsed));

      // Calcular Duty Cycle
      const rpm = results.rpm || 0;
      const injTime = results.injectionTime || 0;
      const dutyCycle = rpm > 0 ? (rpm * injTime) / 1200 : 0;
      results.dutyCycle = Math.min(100, Math.round(dutyCycle * 10) / 10);

      return results as QD3Data;
    } catch (error) {
      console.error('Read error:', error);
      return null;
    }
  }

  // Iniciar lectura continua
  startContinuousRead(
    callback: (data: QD3Data) => void,
    interval: number = 50
  ): void {
    this.stopContinuousRead();

    this.readInterval = setInterval(async () => {
      try {
        const data = await this.readQD3Data();
        if (data) {
          callback(data);
        }
      } catch (error) {
        console.error('Continuous read error:', error);
      }
    }, interval) as any;
  }

  // Detener lectura continua
  stopContinuousRead(): void {
    if (this.readInterval) {
      clearInterval(this.readInterval);
      this.readInterval = null;
    }
  }

  // Desconectar
  async disconnect(): Promise<void> {
    this.stopContinuousRead();
    if (this.device) {
      try {
        await this.device.cancelConnection();
      } catch (error) {
        console.error('Disconnect error:', error);
      }
      this.device = null;
      this.characteristic = null;
    }
  }

  // Obtener estado de conexión
  isConnected(): boolean {
    return this.device !== null;
  }
}

export const bluetoothService = new BluetoothService();
