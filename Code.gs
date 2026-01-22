// ============================================================
// SISTEMA DE CONTROL DE INSPECCIONES VEHICULARES - TELCONET
// Desarrollado por: Danny Rodriguez
// Departamento: Control de Activos
// ============================================================

// CONFIGURACIÓN GLOBAL
const CONFIG = {
  SHEET_HISTORIAL: 'HISTORIAL_DIARIO_ESCALERAS',
  SHEET_BASE: 'BASE_FORMULARIO_DE_ESCALERA_CONTROL',
  HORA_REPORTE_AUTOMATICO: 22, // 22:00 (10 PM)
  EMAIL_DESTINATARIOS: ['tu-email@telconet.ec'], // Cambiar por tu email
};

/**
 * Función para crear el menú personalizado
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 Control de Inspecciones')
    .addItem('🚀 Abrir Dashboard', 'mostrarDashboard')
    .addItem('📋 Generar Reporte Hoy', 'generarReporteHoy')
    .addItem('📧 Enviar Reporte por Email', 'enviarReportePorEmail')
    .addSeparator()
    .addItem('⚙️ Configurar Reporte Automático', 'configurarTrigger')
    .addItem('❌ Desactivar Reporte Automático', 'eliminarTriggers')
    .addToUi();
}

/**
 * Mostrar el dashboard web
 */
function mostrarDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('InspeccionVehicular')
    .setWidth(1200)
    .setHeight(800)
    .setTitle('Control de Inspecciones Vehiculares');
  SpreadsheetApp.getUi().showModalDialog(html, 'Control de Inspecciones Vehiculares - Telconet');
}

/**
 * Generar reporte para una fecha específica
 */
function generarReporteDiario(fechaStr) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const fecha = new Date(fechaStr + 'T00:00:00');
    
    // Obtener datos
    const historial = obtenerHistorial(ss, fecha);
    const placasBase = obtenerPlacasBase(ss);
    
    // Procesar inspecciones
    const inspeccionesPorPlaca = procesarInspecciones(historial, fecha);
    
    // Generar reporte
    const reporte = generarReporte(inspeccionesPorPlaca, placasBase, fecha);
    
    return reporte;
  } catch (error) {
    throw new Error('Error al generar reporte: ' + error.message);
  }
}

/**
 * Obtener historial de inspecciones
 */
function obtenerHistorial(ss, fecha) {
  const sheet = ss.getSheetByName(CONFIG.SHEET_HISTORIAL);
  if (!sheet) {
    throw new Error('No se encontró la hoja: ' + CONFIG.SHEET_HISTORIAL);
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Índices de columnas
  const indices = {
    fecha: headers.indexOf('Fecha'),
    placa: headers.indexOf('Placas'),
    responsable: headers.indexOf('Responsable'),
    ciudad: headers.indexOf('Ciudad'),
    numeroVehiculo: headers.indexOf('N°Vehículo'),
    articulo: headers.indexOf('NOMBRE ARTICULO'),
    estado: headers.indexOf('Estado')
  };
  
  // Filtrar por fecha
  const registros = [];
  const fechaInicio = new Date(fecha);
  fechaInicio.setHours(0, 0, 0, 0);
  const fechaFin = new Date(fecha);
  fechaFin.setHours(23, 59, 59, 999);
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const fechaRegistro = new Date(row[indices.fecha]);
    
    if (fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin) {
      registros.push({
        fecha: fechaRegistro,
        placa: row[indices.placa],
        responsable: row[indices.responsable],
        ciudad: row[indices.ciudad],
        numeroVehiculo: row[indices.numeroVehiculo],
        articulo: row[indices.articulo],
        estado: row[indices.estado]
      });
    }
  }
  
  return registros;
}

/**
 * Obtener lista base de placas
 */
function obtenerPlacasBase(ss) {
  const sheet = ss.getSheetByName(CONFIG.SHEET_BASE);
  if (!sheet) {
    throw new Error('No se encontró la hoja: ' + CONFIG.SHEET_BASE);
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const indices = {
    placa: headers.indexOf('Placas'),
    ciudad: headers.indexOf('Ciudad'),
    numeroVehiculo: headers.indexOf('N°Vehículo')
  };
  
  // Obtener placas únicas
  const placasMap = new Map();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const placa = row[indices.placa];
    
    if (!placasMap.has(placa)) {
      placasMap.set(placa, {
        placa: placa,
        ciudad: row[indices.ciudad] || 'N/A',
        numeroVehiculo: row[indices.numeroVehiculo] || 'N/A'
      });
    }
  }
  
  return Array.from(placasMap.values());
}

