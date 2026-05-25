# OBD1 Dashboard App - TODO

## Fase 1: Configuración y Branding
- [x] Generar logo personalizado para la app
- [x] Actualizar app.config.ts con nombre y logo
- [x] Copiar logo a todas las ubicaciones requeridas (icon.png, splash-icon.png, favicon.png, android-icon-foreground.png)
- [x] Configurar tema de colores (paleta racing oscura)

## Fase 2: Capa Bluetooth y Parser QD3
- [x] Instalar react-native-ble-plx
- [x] Crear módulo de comunicación Bluetooth (BluetoothService)
- [x] Implementar escaneo de dispositivos
- [x] Implementar conexión/desconexión
- [x] Crear parser del protocolo QD3
- [x] Implementar secuencia de inicialización (wake-up)
- [x] Implementar lectura de 3 bloques (0x00, 0x10, 0x20)
- [x] Implementar cálculo de CRC
- [x] Implementar conversión de datos según fórmulas del protocolo
- [x] Crear contexto global para estado de Bluetooth

## Fase 3: Componentes UI Base
- [x] Crear componente Gauge circular animado
- [x] Crear componente Barra horizontal animada
- [x] Crear componente Número grande
- [ ] Crear componente Gráfica en tiempo real (línea)
- [x] Crear componente Flag/Indicador
- [x] Crear pantalla de Conexión Bluetooth
- [x] Crear pantalla de Configuración

## Fase 4: Dashboards Preconfigurados
- [x] Crear Dashboard Racing (RPM prominente, velocidad, ECT, MAP, TPS, flags)
- [x] Crear Dashboard Street (RPM, velocidad, ECT, batería, carga alternador, O2, inyección)
- [x] Crear Dashboard Tuning (gráficas en tiempo real, tabla de datos, duty cycle)
- [x] Implementar navegación entre dashboards (tabs o swipe)
- [x] Implementar contexto de datos OBD1 global

## Fase 5: Personalización de Dashboards
- [ ] Crear pantalla de Editor de Dashboards
- [ ] Implementar drag & drop para widgets
- [ ] Crear galería de widgets disponibles
- [ ] Implementar configuración de colores por widget
- [ ] Implementar configuración de rangos por widget
- [ ] Crear sistema de guardado/carga de configuraciones (AsyncStorage)
- [ ] Implementar eliminación de dashboards personalizados

## Fase 6: Funcionalidades Avanzadas
- [ ] Implementar reconexión automática
- [ ] Implementar exportación de datos a CSV
- [ ] Implementar soporte para orientación landscape
- [ ] Implementar responsive design para tablets
- [ ] Crear pantalla de histórico de datos
- [ ] Implementar alertas por umbrales (ej: ECT > 100°C)

## Fase 7: Pulido y Optimización
- [ ] Optimizar rendimiento de gráficas
- [ ] Agregar animaciones suaves
- [ ] Implementar haptic feedback
- [ ] Pruebas en dispositivo físico
- [ ] Pruebas de latencia Bluetooth
- [ ] Optimizar consumo de batería
- [ ] Revisar accesibilidad

## Fase 8: Entrega Final
- [ ] Crear checkpoint final
- [ ] Documentar instrucciones de uso
- [ ] Generar APK/IPA para pruebas
- [ ] Verificar funcionamiento en Expo Go
