/**
 * Gestor de historial de datos OBD1 para gráficas en tiempo real
 * Mantiene un buffer circular de datos de los últimos 60 segundos
 */

export interface DataPoint {
  timestamp: number;
  rpm: number;
  speed: number;
  ect: number;
  iat: number;
  map: number;
  tps: number;
  o2: number;
  battery: number;
  injectionTime: number;
  ignitionAdvance: number;
  dutyCycle: number;
  stft: number;
  ltft: number;
  iacv: number;
  alternatorLoad: number;
}

export class OBD1DataHistory {
  private history: DataPoint[] = [];
  private maxSize: number = 150; // 150 puntos * 50ms = 7.5 segundos
  private lastCleanup: number = Date.now();

  /**
   * Agregar un nuevo punto de datos
   */
  addDataPoint(data: Partial<DataPoint>): void {
    const point: DataPoint = {
      timestamp: Date.now(),
      rpm: data.rpm || 0,
      speed: data.speed || 0,
      ect: data.ect || 0,
      iat: data.iat || 0,
      map: data.map || 0,
      tps: data.tps || 0,
      o2: data.o2 || 0,
      battery: data.battery || 0,
      injectionTime: data.injectionTime || 0,
      ignitionAdvance: data.ignitionAdvance || 0,
      dutyCycle: data.dutyCycle || 0,
      stft: data.stft || 0,
      ltft: data.ltft || 0,
      iacv: data.iacv || 0,
      alternatorLoad: data.alternatorLoad || 0,
    };

    this.history.push(point);

    // Mantener tamaño máximo
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }

    // Limpiar datos antiguos cada 10 segundos
    const now = Date.now();
    if (now - this.lastCleanup > 10000) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  /**
   * Obtener historial de un parámetro específico
   */
  getParameterHistory(parameter: keyof DataPoint, maxPoints: number = 60): number[] {
    if (parameter === 'timestamp') return [];

    const filtered = this.history.slice(-maxPoints);
    return filtered.map(point => point[parameter] as number);
  }

  /**
   * Obtener todos los puntos de datos
   */
  getAllHistory(): DataPoint[] {
    return [...this.history];
  }

  /**
   * Obtener el último punto de datos
   */
  getLatest(): DataPoint | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  /**
   * Limpiar datos más antiguos que 60 segundos
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - 60000; // 60 segundos atrás

    this.history = this.history.filter(point => point.timestamp > cutoff);
  }

  /**
   * Limpiar todo el historial
   */
  clear(): void {
    this.history = [];
  }

  /**
   * Obtener estadísticas de un parámetro
   */
  getStats(parameter: keyof DataPoint): {
    min: number;
    max: number;
    avg: number;
    current: number;
  } | null {
    if (parameter === 'timestamp' || this.history.length === 0) return null;

    const values = this.history.map(point => point[parameter] as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b) / values.length;
    const current = values[values.length - 1];

    return { min, max, avg, current };
  }

  /**
   * Obtener tamaño del historial
   */
  getSize(): number {
    return this.history.length;
  }
}

// Instancia global
export const obd1DataHistory = new OBD1DataHistory();
