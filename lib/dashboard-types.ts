/**
 * Tipos y estructuras para el sistema de dashboards personalizables
 * Inspirado en TunerView con soporte para drag & drop
 */

export type WidgetType = 'gauge' | 'bar' | 'number' | 'graph' | 'flag' | 'text';
export type ParameterKey = 
  | 'rpm' | 'speed' | 'ect' | 'iat' | 'map' | 'tps' | 'o2' | 'battery'
  | 'injectionTime' | 'ignitionAdvance' | 'dutyCycle' | 'stft' | 'ltft'
  | 'iacv' | 'alternatorLoad' | 'vtec' | 'checkEngine' | 'ac' | 'closedLoop';

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetConfig {
  min?: number;
  max?: number;
  unit?: string;
  color?: string;
  decimals?: number;
  label?: string;
  showLabel?: boolean;
  fontSize?: number;
  backgroundColor?: string;
  borderColor?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export interface Widget {
  id: string;
  type: WidgetType;
  parameter: ParameterKey;
  position: WidgetPosition;
  config: WidgetConfig;
}

export interface DashboardTheme {
  name: string;
  backgroundColor: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  warningColor: string;
  criticalColor: string;
  gridColor?: string;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  theme: DashboardTheme;
  gridSize?: number;
  isEditable: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DashboardPreset {
  id: string;
  name: string;
  description: string;
  layout: DashboardLayout;
}

// Presets preconfigurados
export const RACING_THEME: DashboardTheme = {
  name: 'Racing',
  backgroundColor: '#0a0e27',
  primaryColor: '#ff1744',
  accentColor: '#00bcd4',
  textColor: '#ffffff',
  warningColor: '#ffb300',
  criticalColor: '#ff1744',
  gridColor: '#1a1f3a',
};

export const STREET_THEME: DashboardTheme = {
  name: 'Street',
  backgroundColor: '#1a1a2e',
  primaryColor: '#16213e',
  accentColor: '#0f3460',
  textColor: '#eaeaea',
  warningColor: '#ffa500',
  criticalColor: '#ff4444',
  gridColor: '#2a2a3e',
};

export const TUNING_THEME: DashboardTheme = {
  name: 'Tuning',
  backgroundColor: '#0d1117',
  primaryColor: '#1f6feb',
  accentColor: '#58a6ff',
  textColor: '#c9d1d9',
  warningColor: '#d29922',
  criticalColor: '#da3633',
  gridColor: '#1d2128',
};

// Parámetros disponibles con sus propiedades
export const PARAMETER_INFO: Record<ParameterKey, {
  label: string;
  unit: string;
  min: number;
  max: number;
  decimals: number;
}> = {
  rpm: { label: 'RPM', unit: 'rpm', min: 0, max: 8000, decimals: 0 },
  speed: { label: 'Velocidad', unit: 'km/h', min: 0, max: 200, decimals: 0 },
  ect: { label: 'ECT', unit: '°C', min: -40, max: 120, decimals: 1 },
  iat: { label: 'IAT', unit: '°C', min: -40, max: 80, decimals: 1 },
  map: { label: 'MAP', unit: 'kPa', min: 0, max: 255, decimals: 1 },
  tps: { label: 'TPS', unit: '%', min: 0, max: 100, decimals: 1 },
  o2: { label: 'O2', unit: 'V', min: 0, max: 1, decimals: 2 },
  battery: { label: 'Batería', unit: 'V', min: 0, max: 16, decimals: 2 },
  injectionTime: { label: 'Inyección', unit: 'ms', min: 0, max: 100, decimals: 2 },
  ignitionAdvance: { label: 'Avance', unit: '°', min: -20, max: 40, decimals: 1 },
  dutyCycle: { label: 'Duty Cycle', unit: '%', min: 0, max: 100, decimals: 1 },
  stft: { label: 'STFT', unit: '%', min: -50, max: 50, decimals: 1 },
  ltft: { label: 'LTFT', unit: '%', min: -50, max: 50, decimals: 1 },
  iacv: { label: 'IACV', unit: 'pasos', min: 0, max: 255, decimals: 0 },
  alternatorLoad: { label: 'Alternador', unit: '%', min: 0, max: 100, decimals: 1 },
  vtec: { label: 'VTEC', unit: '', min: 0, max: 1, decimals: 0 },
  checkEngine: { label: 'Check Engine', unit: '', min: 0, max: 1, decimals: 0 },
  ac: { label: 'A/C', unit: '', min: 0, max: 1, decimals: 0 },
  closedLoop: { label: 'Closed Loop', unit: '', min: 0, max: 1, decimals: 0 },
};
