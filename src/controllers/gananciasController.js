// controllers/gananciaController.js
const Ganancia = require('../models/ganancias');
const generateUUID = require('../utils/generateUUID');
const logAuditEvent = require('../utils/auditLogger');

const createGanancia = async (req, res) => {
  try {
    const { desde, hasta, ganancia } = req.body;

    if (!desde || !hasta || !ganancia) {
      res.formatResponse('ok', 204, 'Faltan campos obligatorios', []);
      return;
    }

    const nuevaGanancia = new Ganancia({
      desde,
      hasta,
      ganancia,
    });

    const resultado = await nuevaGanancia.save();

    res.formatResponse('ok', 200, 'Ganancia registrada con éxito.', resultado);
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

const getGanancias = async (req, res) => {
  try {
    const ganancias = await Ganancia.find().select('-__v');
    if (ganancias.length > 0) {
      res.formatResponse('ok', 200, 'Consulta exitosa', ganancias);
    } else {
      res.formatResponse('ok', 204, 'No se encontraron ganancias', []);
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

const updateGanancia = async (req, res) => {
    try {
      const { desde, hasta, ganancia } = req.body;
  
      if (!desde || !hasta || !ganancia) {
        res.formatResponse('ok', 204, 'Faltan campos obligatorios', []);
        return;
      }
  
      const gananciaActualizada = await Ganancia.findByIdAndUpdate(
        req.params.id,
        {
          desde,
          hasta,
          ganancia,
          fechaActualizacion: new Date(),
        },
        { new: true }
      );
  
      if (!gananciaActualizada) {
        res.formatResponse('ok', 204, 'Ganancia no encontrada.', []);
        return;
      }
  
      res.formatResponse('ok', 200, 'Ganancia actualizada con éxito.', gananciaActualizada);
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

const getGananciaById = async (req, res) => {
    try {
      const ganancia = await Ganancia.findById(req.params.id);
  
      if (!ganancia) {
        res.formatResponse('ok', 204, 'Ganancia no encontrada.', []);
        return;
      }
  
      res.formatResponse('ok', 200, 'Consulta exitosa', ganancia);
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

module.exports = {
  createGanancia,
  getGanancias,
  updateGanancia,
  getGananciaById,
};
