// En "utils/auditLogger.js"

const Audit = require('../models/audit'); // Asegúrate de ajustar la ruta según la ubicación real del modelo

async function logAuditEvent(uuid, errorDescription) {
  try {
    const auditEvent = new Audit({
      uuid,
      errorDescription,
    });

    const savedAudit = await auditEvent.save();

    console.log('Registro de auditoría guardado con éxito:', savedAudit);
  } catch (error) {
    console.error('Error al guardar el registro de auditoría:', error);
  }
}

module.exports = logAuditEvent;
