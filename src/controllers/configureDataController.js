const ConfigureData = require('../models/configureData');
const generateUUID = require('../utils/generateUUID');
const logAuditEvent = require('../utils/auditLogger');

const createConfigureData = async (req, res) => {
  try {
    const {
      rendimiento,
      combustible,
      inflacion,
      financiamiento,
      otros,
      sucontrato,
    } = req.body;

    const configureData = new ConfigureData({
      rendimiento,
      combustible,
      inflacion,
      financiamiento,
      otros,
      sucontrato,
    });

    const resultado = await configureData.save();

    res.formatResponse('ok', 200, 'ConfigureData registrada con éxito.', resultado);
  } catch (error) {
    const uuid = generateUUID();
    const errorDescription = error;
    logAuditEvent(uuid, errorDescription);
    res.formatResponse(
      'ok',
      409,
      `Algo ocurrió, por favor, reporta al área de sistemas con el siguiente folio ${uuid}`,
      errorDescription,
    );
  }
};

const getActiveConfigureData = async (req, res) => {
  try {
    const activeConfigureData = await ConfigureData.findOne({ status: 'Activo' });

    if (!activeConfigureData) {
      res.formatResponse('ok', 204, 'No hay ConfigureData activa.', []);
      return;
    }

    // Verificar si ha pasado más de 24 horas
    const tiempoPasado = Date.now() - activeConfigureData.fechaCreacion.getTime();
    const horasPasadas = tiempoPasado / (1000 * 60 * 60);

    if (horasPasadas > 24) {
      // Configuración expirada
      activeConfigureData.status = 'Expirado';
      await activeConfigureData.save();
      res.formatResponse('ok', 409, 'ConfigureData expirada.', []);
    } else {
      res.formatResponse('ok', 200, 'Consulta exitosa', activeConfigureData);
    }
  } catch (error) {
    const uuid = generateUUID();
    await logAuditEvent(uuid, error);
    res.formatResponse(
      'ok',
      409,
      `Algo ocurrió, por favor, reporta al área de sistemas con el siguiente folio ${uuid}`,
      [],
    );
  }
};

const getConfigureDataById = async (req, res) => {
    try {
      const configureData = await ConfigureData.findById(req.params.id);
  
      if (!configureData) {
        res.formatResponse('ok', 204, 'ConfigureData no encontrada.', []);
        return;
      }
  
      res.formatResponse('ok', 200, 'Consulta exitosa', configureData);
    } catch (error) {
      const uuid = generateUUID();
      await logAuditEvent(uuid, error);
      res.formatResponse(
        'ok',
        409,
        `Algo ocurrió, por favor, reporta al área de sistemas con el siguiente folio ${uuid}`,
        [],
      );
    }
  };
  
  const updateConfigureData = async (req, res) => {
    try {
      const {
        rendimiento,
        combustible,
        inflacion,
        financiamiento,
        otros,
        sucontrato,
      } = req.body;
  
      const configureDataActualizada = await ConfigureData.findByIdAndUpdate(
        req.params.id,
        {
          rendimiento,
          combustible,
          inflacion,
          financiamiento,
          otros,
          sucontrato,
          fechaActualizacion: new Date(),
        },
        { new: true }
      );
  
      if (!configureDataActualizada) {
        res.formatResponse('ok', 204, 'ConfigureData no encontrada.', []);
        return;
      }
  
      res.formatResponse('ok', 200, 'ConfigureData actualizada con éxito.', configureDataActualizada);
    } catch (error) {
      const uuid = generateUUID();
      const errorDescription = error;
      logAuditEvent(uuid, errorDescription);
      res.formatResponse(
        'ok',
        409,
        `Algo ocurrió, por favor, reporta al área de sistemas con el siguiente folio ${uuid}`,
        errorDescription,
      );
    }
  };


module.exports = {
  createConfigureData,
  getActiveConfigureData,
  getConfigureDataById,
  updateConfigureData,
};
