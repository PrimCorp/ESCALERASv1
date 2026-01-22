# 🚗 Inspector Vehicular - Telconet

Sistema de control de inspecciones vehiculares para Telconet.

## 🌐 Demo en Vivo

**https://TUUSUARIO.github.io/inspector-vehicular/**

## 🚀 Instalación en GitHub Pages

### 1. Crea un nuevo repositorio en GitHub
- Nombre: `inspector-vehicular`
- Público

### 2. Sube estos archivos
```
inspector-vehicular/
├── index.html
├── datos.json
├── Code.gs (para Google Sheets)
├── InspeccionVehicular.html (para Google Sheets)
└── README.md
```

### 3. Activa GitHub Pages
- Ve a Settings > Pages
- Source: `main` branch
- Save

### 4. Tu app estará en:
`https://TUUSUARIO.github.io/inspector-vehicular/`

## 📊 Conectar con Google Sheets

Para conectar con tus datos reales de Google Sheets:

1. Abre tu Google Sheet
2. Ve a **Extensiones > Apps Script**
3. Copia el contenido de `Code.gs`
4. Crea archivo HTML llamado `InspeccionVehicular`
5. Copia el contenido de `InspeccionVehicular.html`

**Configura las rutas en Code.gs (líneas 11-14):**
```javascript
const CONFIG = {
  SHEET_HISTORIAL: 'HISTORIAL_DIARIO_ESCALERAS',  // Tu pestaña
  SHEET_BASE: 'BASE_FORMULARIO_DE_ESCALERA_CONTROL',  // Tu pestaña
  HORA_REPORTE_AUTOMATICO: 22,
  EMAIL_DESTINATARIOS: ['tu-email@telconet.ec'],
};
```

## 🎯 Características

- ✅ Dashboard visual profesional
- ✅ Detección automática de incumplimientos
- ✅ Alertas de vehículos sin registro de regreso
- ✅ Verificación de vehículos sin registros
- ✅ Reportes en tiempo real

## 📧 Desarrollador

**Danny Rodriguez**  
Control de Activos - Telconet

## 📜 Licencia

© 2026 Telconet - Uso Interno
