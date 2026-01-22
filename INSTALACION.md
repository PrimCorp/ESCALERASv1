# 📊 SISTEMA DE CONTROL DE INSPECCIONES VEHICULARES - TELCONET

## 🎯 Descripción del Sistema

Sistema automatizado para controlar el cumplimiento de inspecciones vehiculares diarias en Telconet. El sistema detecta automáticamente:

- ✅ Vehículos que completaron sus inspecciones (INICIO y FIN)
- ⚠️ Vehículos que salieron pero NO registraron regreso (MEMO REQUERIDO)
- ❓ Vehículos sin registros (Verificar si salieron o no)
- 🚨 Irregularidades (múltiples usuarios registrando el mismo vehículo)

---

## 📋 Requisitos Previos

1. **Google Sheets con 2 pestañas:**
   - `HISTORIAL_DIARIO_ESCALERAS` - Inspecciones realizadas
   - `BASE_FORMULARIO_DE_ESCALERA_CONTROL` - Lista de placas activas

2. **Permisos de Google:**
   - Acceso para ejecutar scripts
   - Permisos para enviar emails

---

## 🚀 Instalación Paso a Paso

### PASO 1: Preparar tu Google Sheet

1. Abre tu archivo de Google Sheets
2. Asegúrate de tener las 2 pestañas con los nombres exactos:
   - `HISTORIAL_DIARIO_ESCALERAS`
   - `BASE_FORMULARIO_DE_ESCALERA_CONTROL`

### PASO 2: Abrir el Editor de Scripts

1. En Google Sheets, ve a: **Extensiones > Apps Script**
2. Se abrirá el editor de código

### PASO 3: Copiar el Código Principal

1. En el editor, elimina todo el código que viene por defecto
2. Copia TODO el contenido del archivo **`Code.gs`**
3. Pégalo en el editor
4. Guarda con `Ctrl + S` o el ícono de disco

### PASO 4: Crear el Archivo HTML

1. En el editor de Apps Script, haz clic en el **+** junto a "Archivos"
2. Selecciona **HTML**
3. Nómbralo exactamente: `InspeccionVehicular`
4. Copia TODO el contenido del archivo **`InspeccionVehicular.html`**
5. Pégalo en este nuevo archivo HTML
6. Guarda

### PASO 5: Configurar tu Email

1. En el archivo `Code.gs`, busca esta línea (aproximadamente línea 13):

```javascript
EMAIL_DESTINATARIOS: ['tu-email@telconet.ec'],
```

2. Cámbiala por tu email real:

```javascript
EMAIL_DESTINATARIOS: ['dvrodriguez@telconet.ec'],
```

3. Si quieres enviar a múltiples personas:

```javascript
EMAIL_DESTINATARIOS: ['dvrodriguez@telconet.ec', 'supervisor@telconet.ec'],
```

### PASO 6: Autorizar Permisos

1. Haz clic en el botón **▶ Ejecutar** (selecciona la función `onOpen`)
2. Te pedirá autorización, haz clic en **Revisar permisos**
3. Selecciona tu cuenta de Google
4. Haz clic en **Avanzado** → **Ir a [nombre del proyecto] (no seguro)**
5. Haz clic en **Permitir**

### PASO 7: Activar el Reporte Automático

1. Cierra el editor de Apps Script
2. Regresa a tu Google Sheet
3. Refresca la página (F5)
4. Verás un nuevo menú: **📊 Control de Inspecciones**
5. Haz clic en: **Control de Inspecciones > ⚙️ Configurar Reporte Automático**
6. Confirma la configuración

¡Listo! El sistema está instalado y configurado.

---

## 📱 Cómo Usar el Sistema

### Opción 1: Dashboard Visual

1. En Google Sheets, ve a: **📊 Control de Inspecciones > 🚀 Abrir Dashboard**
2. Selecciona la fecha que quieres revisar
3. Haz clic en **Generar Reporte**
4. Verás el reporte completo con estadísticas y tablas

### Opción 2: Reporte por Email

1. Ve a: **📊 Control de Inspecciones > 📧 Enviar Reporte por Email**
2. El reporte se enviará automáticamente a los emails configurados

### Opción 3: Reporte en Pestaña

1. Ve a: **📊 Control de Inspecciones > 📋 Generar Reporte Hoy**
2. Se creará una nueva pestaña con el reporte del día

### Opción 4: Automático Diario

- El sistema enviará automáticamente el reporte cada día a las 22:00
- No necesitas hacer nada, es completamente automático

---

## 📊 Interpretación del Reporte

