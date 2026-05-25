/**
 * Contexto para gestionar dashboards personalizables
 * Maneja carga, guardado y cambio de dashboards
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DashboardLayout, DashboardPreset, RACING_THEME, STREET_THEME, TUNING_THEME } from './dashboard-types';
import { DashboardStorage } from './dashboard-storage';

interface DashboardContextType {
  dashboards: DashboardLayout[];
  activeDashboard: DashboardLayout | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  loadDashboards: () => Promise<void>;
  setActiveDashboard: (id: string) => Promise<void>;
  saveDashboard: (dashboard: DashboardLayout) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  createDashboard: (name: string, theme: any) => Promise<DashboardLayout>;
  duplicateDashboard: (id: string) => Promise<DashboardLayout>;
  exportDashboard: (id: string) => Promise<string>;
  importDashboard: (jsonString: string) => Promise<DashboardLayout>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Dashboards preconfigurados
const PRESET_DASHBOARDS: DashboardPreset[] = [
  {
    id: 'racing',
    name: 'Racing',
    description: 'Dashboard optimizado para pista con RPM prominente',
    layout: {
      id: 'racing',
      name: 'Racing',
      description: 'Dashboard optimizado para pista',
      widgets: [
        {
          id: 'rpm-gauge',
          type: 'gauge',
          parameter: 'rpm',
          position: { x: 0, y: 0, width: 200, height: 200 },
          config: { label: 'RPM', showLabel: true, warningThreshold: 7000, criticalThreshold: 8000 },
        },
        {
          id: 'speed-gauge',
          type: 'gauge',
          parameter: 'speed',
          position: { x: 200, y: 0, width: 160, height: 160 },
          config: { label: 'Velocidad', showLabel: true },
        },
        {
          id: 'map-bar',
          type: 'bar',
          parameter: 'map',
          position: { x: 0, y: 200, width: 180, height: 100 },
          config: { label: 'MAP', warningThreshold: 100 },
        },
        {
          id: 'tps-bar',
          type: 'bar',
          parameter: 'tps',
          position: { x: 180, y: 200, width: 180, height: 100 },
          config: { label: 'TPS' },
        },
        {
          id: 'ect-number',
          type: 'number',
          parameter: 'ect',
          position: { x: 0, y: 300, width: 120, height: 80 },
          config: { label: 'ECT', warningThreshold: 95, criticalThreshold: 110 },
        },
        {
          id: 'vtec-flag',
          type: 'flag',
          parameter: 'vtec',
          position: { x: 120, y: 300, width: 120, height: 80 },
          config: { label: 'VTEC' },
        },
      ],
      theme: RACING_THEME,
      gridSize: 20,
      isEditable: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  {
    id: 'street',
    name: 'Street',
    description: 'Dashboard para conducción en calle',
    layout: {
      id: 'street',
      name: 'Street',
      description: 'Dashboard para conducción en calle',
      widgets: [
        {
          id: 'rpm-gauge',
          type: 'gauge',
          parameter: 'rpm',
          position: { x: 0, y: 0, width: 160, height: 160 },
          config: { label: 'RPM', showLabel: true },
        },
        {
          id: 'speed-gauge',
          type: 'gauge',
          parameter: 'speed',
          position: { x: 160, y: 0, width: 160, height: 160 },
          config: { label: 'Velocidad', showLabel: true },
        },
        {
          id: 'ect-number',
          type: 'number',
          parameter: 'ect',
          position: { x: 0, y: 160, width: 100, height: 80 },
          config: { label: 'ECT' },
        },
        {
          id: 'battery-number',
          type: 'number',
          parameter: 'battery',
          position: { x: 100, y: 160, width: 100, height: 80 },
          config: { label: 'Batería' },
        },
        {
          id: 'o2-bar',
          type: 'bar',
          parameter: 'o2',
          position: { x: 200, y: 160, width: 120, height: 80 },
          config: { label: 'O2' },
        },
      ],
      theme: STREET_THEME,
      gridSize: 20,
      isEditable: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
  {
    id: 'tuning',
    name: 'Tuning',
    description: 'Dashboard con datos de tuning avanzados',
    layout: {
      id: 'tuning',
      name: 'Tuning',
      description: 'Dashboard con datos de tuning avanzados',
      widgets: [
        {
          id: 'rpm-number',
          type: 'number',
          parameter: 'rpm',
          position: { x: 0, y: 0, width: 100, height: 60 },
          config: { label: 'RPM', fontSize: 24 },
        },
        {
          id: 'map-number',
          type: 'number',
          parameter: 'map',
          position: { x: 100, y: 0, width: 100, height: 60 },
          config: { label: 'MAP', fontSize: 24 },
        },
        {
          id: 'ect-number',
          type: 'number',
          parameter: 'ect',
          position: { x: 200, y: 0, width: 100, height: 60 },
          config: { label: 'ECT', fontSize: 24 },
        },
        {
          id: 'stft-bar',
          type: 'bar',
          parameter: 'stft',
          position: { x: 0, y: 60, width: 150, height: 80 },
          config: { label: 'STFT' },
        },
        {
          id: 'ltft-bar',
          type: 'bar',
          parameter: 'ltft',
          position: { x: 150, y: 60, width: 150, height: 80 },
          config: { label: 'LTFT' },
        },
        {
          id: 'duty-cycle-bar',
          type: 'bar',
          parameter: 'dutyCycle',
          position: { x: 0, y: 140, width: 300, height: 80 },
          config: { label: 'Duty Cycle' },
        },
      ],
      theme: TUNING_THEME,
      gridSize: 20,
      isEditable: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
];

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [dashboards, setDashboards] = useState<DashboardLayout[]>([]);
  const [activeDashboard, setActiveDashboardState] = useState<DashboardLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar dashboards al iniciar
  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener dashboards guardados
      const saved = await DashboardStorage.getAllDashboards();
      
      // Si no hay dashboards guardados, usar presets
      if (saved.length === 0) {
        const presets = PRESET_DASHBOARDS.map(p => p.layout);
        setDashboards(presets);
        
        // Establecer Racing como activo por defecto
        const racing = presets.find(d => d.id === 'racing');
        if (racing) {
          setActiveDashboardState(racing);
          await DashboardStorage.setActiveDashboard('racing');
        }
      } else {
        setDashboards(saved);
        
        // Restaurar dashboard activo
        const activeId = await DashboardStorage.getActiveDashboard();
        const active = saved.find(d => d.id === activeId) || saved[0];
        setActiveDashboardState(active);
      }
    } catch (err) {
      console.error('Error loading dashboards:', err);
      setError('Error al cargar dashboards');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setActiveDashboard = useCallback(async (id: string) => {
    try {
      const dashboard = dashboards.find(d => d.id === id);
      if (dashboard) {
        setActiveDashboardState(dashboard);
        await DashboardStorage.setActiveDashboard(id);
      }
    } catch (err) {
      console.error('Error setting active dashboard:', err);
      setError('Error al cambiar dashboard');
    }
  }, [dashboards]);

  const saveDashboard = useCallback(async (dashboard: DashboardLayout) => {
    try {
      dashboard.updatedAt = Date.now();
      await DashboardStorage.saveDashboard(dashboard);
      
      setDashboards(prev => {
        const index = prev.findIndex(d => d.id === dashboard.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = dashboard;
          return updated;
        }
        return [...prev, dashboard];
      });

      if (activeDashboard?.id === dashboard.id) {
        setActiveDashboardState(dashboard);
      }
    } catch (err) {
      console.error('Error saving dashboard:', err);
      setError('Error al guardar dashboard');
    }
  }, [activeDashboard]);

  const deleteDashboard = useCallback(async (id: string) => {
    try {
      await DashboardStorage.deleteDashboard(id);
      setDashboards(prev => prev.filter(d => d.id !== id));
      
      if (activeDashboard?.id === id) {
        const remaining = dashboards.filter(d => d.id !== id);
        if (remaining.length > 0) {
          await setActiveDashboard(remaining[0].id);
        }
      }
    } catch (err) {
      console.error('Error deleting dashboard:', err);
      setError('Error al eliminar dashboard');
    }
  }, [activeDashboard, dashboards, setActiveDashboard]);

  const createDashboard = useCallback(async (name: string, theme: any) => {
    try {
      const newDashboard: DashboardLayout = {
        id: `dashboard_${Date.now()}`,
        name,
        widgets: [],
        theme,
        gridSize: 20,
        isEditable: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await saveDashboard(newDashboard);
      return newDashboard;
    } catch (err) {
      console.error('Error creating dashboard:', err);
      throw err;
    }
  }, [saveDashboard]);

  const duplicateDashboard = useCallback(async (id: string) => {
    try {
      const original = dashboards.find(d => d.id === id);
      if (!original) throw new Error('Dashboard not found');
      
      const duplicate: DashboardLayout = {
        ...original,
        id: `dashboard_${Date.now()}`,
        name: `${original.name} (Copia)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await saveDashboard(duplicate);
      return duplicate;
    } catch (err) {
      console.error('Error duplicating dashboard:', err);
      throw err;
    }
  }, [dashboards, saveDashboard]);

  const exportDashboard = useCallback(async (id: string) => {
    try {
      return await DashboardStorage.exportDashboard(id);
    } catch (err) {
      console.error('Error exporting dashboard:', err);
      throw err;
    }
  }, []);

  const importDashboard = useCallback(async (jsonString: string) => {
    try {
      const imported = await DashboardStorage.importDashboard(jsonString);
      setDashboards(prev => [...prev, imported]);
      return imported;
    } catch (err) {
      console.error('Error importing dashboard:', err);
      throw err;
    }
  }, []);

  const value: DashboardContextType = {
    dashboards,
    activeDashboard,
    isLoading,
    error,
    loadDashboards,
    setActiveDashboard,
    saveDashboard,
    deleteDashboard,
    createDashboard,
    duplicateDashboard,
    exportDashboard,
    importDashboard,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
