/**
 * Servicio de persistencia para dashboards personalizables
 * Almacena y recupera configuraciones en AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DashboardLayout, DashboardPreset } from './dashboard-types';

const DASHBOARDS_KEY = 'obd1_dashboards';
const PRESETS_KEY = 'obd1_presets';
const ACTIVE_DASHBOARD_KEY = 'obd1_active_dashboard';

export class DashboardStorage {
  /**
   * Guardar un dashboard personalizado
   */
  static async saveDashboard(dashboard: DashboardLayout): Promise<void> {
    try {
      const dashboards = await this.getAllDashboards();
      const index = dashboards.findIndex(d => d.id === dashboard.id);
      
      if (index >= 0) {
        dashboards[index] = dashboard;
      } else {
        dashboards.push(dashboard);
      }
      
      await AsyncStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
    } catch (error) {
      console.error('Error saving dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los dashboards personalizados
   */
  static async getAllDashboards(): Promise<DashboardLayout[]> {
    try {
      const data = await AsyncStorage.getItem(DASHBOARDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting dashboards:', error);
      return [];
    }
  }

  /**
   * Obtener un dashboard por ID
   */
  static async getDashboard(id: string): Promise<DashboardLayout | null> {
    try {
      const dashboards = await this.getAllDashboards();
      return dashboards.find(d => d.id === id) || null;
    } catch (error) {
      console.error('Error getting dashboard:', error);
      return null;
    }
  }

  /**
   * Eliminar un dashboard
   */
  static async deleteDashboard(id: string): Promise<void> {
    try {
      const dashboards = await this.getAllDashboards();
      const filtered = dashboards.filter(d => d.id !== id);
      await AsyncStorage.setItem(DASHBOARDS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      throw error;
    }
  }

  /**
   * Guardar dashboard activo
   */
  static async setActiveDashboard(id: string): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_DASHBOARD_KEY, id);
    } catch (error) {
      console.error('Error setting active dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtener ID del dashboard activo
   */
  static async getActiveDashboard(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACTIVE_DASHBOARD_KEY);
    } catch (error) {
      console.error('Error getting active dashboard:', error);
      return null;
    }
  }

  /**
   * Exportar dashboard como JSON
   */
  static async exportDashboard(id: string): Promise<string> {
    try {
      const dashboard = await this.getDashboard(id);
      if (!dashboard) throw new Error('Dashboard not found');
      return JSON.stringify(dashboard, null, 2);
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      throw error;
    }
  }

  /**
   * Importar dashboard desde JSON
   */
  static async importDashboard(jsonString: string): Promise<DashboardLayout> {
    try {
      const dashboard = JSON.parse(jsonString) as DashboardLayout;
      dashboard.id = `imported_${Date.now()}`;
      dashboard.createdAt = Date.now();
      dashboard.updatedAt = Date.now();
      await this.saveDashboard(dashboard);
      return dashboard;
    } catch (error) {
      console.error('Error importing dashboard:', error);
      throw error;
    }
  }

  /**
   * Limpiar todos los dashboards
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        DASHBOARDS_KEY,
        PRESETS_KEY,
        ACTIVE_DASHBOARD_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}