/**
 * Procesar inspecciones y agrupar por placa
 */
function procesarInspecciones(registros, fecha) {
  const inspeccionesPorPlaca = new Map();
  
  // Agrupar registros por placa + fecha/hora + responsable
  const grupos = new Map();
  
  registros.forEach(registro => {
    // Redondear minutos para agrupar inspecciones cercanas
    const fechaRedondeada = new Date(registro.fecha);
    fechaRedondeada.setSeconds(0, 0);
    
    const key = `${registro.placa}|${fechaRedondeada.getTime()}|${registro.responsable}`;
    
    if (!grupos.has(key)) {
      grupos.set(key, {
        placa: registro.placa,
        fecha: fechaRedondeada,
        responsable: registro.responsable,
        ciudad: registro.ciudad,
        numeroVehiculo: registro.numeroVehiculo,
        articulos: []
      });
    }
    
    grupos.get(key).articulos.push({
      articulo: registro.articulo,
      estado: registro.estado
    });
  });
  
  // Agrupar inspecciones por placa
  grupos.forEach(inspeccion => {
    if (!inspeccionesPorPlaca.has(inspeccion.placa)) {
      inspeccionesPorPlaca.set(inspeccion.placa, {
        placa: inspeccion.placa,
        ciudad: inspeccion.ciudad,
        numeroVehiculo: inspeccion.numeroVehiculo,
        inspecciones: []
      });
    }
    
    inspeccionesPorPlaca.get(inspeccion.placa).inspecciones.push({
      fecha: inspeccion.fecha,
      responsable: inspeccion.responsable,
      articulosRevisados: inspeccion.articulos.length
    });
  });
  
  // Ordenar inspecciones por fecha
  inspeccionesPorPlaca.forEach(data => {
    data.inspecciones.sort((a, b) => a.fecha - b.fecha);
  });
  
  return inspeccionesPorPlaca;
}

/**
 * Generar reporte completo
 */
function generarReporte(inspeccionesPorPlaca, placasBase, fecha) {
  const completos = [];
  const sinFin = [];
  const sinRegistros = [];
  const irregularidades = [];
  
  // Detectar irregularidades (múltiples responsables a la misma hora)
  inspeccionesPorPlaca.forEach(data => {
    const inspeccionesPorHora = new Map();
    
    data.inspecciones.forEach(insp => {
      const horaKey = insp.fecha.getTime();
      if (!inspeccionesPorHora.has(horaKey)) {
        inspeccionesPorHora.set(horaKey, []);
      }
      inspeccionesPorHora.get(horaKey).push(insp.responsable);
    });
    
    inspeccionesPorHora.forEach((responsables, horaKey) => {
      if (responsables.length > 1) {
        irregularidades.push({
          placa: data.placa,
          fechaHora: formatearFechaHora(new Date(horaKey)),
          responsables: [...new Set(responsables)]
        });
      }
    });
  });
  
  // Procesar cada placa de la base
  placasBase.forEach(placaBase => {
    const inspeccionesPlaca = inspeccionesPorPlaca.get(placaBase.placa);
    
    if (!inspeccionesPlaca || inspeccionesPlaca.inspecciones.length === 0) {
      // Sin registros
      sinRegistros.push({
        placa: placaBase.placa,
        numeroVehiculo: placaBase.numeroVehiculo,
        ciudad: placaBase.ciudad
      });
    } else {
      const numInspecciones = inspeccionesPlaca.inspecciones.length;
      
      if (numInspecciones % 2 === 0) {
        // Número par = completo
        const turnos = numInspecciones / 2;
        const inicios = [];
        const fines = [];
        const responsables = [];
        
        for (let i = 0; i < numInspecciones; i++) {
          const insp = inspeccionesPlaca.inspecciones[i];
          if (i % 2 === 0) {
            inicios.push(formatearHora(insp.fecha));
            responsables.push(insp.responsable);
          } else {
            fines.push(formatearHora(insp.fecha));
          }
        }
        
        completos.push({
          placa: placaBase.placa,
          numeroVehiculo: inspeccionesPlaca.numeroVehiculo,
          ciudad: inspeccionesPlaca.ciudad,
          inicios: inicios,
          fines: fines,
          responsables: [...new Set(responsables)],
          turnos: turnos
        });
      } else {
        // Número impar = falta FIN
        const ultimaInspeccion = inspeccionesPlaca.inspecciones[numInspecciones - 1];
        const ahora = new Date();
        const horasSinFin = (ahora - ultimaInspeccion.fecha) / (1000 * 60 * 60);
        
        sinFin.push({
          placa: placaBase.placa,
          numeroVehiculo: inspeccionesPlaca.numeroVehiculo,
          ciudad: inspeccionesPlaca.ciudad,
          ultimoInicio: formatearFechaHora(ultimaInspeccion.fecha),
          responsable: ultimaInspeccion.responsable,
          horasSinFin: horasSinFin
        });
      }
    }
  });
  
  // Calcular resumen
  const totalPlacas = placasBase.length;
  const resumen = {
    totalPlacas: totalPlacas,
    completos: completos.length,
    sinFin: sinFin.length,
    sinRegistros: sinRegistros.length,
    irregularidades: irregularidades.length,
    porcentajeCompletos: ((completos.length / totalPlacas) * 100).toFixed(1),
    porcentajeSinFin: ((sinFin.length / totalPlacas) * 100).toFixed(1),
    porcentajeSinRegistros: ((sinRegistros.length / totalPlacas) * 100).toFixed(1),
    fecha: formatearFecha(fecha)
  };
  
  return {
    resumen: resumen,
    completos: completos,
    sinFin: sinFin,
    sinRegistros: sinRegistros,
    irregularidades: irregularidades
  };
}

