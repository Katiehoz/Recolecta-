# Recolecta+ · Prototipo funcional

Plataforma de gestión de residuos sólidos inteligentes para Montería: canecas IoT,
rutas de recolección optimizadas e incentivos al reciclaje para la ciudadanía.

## Estado actual

- **Login** funcional con selector de rol (Empleado / Ciudadano).
- **Panel de Control Operativo** (rol Empleado): KPIs, solicitudes de recolección
  y alertas de canecas.
- **Rutas y Mapa en Vivo** (rol Empleado): flota activa, trazado de ruta y detalle
  del recorrido seleccionado.
- **Impacto Ambiental** (rol Empleado): distribución de residuos reciclados,
  tendencia de CO₂ evitado y exportación del reporte ESG.
- **Vehículos y Flota** (rol Empleado): tarjetas de las unidades con estado,
  conductor, ruta y combustible, más una ficha operativa por vehículo.
- **Empresas y Sedes** (rol Empleado): empresa operadora con sus métricas y la
  sede principal de la operación.
- **Ajustes de Plataforma** (rol Empleado): perfil, preferencias de interfaz y
  notificaciones de la cuenta.
- **App ciudadana** (rol Ciudadano): inicio con puntos, acciones rápidas,
  actividad reciente y rastreo del recolector en tiempo real, con navegación
  inferior tipo app móvil.

## Cómo ejecutarlo

No requiere instalación ni dependencias: es HTML, CSS y JavaScript puro.

**Opción 1 — abrir el archivo directamente**

Abre `index.html` en el navegador.

**Opción 2 — servidor local (recomendado)**

```bash
python -m http.server 8123
```

Luego visita <http://127.0.0.1:8123>.

## Cuentas de prueba

| Rol       | Correo                    | Contraseña     | Redirige a       |
| --------- | ------------------------- | -------------- | ---------------- |
| Empleado  | `operador@urbaser.co`     | `recolecta123` | `panel.html`     |
| Ciudadano | `ciudadano@recolecta.co`  | `recolecta123` | `ciudadano.html` |

## Qué incluye el login

- Diseño a dos columnas: panel de marca verde y formulario sobre fondo blanco.
- Selector de rol que adapta el mensaje, el botón y la cuenta demo.
- Validación de correo y contraseña con mensajes de error en línea.
- Estado de carga ("Verificando…") y confirmación de acceso.
- Sesión en `localStorage`; cada página valida el rol y redirige si no corresponde.
- Diseño responsive (el panel verde pasa a encabezado en pantallas angostas).

## Qué incluye el panel operativo

- **Barra superior**: identidad, contexto de zona, notificaciones y usuario.
- **Menú lateral** con sección de gestión, módulos y meta verde mensual.
- **4 indicadores**: total recolectado, servicios activos, huella de CO₂ evitada y
  eficiencia de ruta.
- **Solicitudes de recolección**: tabla con pestañas por estado (Todas, Pendientes,
  En Proceso, Completadas). Los reportes enviados desde la app ciudadana se insertan
  como solicitudes **Pendientes** con folio `REP-xxxx` y la etiqueta **App**.
- **Alertas de canecas** en la campana de notificaciones.
- Actualización de datos simulada y avisos flotantes de confirmación.
- Cierre de sesión con retorno al login.

> Es un prototipo: la mayoría de los datos del panel viven en memoria y la
> autenticación se valida en el navegador. Los reportes ciudadanos sí persisten en
> `localStorage` bajo `recolecta.reportes`. Al conectar el backend real, reemplaza el
> arreglo `solicitudes` de `js/dashboard.js` por llamadas a la API y `CUENTAS` de
> `js/login.js` por el servicio de autenticación.

## Qué incluye la pantalla de rutas

- **Encabezado** con título, subtítulo de rastreo GPS y marca de última actualización.
- **Panel de flota** (4 unidades) con estado, conductor, carga actual y barra de
  capacidad: Camión #04 EV Electric, Camión #02 Híbrido, Unidad #08 VAN y Camión #06.