### ✅ CUMPLIMIENTO COMPLETO
**Significado:** Estos vehículos registraron correctamente su INICIO y FIN.
**Acción:** Ninguna, todo correcto.

**Ejemplo:**
```
Placa: GTQ-1040
Inicio: 07:00 | Fin: 16:30
Responsable: dvrodriguez
```

---

### ⚠️ SALIERON PERO NO REGISTRARON REGRESO
**Significado:** El vehículo tiene registro de INICIO pero falta el registro de FIN.
**Acción:** 🚨 **MEMO REQUERIDO** - Sancionar al responsable.

**Ejemplo:**
```
Placa: GTQ-8328
Inicio: 07:30
Responsable: mlopez
Horas sin FIN: 14.5h
```

**Qué hacer:**
1. Contactar al responsable
2. Verificar si efectivamente regresó y no registró
3. Emitir memo por incumplimiento

---

### ❓ SIN REGISTROS
**Significado:** La placa NO tiene ningún registro en todo el día.
**Acción:** 🔍 **VERIFICAR** con despacho si el vehículo salió o no.

**Ejemplo:**
```
Placa: GTL-5775
N° Vehículo: 311
Ciudad: Quito
```

**Qué hacer:**
1. Consultar con despacho/logística si ese vehículo salió
2. **SI SALIÓ:** Buscar quién lo usó y emitir memo por no registrar
3. **NO SALIÓ:** Todo correcto, ignorar

---

### 🚨 IRREGULARIDADES DETECTADAS
**Significado:** Múltiples usuarios registraron el mismo vehículo a la misma hora.
**Acción:** 🚨 **INVESTIGAR URGENTE** - Posible fraude o pérdida de equipos.

**Ejemplo:**
```
Placa: GCT-4309
Hora: 09:15
Responsables: jperez, mlopez
```

**Qué hacer:**
1. Investigar inmediatamente
2. Determinar quién realmente usó el vehículo
3. Posible intento de fraude o justificación indebida

---

## 🔧 Configuración Avanzada

### Cambiar Hora del Reporte Automático

1. Abre el editor de Apps Script
2. Busca la línea (aproximadamente línea 12):

```javascript
HORA_REPORTE_AUTOMATICO: 22, // 22:00 (10 PM)
```

3. Cámbiala por la hora que prefieras (formato 24 horas):

```javascript
HORA_REPORTE_AUTOMATICO: 23, // 23:00 (11 PM)
```

### Desactivar Reporte Automático

1. En Google Sheets: **📊 Control de Inspecciones > ❌ Desactivar Reporte Automático**
2. Confirma la acción

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si un vehículo sale múltiples veces en el día?**
R: El sistema lo detecta correctamente. Debe haber pares de INICIO-FIN por cada salida.

**P: ¿Puedo ver reportes de días anteriores?**
R: Sí, en el dashboard puedes seleccionar cualquier fecha.

**P: ¿El reporte automático se envía los fines de semana?**
R: Sí, todos los días a las 22:00.

**P: ¿Puedo agregar más destinatarios al email?**
R: Sí, edita la configuración `EMAIL_DESTINATARIOS` en Code.gs.

---

## 🐛 Solución de Problemas

### Error: "No se encontró la hoja"
**Solución:** Verifica que los nombres de las pestañas sean exactamente:
- `HISTORIAL_DIARIO_ESCALERAS`
- `BASE_FORMULARIO_DE_ESCALERA_CONTROL`

### El menú no aparece
**Solución:** 
1. Refresca la página (F5)
2. Cierra y vuelve a abrir el archivo

### No llega el email automático
**Solución:**
1. Verifica que configuraste correctamente los emails
2. Revisa la carpeta de spam
3. Verifica los triggers en Apps Script

---

## 📞 Soporte

**Desarrollador:** Danny Rodriguez  
**Departamento:** Control de Activos - Telconet  
**Email:** dvrodriguez@telconet.ec

---

## 📝 Notas Importantes

1. ✅ El sistema es completamente automático una vez configurado
2. ✅ Los datos se procesan en tiempo real desde tu Google Sheet
3. ✅ No se almacena información sensible
4. ✅ Compatible con cualquier navegador
5. ✅ Funciona 24/7 sin necesidad de supervisión

---

## 🎯 Resultado Esperado

Después de instalar este sistema:

1. **Reducción del 90%** en tiempo de auditoría manual
2. **Detección inmediata** de incumplimientos
3. **Reportes profesionales** listos para sanciones
4. **Visibilidad total** de la operación vehicular
5. **Control efectivo** del cumplimiento de inspecciones

---

**¡Sistema listo para usar!** 🚀

Si tienes alguna duda durante la instalación, contacta al desarrollador.