/**
 * Formatear fecha
 */
function formatearFecha(fecha) {
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  return fecha.toLocaleDateString('es-EC', opciones);
}

/**
 * Formatear fecha y hora
 */
function formatearFechaHora(fecha) {
  const opciones = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit'
  };
  return fecha.toLocaleString('es-EC', opciones);
}

/**
 * Formatear solo hora
 */
function formatearHora(fecha) {
  const opciones = { hour: '2-digit', minute: '2-digit' };
  return fecha.toLocaleTimeString('es-EC', opciones);
}

/**
 * Generar reporte de hoy
 */
function generarReporteHoy() {
  const hoy = new Date();
  const fechaStr = Utilities.formatDate(hoy, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const reporte = generarReporteDiario(fechaStr);
  
  // Guardar en una pestaña
  guardarReporteEnSheet(reporte);
  
  SpreadsheetApp.getUi().alert(
    '✅ Reporte Generado',
    `Reporte del ${reporte.resumen.fecha} generado exitosamente.\n\n` +
    `✅ Completos: ${reporte.resumen.completos}\n` +
    `⚠️ Sin FIN: ${reporte.resumen.sinFin}\n` +
    `❓ Sin Registros: ${reporte.resumen.sinRegistros}\n` +
    `🚨 Irregularidades: ${reporte.resumen.irregularidades}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Guardar reporte en una pestaña
 */
function guardarReporteEnSheet(reporte) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const nombreSheet = 'REPORTE_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  // Eliminar sheet anterior si existe
  const sheetExistente = ss.getSheetByName(nombreSheet);
  if (sheetExistente) {
    ss.deleteSheet(sheetExistente);
  }
  
  // Crear nueva sheet
  const sheet = ss.insertSheet(nombreSheet);
  
  let fila = 1;
  
  // Título
  sheet.getRange(fila, 1, 1, 7).merge();
  sheet.getRange(fila, 1).setValue('REPORTE DE CONTROL DE INSPECCIONES VEHICULARES - TELCONET');
  sheet.getRange(fila, 1).setFontSize(14).setFontWeight('bold').setHorizontalAlignment('center');
  fila += 2;
  
  // Resumen
  sheet.getRange(fila, 1).setValue('Fecha:');
  sheet.getRange(fila, 2).setValue(reporte.resumen.fecha);
  fila++;
  sheet.getRange(fila, 1).setValue('Total Placas:');
  sheet.getRange(fila, 2).setValue(reporte.resumen.totalPlacas);
  fila++;
  sheet.getRange(fila, 1).setValue('✅ Completos:');
  sheet.getRange(fila, 2).setValue(`${reporte.resumen.completos} (${reporte.resumen.porcentajeCompletos}%)`);
  fila++;
  sheet.getRange(fila, 1).setValue('⚠️ Sin FIN:');
  sheet.getRange(fila, 2).setValue(`${reporte.resumen.sinFin} (${reporte.resumen.porcentajeSinFin}%)`);
  fila++;
  sheet.getRange(fila, 1).setValue('❓ Sin Registros:');
  sheet.getRange(fila, 2).setValue(`${reporte.resumen.sinRegistros} (${reporte.resumen.porcentajeSinRegistros}%)`);
  fila++;
  sheet.getRange(fila, 1).setValue('🚨 Irregularidades:');
  sheet.getRange(fila, 2).setValue(reporte.resumen.irregularidades);
  fila += 2;
  
  // Tabla: Cumplimiento completo
  if (reporte.completos.length > 0) {
    sheet.getRange(fila, 1).setValue('✅ CUMPLIMIENTO COMPLETO').setFontWeight('bold').setFontSize(12);
    fila++;
    const headersCompletos = ['Placa', 'N° Vehículo', 'Ciudad', 'Turnos', 'Horarios'];
    sheet.getRange(fila, 1, 1, headersCompletos.length).setValues([headersCompletos]).setFontWeight('bold');
    fila++;
    
    reporte.completos.forEach(item => {
      const horarios = item.inicios.map((inicio, i) => `${inicio} - ${item.fines[i]}`).join(', ');
      sheet.getRange(fila, 1, 1, 5).setValues([[
        item.placa,
        item.numeroVehiculo,
        item.ciudad,
        item.turnos,
        horarios
      ]]);
      fila++;
    });
    fila++;
  }
  
  // Tabla: Sin FIN
  if (reporte.sinFin.length > 0) {
    sheet.getRange(fila, 1).setValue('⚠️ SALIERON PERO NO REGISTRARON REGRESO - MEMO REQUERIDO').setFontWeight('bold').setFontSize(12);
    fila++;
    const headersSinFin = ['Placa', 'N° Vehículo', 'Ciudad', 'Último Inicio', 'Responsable', 'Horas Sin FIN'];
    sheet.getRange(fila, 1, 1, headersSinFin.length).setValues([headersSinFin]).setFontWeight('bold');
    fila++;
    
    reporte.sinFin.forEach(item => {
      sheet.getRange(fila, 1, 1, 6).setValues([[
        item.placa,
        item.numeroVehiculo,
        item.ciudad,
        item.ultimoInicio,
        item.responsable,
        item.horasSinFin.toFixed(1) + 'h'
      ]]);
      fila++;
    });
    fila++;
  }
  
  // Tabla: Sin registros
  if (reporte.sinRegistros.length > 0) {
    sheet.getRange(fila, 1).setValue('❓ SIN REGISTROS - VERIFICAR SI SALIERON').setFontWeight('bold').setFontSize(12);
    fila++;
    const headersSinRegistros = ['Placa', 'N° Vehículo', 'Ciudad'];
    sheet.getRange(fila, 1, 1, headersSinRegistros.length).setValues([headersSinRegistros]).setFontWeight('bold');
    fila++;
    
    reporte.sinRegistros.forEach(item => {
      sheet.getRange(fila, 1, 1, 3).setValues([[
        item.placa,
        item.numeroVehiculo,
        item.ciudad
      ]]);
      fila++;
    });
    fila++;
  }
  
  // Tabla: Irregularidades
  if (reporte.irregularidades.length > 0) {
    sheet.getRange(fila, 1).setValue('🚨 IRREGULARIDADES DETECTADAS - INVESTIGAR URGENTE').setFontWeight('bold').setFontSize(12);
    fila++;
    const headersIrregularidades = ['Placa', 'Fecha/Hora', 'Responsables'];
    sheet.getRange(fila, 1, 1, headersIrregularidades.length).setValues([headersIrregularidades]).setFontWeight('bold');
    fila++;
    
    reporte.irregularidades.forEach(item => {
      sheet.getRange(fila, 1, 1, 3).setValues([[
        item.placa,
        item.fechaHora,
        item.responsables.join(', ')
      ]]);
      fila++;
    });
  }
  
  // Ajustar columnas
  sheet.autoResizeColumns(1, 7);
}

/**
 * Enviar reporte por email
 */
function enviarReportePorEmail() {
  const hoy = new Date();
  const fechaStr = Utilities.formatDate(hoy, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const reporte = generarReporteDiario(fechaStr);
  
  const asunto = `📊 Reporte Diario de Inspecciones - ${reporte.resumen.fecha}`;
  const cuerpo = generarEmailHTML(reporte);
  
  CONFIG.EMAIL_DESTINATARIOS.forEach(email => {
    MailApp.sendEmail({
      to: email,
      subject: asunto,
      htmlBody: cuerpo
    });
  });
  
  SpreadsheetApp.getUi().alert(
    '✅ Email Enviado',
    `Reporte enviado exitosamente a: ${CONFIG.EMAIL_DESTINATARIOS.join(', ')}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Generar HTML para email
 */
function generarEmailHTML(reporte) {
  let html = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .header { background: #1e3c72; color: white; padding: 20px; text-align: center; }
        .resumen { background: #f8f9fa; padding: 20px; margin: 20px 0; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th { background: #667eea; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .badge-warning { background: #ffc107; color: #000; padding: 5px 10px; border-radius: 5px; }
        .badge-danger { background: #dc3545; color: white; padding: 5px 10px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚗 Control de Inspecciones Vehiculares</h1>
        <p>Telconet - Control de Activos</p>
      </div>
      
      <div class="resumen">
        <h2>Resumen del ${reporte.resumen.fecha}</h2>
        <p><strong>Total Placas:</strong> ${reporte.resumen.totalPlacas}</p>
        <p>✅ <strong>Cumplimiento Completo:</strong> ${reporte.resumen.completos} (${reporte.resumen.porcentajeCompletos}%)</p>
        <p>⚠️ <strong>Sin FIN:</strong> ${reporte.resumen.sinFin} (${reporte.resumen.porcentajeSinFin}%) - <span class="badge-warning">Requiere memo</span></p>
        <p>❓ <strong>Sin Registros:</strong> ${reporte.resumen.sinRegistros} (${reporte.resumen.porcentajeSinRegistros}%)</p>
        <p>🚨 <strong>Irregularidades:</strong> ${reporte.resumen.irregularidades}</p>
      </div>
  `;
  
  if (reporte.sinFin.length > 0) {
    html += `
      <h2>⚠️ SALIERON PERO NO REGISTRARON REGRESO</h2>
      <table>
        <thead>
          <tr>
            <th>Placa</th>
            <th>N° Vehículo</th>
            <th>Ciudad</th>
            <th>Inicio</th>
            <th>Responsable</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    reporte.sinFin.forEach(item => {
      html += `
        <tr>
          <td><strong>${item.placa}</strong></td>
          <td>${item.numeroVehiculo}</td>
          <td>${item.ciudad}</td>
          <td>${item.ultimoInicio}</td>
          <td>${item.responsable}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
  }
  
  if (reporte.sinRegistros.length > 0) {
    html += `
      <h2>❓ SIN REGISTROS - VERIFICAR SI SALIERON</h2>
      <p>Total: ${reporte.sinRegistros.length} vehículos</p>
    `;
  }
  
  if (reporte.irregularidades.length > 0) {
    html += `
      <h2>🚨 IRREGULARIDADES DETECTADAS</h2>
      <table>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Fecha/Hora</th>
            <th>Responsables</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    reporte.irregularidades.forEach(item => {
      html += `
        <tr>
          <td><strong>${item.placa}</strong></td>
          <td>${item.fechaHora}</td>
          <td>${item.responsables.join(', ')}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
  }
  
  html += `
      <hr>
      <p style="text-align: center; color: #666; font-size: 12px;">
        © 2026 Telconet - Control de Activos<br>
        Este es un reporte automático generado por el sistema
      </p>
    </body>
    </html>
  `;
  
  return html;
}

/**
 * Configurar trigger automático
 */
function configurarTrigger() {
  // Eliminar triggers anteriores
  eliminarTriggers();
  
  // Crear nuevo trigger para las 22:00 diariamente
  ScriptApp.newTrigger('enviarReportePorEmail')
    .timeBased()
    .atHour(CONFIG.HORA_REPORTE_AUTOMATICO)
    .everyDays(1)
    .create();
  
  SpreadsheetApp.getUi().alert(
    '✅ Configuración Exitosa',
    `Reporte automático configurado para ejecutarse diariamente a las ${CONFIG.HORA_REPORTE_AUTOMATICO}:00\n\n` +
    'El reporte se enviará automáticamente por email cada día.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Eliminar todos los triggers
 */
function eliminarTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'enviarReportePorEmail') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}