- **Mapa logístico oscuro** con trazado punteado, puntos de recolección y marcadores
  de Hotel Central, vehículo seleccionado y Eco-Plaza Norte.
- **Tarjeta de ruta seleccionada** con número de ruta, zona, puntos programados,
  porcentaje completado y ETA.
- **Alertas operativas** debajo del mapa: tres tarjetas de severidad (Crítica, Alta,
  Media) con hora, caneca y nivel de llenado. Cada una permite **Programar recolección**
  o **Descartar**.
- **Ficha de programación** (modal): resumen de la alerta, ubicación, foto de la caneca,
  accesibilidad, historial, ruta recomendada con ETA/vehículo/operador/carga, recursos,
  aviso de tráfico, notificaciones y acciones para confirmar, ver ruta o reasignar.
- Al elegir otra unidad en el panel, el mapa y la tarjeta de ruta se actualizan.
- Alertas, cierre de sesión, menú móvil y refresco simulado comparten la lógica del panel.

> La pantalla no incluye el botón "Optimizar Rutas" del mockup original.

## Qué incluye la pantalla de impacto ambiental

- **Encabezado** con título "Reporte de Impacto Ambiental", subtítulo ESG y botón
  **Exportar Reporte ESG** que descarga un CSV con la distribución de residuos y la
  tendencia de CO₂, además de un aviso flotante de confirmación.
- **Distribución por Tipo de Residuo**: dona interactiva con el total del mes
  (84,2 t) y cinco corrientes:
  - Plásticos & PET · 35,4 t · 42%
  - Cartón / Papel · 21,9 t · 26%
  - Electrónicos RAEE · 11,0 t · 13%
  - Vidrio · 9,3 t · 11%
  - Orgánicos · 6,6 t · 8%
- Leyenda con toneladas y porcentaje; al pasar el cursor o enfocar un ítem se resalta
  su segmento y se atenúan los demás.
- **Tendencia de CO₂ Evitado (2026)**: gráfico de línea y área (Ene–Jul) con eje de
  180 a 360 t, puntos con tooltip nativo y valor acumulado a julio (345 t).
- Nota de datos simulados y layout responsive (las tarjetas se apilan en pantallas
  angostas).

## Qué incluye la pantalla de vehículos y flota

- **Rejilla 2×2 de vehículos** con ícono, placa, tipo, badge de estado,
  conductor, ubicación/ruta y nivel de combustible con barra:
  - URB-041 · Camión compactador · EN RUTA · Carlos Mendoza · R-1 · Centro Norte · 72%
  - URB-023 · Camión compactador · DISPONIBLE · Andrés Pérez · R-2 · Sur Boston · 88%
  - URB-037 · Volqueta recolectora · EN RUTA · Juan Ríos · R-3 · Mocarí · 61%
  - URB-018 · Camión de apoyo · MANTENIMIENTO · Sin asignar · Patio operativo · 45%
- **Ficha del vehículo** (modal) con identificación, estatus, conductor,
  ubicación/ruta, ruta actual (última y próxima parada + progreso), operativo
  (conductor asignado, asistente y horario) y mantenimiento (estado general,
  último y próximo mantenimiento con acción **Programar**).
- La ficha omite deliberadamente combustible, odómetro, eficiencia de combustible,
  temperatura del motor, mapa y reportes de incidencias.
- Botón **Ver ruta completa** que lleva a la pantalla de rutas y cierre de la ficha
  con botón, fondo o tecla `Esc`.

## Qué incluye la pantalla de empresas y sedes

- **Tarjeta de empresa** con encabezado verde degradado, logo, nombre
  (Urbaser Montería), subtítulo de la operación y píldora **Convenio activo**.
- **Métricas en 2×2** con separadores: NIT `900.041.856-7`, operación
  `Montería, Córdoba`, `48` canecas activas y `36` colaboradores.
