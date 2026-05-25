import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export interface OBD1Data {
  // Bloque 1 (0x00-0x0F)
  rpm: number;
  vss: number;
  flags: {
    vtec: boolean;
    checkEngine: boolean;
    acClutch: boolean;
    closedLoop: boolean;
  };

  // Bloque 2 (0x10-0x1F)
  ect: number; // Temperatura motor °C
  iat: number; // Temperatura aire °C
  map: number; // Presión múltiple kPa
  baro: number; // Presión atmosférica kPa
  tps: number; // Posición acelerador %
  o2: number; // Sensor O2 V
  o2_2: number; // Sensor O2 2 V
  injectionTime: number; // ms
  ignition: number; // grados
  ignitionLimit: number; // grados
  iacv: number; // Válvula ralentí %
  batteryVoltage: number; // V
  alternatorLoad: number; // %

  // Bloque 3 (0x20-0x2F)
  stft: number; // Short Term Fuel Trim %
  ltft: number; // Long Term Fuel Trim %
  timingAdvance: number; // grados

  // Datos calculados
  dutyCycle: number; // %
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
  flags: { vtec: false, checkEngine: false, acClutch: false, closedLoop: false },
  ect: 0,
  iat: 0,
  map: 0,
  baro: 0,
  tps: 0,
  o2: 0,
  o2_2: 0,
  injectionTime: 0,
  ignition: 0,
  ignitionLimit: 0,
  iacv: 0,
  batteryVoltage: 0,
  alternatorLoad: 0,
  stft: 0,
  ltft: 0,
  timingAdvance: 0,
  dutyCycle: 0,
  timestamp: Date.now(),
};

const OBD1Context = createContext<OBD1ContextType | undefined>(undefined);

export function OBD1Provider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OBD1Data>(defaultData);
  const [isConnected, setConnected] = useState(false);
  const [isReading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<OBD1Data[]>([]);

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
