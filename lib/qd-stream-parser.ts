/**
 * QD Stream Parser - Parser genérico para stream continuo de Honda CROME/QD3
 * Detecta frames automáticamente sin necesidad de comandos request-response
 */

export interface QDFrame {
  raw: number[];
  rpm: number;
  vss: number; // velocidad
  ect: number; // temperatura motor
  iat: number; // temperatura aire
  map: number; // presión absoluta
  tps: number; // posición acelerador
  o2: number; // sensor oxígeno
  batteryVoltage: number;
  injectionTime: number;
  ignitionAdvance: number;
  dutyCycle: number;
  vtec: boolean;
  checkEngine: boolean;
  acClutch: boolean;
  closedLoop: boolean;
  timestamp: number;
}

export class QDStreamParser {
  private buffer: number[] = [];
  private frame: number[] = [];
  private frameStartIndex = 0;
  private lastFrameTime = 0;

  onFrame: (data: QDFrame) => void = () => {};
  onError: (error: string) => void = () => {};

  /**
   * Agregar datos al buffer del parser
   */
  push(data: Uint8Array | number[]): void {
    for (let i = 0; i < data.length; i++) {
      this.buffer.push(data[i]);
    }
    this.process();
  }

  /**
   * Procesar buffer buscando frames válidos
   */
  private process(): void {
    while (this.buffer.length > 0) {
      const byte = this.buffer[0];

      // 🔥 HEURÍSTICA: inicio de frame típico Honda/CROME (0x80 o 0x68)
      if (byte === 0x80 || byte === 0x68) {
        // Si ya tenemos un frame incompleto, descartarlo
        if (this.frame.length > 0 && this.frame.length < 16) {
          this.frame = [];
        }

        this.frame = [this.buffer.shift()!];
        this.frameStartIndex = 0;
        continue;
      }

      if (this.frame.length > 0) {
        this.frame.push(this.buffer.shift()!);

        // 🔥 LONGITUD MÍNIMA de frame típico Honda (8-20 bytes)
        if (this.frame.length >= 8) {
          if (this.tryDecodeFrame(this.frame)) {
            this.frame = [];
          } else if (this.frame.length > 32) {
            // Frame demasiado largo, descartar
            this.frame = [];
          }
        }
      } else {
        // No estamos en un frame, descartar byte
        this.buffer.shift();
      }
    }
  }

  /**
   * Intentar decodificar un frame
   */
  private tryDecodeFrame(frame: number[]): boolean {
    try {
      // Validación básica de checksum (suma simple)
      if (!this.validateFrame(frame)) {
        return false;
      }

      const now = Date.now();
      const data: QDFrame = {
        raw: frame,
        rpm: this.decodeRPM(frame),
        vss: this.decodeVSS(frame),
        ect: this.decodeECT(frame),
        iat: this.decodeIAT(frame),
        map: this.decodeMAP(frame),
        tps: this.decodeTPS(frame),
        o2: this.decodeO2(frame),
        batteryVoltage: this.decodeBatteryVoltage(frame),
        injectionTime: this.decodeInjectionTime(frame),
        ignitionAdvance: this.decodeIgnitionAdvance(frame),
        dutyCycle: this.decodeDutyCycle(frame),
        vtec: this.decodeVTEC(frame),
        checkEngine: this.decodeCheckEngine(frame),
        acClutch: this.decodeACClutch(frame),
        closedLoop: this.decodeClosedLoop(frame),
        timestamp: now,
      };

      // Validar que los valores tengan sentido
      if (this.isValidData(data)) {
        this.onFrame(data);
        this.lastFrameTime = now;
        return true;
      }

      return false;
    } catch (error) {
      this.onError(`Frame decode error: ${error}`);
      return false;
    }
  }

  /**
   * Validar frame con checksum simple
   */
  private validateFrame(frame: number[]): boolean {
    if (frame.length < 8) return false;

    // Checksum típico Honda: suma de bytes
    const dataBytes = frame.slice(0, -1);
    const checksumByte = frame[frame.length - 1];
    const sum = dataBytes.reduce((a, b) => a + b, 0);
    const calculatedChecksum = sum & 0xFF;

    // Permitir margen de error (algunos protocolos varían)
    return Math.abs(calculatedChecksum - checksumByte) <= 2;
  }