- **Tarjeta de sede operativa**: nombre del centro de operaciones, bloque mint con
  ícono, y filas de Dirección (`Km 3 vía Planeta Rica`), Horario
  (`Lun–Sáb · 05:00–18:00`), Contacto (`+57 604 785 2100`) y Coordenadas
  (`8.7508, -75.8812`).
- Dos columnas en escritorio (empresa más ancha que la sede); se apilan en pantallas
  angostas, y en móvil las filas de la sede pasan a disposición vertical.

## Qué incluye la pantalla de ajustes

- **Pestañas**: Mi Cuenta (activa), Organización y Sedes, Gestión de Canecas e
  Integraciones API. Las tres últimas muestran un estado "próximamente" con botón
  para volver a Mi Cuenta.
- **Perfil de Usuario**: avatar con iniciales, nombre, cargo y correo tomados de la
  sesión, con acciones **Editar perfil** y **Cambiar contraseña**.
  - *Editar perfil* abre un diálogo con nombre, cargo y correo; valida los campos y
    actualiza la sesión y la barra superior.
  - *Cambiar contraseña* valida la contraseña demo (`recolecta123`), el mínimo de
    8 caracteres y la confirmación.
- **Preferencias de Interfaz**: tema claro activo y tema oscuro marcado como
  **Pronto** (muestra un aviso en lugar de cambiar).
- **Notificaciones**: interruptor maestro (Activado / Desactivado / Personalizado)
  y cuatro avisos: Alertas Críticas, Nuevas Rutas, Reportes Mensuales y Alertas de
  Vehículos.
- **Acciones**: **Guardar cambios** (persiste en `localStorage` bajo
  `recolecta.ajustes`) y **Cancelar** (vuelve a lo guardado).
- Dos columnas en escritorio que pasan a una sola en pantallas angostas; las
  pestañas se desplazan horizontalmente en móvil.
- Se omitieron del mockup original una de las dos tarjetas duplicadas de
  preferencias, la tarjeta de Seguridad y la de Administración de Licencia (PRO),
  y se usó la paleta clara del resto del prototipo.

## Qué incluye la app ciudadana

- **Pantalla de inicio móvil**: en escritorio se muestra como una app centrada de
  520 px con esquinas redondeadas; en móvil ocupa toda la pantalla.
- **Cabecera oscura** con marca Recolecta+, insignia **Nivel Oro** y avatar que abre
  el menú de la cuenta (nombre, correo y cerrar sesión).
- **Bienvenida con puntos**: saludo personalizado desde la sesión, `1.480` Puntos
  Verdes, `+120 pts esta semana` y botón **Canjear**.
- **Recolección activa**: tarjeta oscura con etiqueta pulsante, `Recolector a ~8 min
  de tu casa` y `Carlos Mendoza • Camión Eco-04`.
- **Programar recolección**: CTA principal y botón flotante `+` abren un diálogo con
  material, dirección (validada), día y franja horaria. Al confirmar se muestra el
  estado de la solicitud en la tarjeta y un aviso flotante.
- **Acciones rápidas**: tarjetas de **Escanear código** (abre un escáner simulado
  que suma 25 Puntos Verdes y registra la actividad) y **Canjear**.
- **Actividad reciente**: lista con los últimos movimientos de puntos
  (`+25`, `+20`, `+15`) y su fecha; cada escaneo añade una fila nueva arriba.
- **Navegación inferior**: Inicio, Rastreo (abre `rastreo.html`), botón central,
  Premios y Mi Impacto; los módulos pendientes avisan que llegarán pronto.
- Cada página valida el rol: un empleado que abra `ciudadano.html` vuelve al panel.

### Rastreo en tiempo real (`rastreo.html`)

- **Encabezado de la orden**: `Rastreo en tiempo real`, `Orden activa #REC-9042`
  y chip pulsante **En camino**.
