/**
 * Editor de Dashboards con Drag & Drop
 * Permite crear y personalizar layouts de dashboards
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Text,
  TextInput,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useDashboard } from '@/lib/dashboard-context';
import {
  DashboardLayout,
  Widget,
  WidgetType,
  ParameterKey,
  PARAMETER_INFO,
  RACING_THEME,
} from '@/lib/dashboard-types';
import { WidgetRenderer } from '@/components/widget-renderer';

export default function DashboardEditor() {
  const router = useRouter();
  const colors = useColors();
  const { activeDashboard, saveDashboard, createDashboard } = useDashboard();

  const [dashboard, setDashboard] = useState<DashboardLayout | null>(
    activeDashboard
  );
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dashboardName, setDashboardName] = useState(dashboard?.name || '');

  const gridSize = dashboard?.gridSize || 20;

  // Widgets disponibles para agregar
  const availableWidgets: Array<{
    type: WidgetType;
    label: string;
    description: string;
  }> = [
    { type: 'gauge', label: 'Gauge', description: 'Medidor circular' },
    { type: 'bar', label: 'Barra', description: 'Barra de progreso' },
    { type: 'number', label: 'Número', description: 'Valor numérico grande' },
    { type: 'flag', label: 'Indicador', description: 'On/Off indicator' },
    { type: 'text', label: 'Texto', description: 'Etiqueta de texto' },
    { type: 'graph', label: 'Gráfica', description: 'Línea en tiempo real' },
  ];

  const availableParameters = Object.entries(PARAMETER_INFO).map(
    ([key, info]) => ({
      key: key as ParameterKey,
      label: info.label,
    })
  );

  const handleAddWidget = useCallback(
    (type: WidgetType, parameter: ParameterKey) => {
      if (!dashboard) return;

      const newWidget: Widget = {
        id: `widget_${Date.now()}`,
        type,
        parameter,
        position: {
          x: Math.random() * 100,
          y: Math.random() * 100,
          width: 120,
          height: 100,
        },
        config: {
          label: PARAMETER_INFO[parameter].label,
          showLabel: true,
        },
      };

      const updated = {
        ...dashboard,
        widgets: [...dashboard.widgets, newWidget],
      };
      setDashboard(updated);
      setShowWidgetLibrary(false);
    },
    [dashboard]
  );

  const handleRemoveWidget = useCallback((id: string) => {
    if (!dashboard) return;
    const updated = {
      ...dashboard,
      widgets: dashboard.widgets.filter(w => w.id !== id),
    };
    setDashboard(updated);
    setSelectedWidget(null);
  }, [dashboard]);

  const handleSaveDashboard = useCallback(async () => {
    if (!dashboard || !dashboardName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el dashboard');
      return;
    }

    try {
      const updated = {
        ...dashboard,
        name: dashboardName.trim(),
      };
      await saveDashboard(updated);
      Alert.alert('Éxito', 'Dashboard guardado correctamente');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el dashboard');
    }
  }, [dashboard, dashboardName, saveDashboard, router]);

  if (!dashboard) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Cargando editor...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View className="bg-surface px-4 py-3 flex-row items-center justify-between border-b border-border">
        <Pressable onPress={() => router.back()}>
          <Text className="text-primary font-semibold">← Atrás</Text>
        </Pressable>
        <Text className="text-lg font-bold text-foreground">Editor</Text>
        <Pressable onPress={handleSaveDashboard}>
          <Text className="text-primary font-semibold">Guardar</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Dashboard Name Input */}
        <View className="px-4 py-3 gap-2">
          <Text className="text-sm font-semibold text-foreground">
            Nombre del Dashboard
          </Text>
          <TextInput
            value={dashboardName}
            onChangeText={setDashboardName}
            placeholder="Ej: Mi Dashboard Racing"
            placeholderTextColor={colors.muted}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-foreground"
          />
        </View>

        {/* Canvas Preview */}
        <View className="px-4 py-3">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Vista Previa
          </Text>
          <View
            className="relative rounded-lg overflow-hidden"
            style={{
              backgroundColor: dashboard.theme.backgroundColor,
              height: 300,
              borderWidth: 1,
              borderColor: dashboard.theme.gridColor,
            }}
          >
            {/* Grid lines - simple pattern */}
            {Array.from({ length: Math.ceil(300 / gridSize) }).map((_, row) =>
              Array.from({ length: Math.ceil(300 / gridSize) }).map((_, col) => (
                <View
                  key={`grid-${row}-${col}`}
                  style={{
                    position: 'absolute',
                    left: col * gridSize,
                    top: row * gridSize,
                    width: 1,
                    height: 1,
                    backgroundColor: dashboard.theme.gridColor,
                    opacity: 0.2,
                  }}
                />
              ))
            )}

            {/* Widgets */}
            {dashboard.widgets.map((widget) => (
              <Pressable
                key={widget.id}
                onPress={() => setSelectedWidget(widget.id)}
                style={{
                  position: 'absolute',
                  left: `${widget.position.x}%`,
                  top: `${widget.position.y}%`,
                  width: `${widget.position.width}%`,
                  height: `${widget.position.height}%`,
                  borderWidth: selectedWidget === widget.id ? 2 : 1,
                  borderColor:
                    selectedWidget === widget.id
                      ? dashboard.theme.primaryColor
                      : dashboard.theme.gridColor,
                  borderRadius: 8,
                  backgroundColor: dashboard.theme.backgroundColor,
                }}
              >
                <View className="flex-1 items-center justify-center">
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: dashboard.theme.textColor }}
                  >
                    {widget.type}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Widget List */}
        <View className="px-4 py-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-foreground">
              Widgets ({dashboard.widgets.length})
            </Text>
            <Pressable
              onPress={() => setShowWidgetLibrary(true)}
              className="bg-primary px-3 py-1 rounded"
            >
              <Text className="text-white text-xs font-semibold">+ Agregar</Text>
            </Pressable>
          </View>

          {dashboard.widgets.length === 0 ? (
            <Text className="text-muted text-sm">
              No hay widgets. Haz clic en "+ Agregar" para comenzar.
            </Text>
          ) : (
            <View className="gap-2">
              {dashboard.widgets.map((widget) => (
                <View
                  key={widget.id}
                  className="bg-surface border border-border rounded-lg p-3 flex-row items-center justify-between"
                  style={{
                    borderColor:
                      selectedWidget === widget.id
                        ? dashboard.theme.primaryColor
                        : colors.border,
                  }}
                >
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">
                      {widget.type} - {PARAMETER_INFO[widget.parameter].label}
                    </Text>
                    <Text className="text-xs text-muted">
                      Pos: ({widget.position.x.toFixed(0)}%, {widget.position.y.toFixed(0)}%)
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemoveWidget(widget.id)}
                    className="bg-error/20 px-2 py-1 rounded"
                  >
                    <Text className="text-error text-xs font-semibold">✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Widget Library Modal */}
      <Modal
        visible={showWidgetLibrary}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWidgetLibrary(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-background mt-12 rounded-t-2xl">
            {/* Modal Header */}
            <View className="px-4 py-3 border-b border-border flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">
                Agregar Widget
              </Text>
              <Pressable onPress={() => setShowWidgetLibrary(false)}>
                <Text className="text-primary font-semibold">Cerrar</Text>
              </Pressable>
            </View>

            {/* Widget Types */}
            <ScrollView className="flex-1 px-4 py-3">
              <Text className="text-sm font-semibold text-foreground mb-3">
                Tipo de Widget
              </Text>
              {availableWidgets.map((wtype) => (
                <Pressable
                  key={wtype.type}
                  onPress={() => {
                    // Mostrar selector de parámetro
                    Alert.alert(
                      'Selecciona un parámetro',
                      'Elige qué parámetro mostrar en este widget',
                      availableParameters.map((param) => ({
                        text: param.label,
                        onPress: () =>
                          handleAddWidget(wtype.type, param.key),
                      }))
                    );
                  }}
                  className="bg-surface border border-border rounded-lg p-3 mb-2"
                >
                  <Text className="font-semibold text-foreground">
                    {wtype.label}
                  </Text>
                  <Text className="text-xs text-muted">{wtype.description}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