  /**
   * Validar que los datos decodificados tengan sentido
   */
  private isValidData(data: QDFrame): boolean {
    // RPM entre 0 y 10000
    if (data.rpm < 0 || data.rpm > 10000) return false;

    // Velocidad entre 0 y 300 km/h
    if (data.vss < 0 || data.vss > 300) return false;

    // ECT entre -40 y 150°C
    if (data.ect < -40 || data.ect > 150) return false;

    // TPS entre 0 y 100%
    if (data.tps < 0 || data.tps > 100) return false;

    // MAP entre 0 y 255 kPa
    if (data.map < 0 || data.map > 255) return false;

    return true;
  }

  /**
   * DECODIFICADORES - Valores típicos Honda CROME QD3
   * Estos son offsets estándar y se pueden ajustar según el ROM específico
   */

  private decodeRPM(frame: number[]): number {
    // Típico: bytes 1-2, factor 0.25 RPM/bit
    if (frame.length < 3) return 0;
    const raw = (frame[1] << 8) | frame[2];
    return raw * 0.25;
  }

  private decodeVSS(frame: number[]): number {
    // Típico: byte 3, factor 1 km/h/bit
    if (frame.length < 4) return 0;
    return frame[3];
  }

  private decodeECT(frame: number[]): number {
    // Típico: byte 4, offset -40°C
    if (frame.length < 5) return 0;
    return frame[4] - 40;
  }

  private decodeIAT(frame: number[]): number {
    // Típico: byte 5, offset -40°C
    if (frame.length < 6) return 0;
    return frame[5] - 40;
  }

  private decodeMAP(frame: number[]): number {
    // Típico: byte 6, factor 1 kPa/bit
    if (frame.length < 7) return 0;
    return frame[6];
  }

  private decodeTPS(frame: number[]): number {
    // Típico: byte 7, factor 0.392% (100/255)
    if (frame.length < 8) return 0;
    return (frame[7] / 255) * 100;
  }

  private decodeO2(frame: number[]): number {
    // Típico: byte 8, factor 0.005V/bit
    if (frame.length < 9) return 0;
    return frame[8] * 0.005;
  }

  private decodeBatteryVoltage(frame: number[]): number {
    // Típico: byte 9, factor 0.1V/bit
    if (frame.length < 10) return 0;
    return frame[9] * 0.1;
  }

  private decodeInjectionTime(frame: number[]): number {
    // Típico: bytes 10-11, factor 0.01ms/bit
    if (frame.length < 12) return 0;
    const raw = (frame[10] << 8) | frame[11];
    return raw * 0.01;
  }

  private decodeIgnitionAdvance(frame: number[]): number {
    // Típico: byte 12, offset -64°, factor 0.5°/bit
    if (frame.length < 13) return 0;
    return (frame[12] - 24) * 0.5 - 64;
  }

  private decodeDutyCycle(frame: number[]): number {
    // Típico: byte 13, factor 0.392% (100/255)
    if (frame.length < 14) return 0;
    return (frame[13] / 255) * 100;
  }

  private decodeVTEC(frame: number[]): boolean {
    // Típico: bit 0 del byte 14
    if (frame.length < 15) return false;
    return (frame[14] & 0x01) !== 0;
  }

  private decodeCheckEngine(frame: number[]): boolean {
    // Típico: bit 1 del byte 14
    if (frame.length < 15) return false;
    return (frame[14] & 0x02) !== 0;
  }

  private decodeACClutch(frame: number[]): boolean {
    // Típico: bit 2 del byte 14
    if (frame.length < 15) return false;
    return (frame[14] & 0x04) !== 0;
  }

  private decodeClosedLoop(frame: number[]): boolean {
    // Típico: bit 3 del byte 14
    if (frame.length < 15) return false;
    return (frame[14] & 0x08) !== 0;
  }

  /**
   * Obtener estadísticas del parser
   */
  getStats(): {
    bufferSize: number;
    frameSize: number;
    lastFrameTime: number;
  } {
    return {
      bufferSize: this.buffer.length,
      frameSize: this.frame.length,
      lastFrameTime: this.lastFrameTime,
    };
  }

  /**
   * Reset del parser
   */
  reset(): void {
    this.buffer = [];
    this.frame = [];
    this.frameStartIndex = 0;
    this.lastFrameTime = 0;
  }
}