- **Mapa simulado** en verde oscuro con cuadrícula, ruta punteada y pines del
  camión y de tu casa, más la píldora `Recolector · 8 min`.
- **Tarjeta del recolector** superpuesta al mapa: Carlos Mendoza y una nota que
  invita a tocar una caneca en **Alerta** o **Lleno** para reportarla (sin llegada
  estimada, sin llamada y sin descripción del vehículo).
- **Canecas de tu ruta** (`C-01` alerta 92%, `C-07` lleno 78%, `C-12` normal 45%,
  `C-19` normal 31%): solo las canecas en estado crítico o lleno (`C-01` y `C-07`)
  son paneles expandibles; al tocarlas muestran el botón **Reportar caneca**. Las
  canecas normales no ofrecen el reporte.
- **Reportar caneca**: diálogo con la caneca seleccionada, ubicación detectada por
  GPS de solo lectura, tipo de caneca preseleccionado, comentarios validados
  (mínimo 6 caracteres) y envío simulado a Urbaser. **No incluye subida de foto**.
- Al enviar, el reporte se guarda en `recolecta.reportes` con folio persistente
  (`REP-2481`, `REP-2482`…), la caneca queda marcada como reportada y el reporte
  aparece en **Solicitudes de Recolección** del panel de Urbaser como pendiente.
- **Estado del pedido** con tres pasos.
- El botón central `+` vuelve a `ciudadano.html?nueva=1`, que abre directamente el
  diálogo de programación de recolección.

## Estructura

```
index.html           Inicio de sesión
panel.html           Panel de control operativo (Empleado)
rutas.html           Rutas y Mapa en Vivo (Empleado)
impacto.html         Reporte de Impacto Ambiental (Empleado)
flota.html           Vehículos y Flota (Empleado)
empresas.html        Empresas y Sedes (Empleado)
ajustes.html         Ajustes de Plataforma (Empleado)
ciudadano.html       App ciudadana: inicio con puntos y recolección
rastreo.html         App ciudadana: rastreo en tiempo real y reporte de canecas
css/estilos.css      Sistema de diseño compartido y login
css/panel.css        Estilos del panel operativo
css/rutas.css        Estilos de la pantalla de rutas
css/impacto.css      Estilos de la pantalla de impacto ambiental
css/flota.css        Estilos de la flota y la ficha del vehículo
css/empresas.css     Estilos de la empresa y la sede operativa
css/ajustes.css      Estilos de ajustes, interruptores y diálogos
css/ciudadano.css    Estilos de la app ciudadana móvil
css/rastreo.css      Estilos del mapa, la orden y las canecas del rastreo
js/login.js          Autenticación del prototipo
js/dashboard.js      Datos, filtros y acciones del panel
js/rutas.js          Flota, selección de ruta, alertas y ficha de programación
js/impacto.js        Gráficos de dona y CO₂, exportación ESG y sesión
js/flota.js          Tarjetas de flota, ficha del vehículo y sesión
js/empresas.js       Sesión, alertas y navegación de empresas y sedes
js/ajustes.js        Perfil, preferencias, notificaciones y diálogos de ajustes
js/ciudadano.js      Puntos, solicitudes y navegación de la app ciudadana
js/rastreo.js        Seguimiento del recolector, reportes de caneca y sesión
assets/favicon.svg   Isotipo de Recolecta+
```

## Siguientes pasos sugeridos

1. Módulo de rutas con mapa real (Leaflet + OpenStreetMap) y optimización de recorridos.
2. Simulador de sensores IoT para alimentar el nivel de llenado de cada caneca.
3. Detalle de caneca: nivel, batería, señal, temperatura y última lectura.
4. Vista ciudadana completa: puntos, canjes, educación ambiental y mapa de canecas.
5. Backend con roles reales (Alcaldía, Urbaser, ciudadanía).
#   R e c o l e c t a -  
 