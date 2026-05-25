# OBD1 Dashboard App - Diseño de Interfaz

## Visión General

Aplicación móvil para monitorear en tiempo real parámetros de un motor Honda OBD1 chipeado con Crome (protocolo QD3) mediante conexión Bluetooth SPP. Interfaz oscura/racing optimizada para orientación horizontal (landscape) en el automóvil.

---

## Pantallas Principales

### 1. **Pantalla de Conexión Bluetooth**
- Listar dispositivos Bluetooth disponibles
- Mostrar estado de conexión
- Botón para conectar/desconectar
- Indicador de fuerza de señal
- Reconexión automática

### 2. **Dashboard Principal (Múltiples Variantes)**
Tres dashboards preconfigurados + capacidad de crear personalizados:

#### **Dashboard Racing**
- Gauge circular grande de RPM (centro)
- Velocidad en grande (esquina superior)
- Temperatura motor (ECT) con color dinámico (azul → rojo)
- Presión MAP y TPS en barras horizontales
- Avance de encendido (ignición)
- Flags: VTEC, Check Engine, Closed Loop

#### **Dashboard Street**
- RPM, Velocidad, Temperatura motor en widgets grandes
- Voltaje batería, Carga alternador
- Sensor O2, Tiempo inyección
- Duty cycle del inyector
- STFT/LTFT (correcciones de combustible)

#### **Dashboard Tuning**
- Gráficas en tiempo real de 4 parámetros seleccionables
- Tabla de datos numéricos (RPM, ECT, IAT, MAP, TPS, O2, etc.)
- Duty cycle prominente
- Flags de estado
- Exportar datos a CSV

### 3. **Pantalla de Personalización de Dashboards**
- Selector de dashboard activo
- Editor visual: drag & drop de widgets
- Galería de widgets disponibles
- Configuración de colores y fondos
- Guardar/cargar configuraciones
- Eliminar dashboards personalizados

### 4. **Pantalla de Configuración**
- Seleccionar puerto Bluetooth (HC-05)
- Frecuencia de actualización (20-50ms)
- Unidades (km/h, °C, psi/kPa)
- Tema (oscuro/claro)
- Información de versión

---

## Componentes de Widget

### **Gauge Circular**
- Rango configurable (0-9000 RPM, 0-150°C, etc.)
- Aguja animada
- Color dinámico según rango (verde → amarillo → rojo)
- Valor numérico en el centro
- Unidad debajo del número

### **Barra Horizontal**
- Rango 0-100%
- Color degradado (verde → amarillo → rojo)
- Valor numérico a la derecha
- Etiqueta a la izquierda

### **Número Grande**
- Valor prominente (48-72pt)
- Unidad pequeña arriba o abajo
- Etiqueta descriptiva
- Color dinámico opcional

### **Gráfica en Tiempo Real**
- Línea animada (últimos 60 segundos)
- Eje Y con escala automática
- Eje X con marcas de tiempo
- Color de línea configurable
- Mín/Máx/Promedio en leyenda

### **Flag/Indicador**
- Círculo de estado (On/Off)
- Texto descriptivo
- Color verde (On) / gris (Off)
- Animación de parpadeo si crítico

---

## Flujo de Usuario

### **Inicio**
1. App abre → Pantalla de Conexión
2. Usuario escanea y selecciona HC-05
3. App se conecta, envía secuencia de inicialización
4. Espera 300ms, comienza lectura de datos
5. Transición a Dashboard Racing (por defecto)

### **Monitoreo en Tiempo Real**
1. Loop cada 50ms: enviar comando QD3, recibir datos, parsear, actualizar UI
2. Gauges y gráficas se animan suavemente
3. Si pierde conexión: reconexión automática
4. Usuario puede cambiar de dashboard con swipe o botones

### **Personalización**
1. Usuario toca botón "Editar Dashboard"
2. Entra en modo editor: drag & drop de widgets
3. Toca widget para configurar (color, rango, etc.)
4. Guarda configuración → vuelve a monitoreo

---

## Paleta de Colores

| Elemento | Color | Hex |
|----------|-------|-----|
| Fondo | Negro profundo | #0A0E27 |
| Superficie | Gris oscuro | #1A1F3A |
| Texto primario | Blanco | #FFFFFF |
| Texto secundario | Gris claro | #B0B5C0 |
| Acento primario | Naranja/Rojo | #FF6B35 |
| Acento secundario | Cian | #00D9FF |
| RPM bajo | Verde | #00FF41 |
| RPM medio | Amarillo | #FFD700 |
| RPM alto | Rojo | #FF0000 |
| Temperatura baja | Azul | #0099FF |
| Temperatura normal | Verde | #00FF41 |
| Temperatura alta | Rojo | #FF0000 |
| Borde | Gris oscuro | #2A2F4A |
| Éxito | Verde | #00FF41 |
| Error | Rojo | #FF0000 |

---

## Orientación y Responsive

### **Retrato (9:16)**
- Widgets en grid 2x3 o 3x2
- Gauge RPM ocupa 40% del ancho
- Botones de navegación abajo

### **Landscape (16:9)**
- Widgets en grid 4x2 o 3x3
- Gauge RPM ocupa 30% del ancho
- Botones de navegación arriba o lado

### **Tablets**
- Grid 4x3 o 5x3
- Widgets más grandes
- Márgenes aumentados

---

## Animaciones

- **Gauge**: Aguja se mueve suavemente (200ms) hacia el nuevo valor
- **Barra**: Ancho se anima (150ms) con easing ease-out
- **Número**: Cambio de color con fade (100ms)
- **Gráfica**: Línea se dibuja en tiempo real (smooth)
- **Transición de dashboard**: Fade in/out (300ms)

---

## Datos en Tiempo Real

### **Parámetros Mostrados (21 totales)**
1. RPM (0-9000)
2. Velocidad (0-255 km/h)
3. ECT - Temperatura motor (-40 a 150°C)
4. IAT - Temperatura aire (-40 a 150°C)
5. MAP - Presión múltiple (0-130 kPa)
6. TPS - Posición acelerador (0-100%)
7. O2 Sensor (0-5.0V)
8. Voltaje batería (0-16V)
9. Tiempo inyección (0-25ms)
10. Avance encendido (-20 a 50°)
11. Duty cycle (0-100%)
12. STFT (-25 a 25%)
13. LTFT (-25 a 25%)
14. IACV - Válvula ralentí (0-100%)
15. Carga alternador (0-100%)
16. Presión atmosférica (80-110 kPa)
17. O2 Sensor 2 (0-5.0V)
18. Límite ignición
19. EGR Position
20. VTEC (On/Off)
21. Check Engine (On/Off)

---

## Persistencia

- AsyncStorage: guardar configuraciones de dashboards
- No requiere backend (local-first)
- Exportar datos a CSV para análisis posterior

---

## Accesibilidad

- Contraste alto (fondo oscuro, texto claro)
- Tamaño mínimo de texto: 12pt
- Botones táctiles: mínimo 44x44pt
- Etiquetas descriptivas para todos los widgets
- Soporte para modo de alto contraste

---

## Consideraciones Técnicas

- **Latencia Bluetooth**: 10-50ms adicional esperado
- **Frecuencia de actualización**: 10-20 Hz realista
- **Buffer circular**: para manejar datos parciales
- **Timeout**: 200ms por comando
- **Reconexión**: automática cada 5 segundos si se pierde
- **Baudrate**: 38400 bps (fijo en protocolo QD3)
