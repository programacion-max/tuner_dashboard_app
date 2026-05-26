import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export interface OBD1Data {
  // Stream continuo QD3
  rpm: number;
  vss: number; // velocidad km/h
  ect: number; // Temperatura motor °C
  iat: number; // Temperatura aire °C
  map: number; // Presión múltiple kPa
  tps: number; // Posición acelerador %
  o2: number; // Sensor O2 V
  batteryVoltage: number; // V
  injectionTime: number; // ms
  ignitionAdvance: number; // grados
  dutyCycle: number; // %

  // Flags
  flags: {
    vtec: boolean;
    checkEngine: boolean;
    acClutch: boolean;
    closedLoop: boolean;
  };

  timestamp: number; // ms desde epoch
}

export interface OBD1ContextType {
  data: OBD1Data | null;
  isConnected: boolean;
  isReading: boolean;
  error: string | null;
  updateData: (newData: Partial<OBD1Data>) => void;
  setConnected: (connected: boolean) => void;
  setReading: (reading: boolean) => void;
  setError: (error: string | null) => void;
  getHistory: () => OBD1Data[];
  clearHistory: () => void;
}

const defaultData: OBD1Data = {
  rpm: 0,
  vss: 0,
  ect: 0,
  iat: 0,
  map: 0,
  tps: 0,
  o2: 0,
  batteryVoltage: 0,
  injectionTime: 0,
  ignitionAdvance: 0,
  dutyCycle: 0,
  flags: { vtec: false, checkEngine: false, acClutch: false, closedLoop: false },
  timestamp: Date.now(),
};

const OBD1Context = createContext<OBD1ContextType | undefined>(undefined);

export function OBD1Provider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OBD1Data>(defaultData);
  const [isConnected, setConnected] = useState(false);
  const [isReading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<OBD1Data[]>([]);

  // Configurar callbacks del Bluetooth Service
  useEffect(() => {
    try {
      const { bluetoothService } = require('./bluetooth-service');

      // Callback cuando llega un frame del parser
      bluetoothService.onFrameReceived = (frame: any) => {
        const newData: Partial<OBD1Data> = {
          rpm: frame.rpm || 0,
          vss: frame.vss || 0,
          ect: frame.ect || 0,
          iat: frame.iat || 0,
          map: frame.map || 0,
          tps: frame.tps || 0,
          o2: frame.o2 || 0,
          batteryVoltage: frame.batteryVoltage || 0,
          injectionTime: frame.injectionTime || 0,
          ignitionAdvance: frame.ignitionAdvance || 0,
          dutyCycle: frame.dutyCycle || 0,
          flags: {
            vtec: frame.vtec || false,
            checkEngine: frame.checkEngine || false,
            acClutch: frame.acClutch || false,
            closedLoop: frame.closedLoop || false,
          },
        };
        updateData(newData);
        setReading(true);
      };

      // Callback de cambio de conexión
      bluetoothService.onConnectionChange = (connected: boolean) => {
        setConnected(connected);
        if (!connected) {
          setReading(false);
        }
      };

      // Callback de errores
      bluetoothService.onError = (errorMsg: string) => {
        setError(errorMsg);
      };

      return () => {
        // Cleanup
        bluetoothService.onFrameReceived = () => {};
        bluetoothService.onConnectionChange = () => {};
        bluetoothService.onError = () => {};
      };
    } catch (err) {
      console.warn('Failed to setup Bluetooth callbacks:', err);
    }
  }, []);

  const updateData = useCallback((newData: Partial<OBD1Data>) => {
    setData((prev) => {
      const updated = { ...prev, ...newData, timestamp: Date.now() };

      // Guardar en historial (máximo 3000 puntos = 150 segundos a 20Hz)
      historyRef.current.push(updated);
      if (historyRef.current.length > 3000) {
        historyRef.current.shift();
      }

      return updated;
    });
  }, []);

  const getHistory = useCallback(() => {
    return historyRef.current;
  }, []);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
  }, []);

  const value: OBD1ContextType = {
    data,
    isConnected,
    isReading,
    error,
    updateData,
    setConnected,
    setReading,
    setError,
    getHistory,
    clearHistory,
  };

  return <OBD1Context.Provider value={value}>{children}</OBD1Context.Provider>;
}

export function useOBD1() {
  const context = useContext(OBD1Context);
  if (!context) {
    throw new Error('useOBD1 must be used within OBD1Provider');
  }
  return context;
}
