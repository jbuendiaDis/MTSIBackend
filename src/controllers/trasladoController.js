const Traslado = require('../models/trasladoModel');

const generateUUID = require('../utils/generateUUID');
const logAuditEvent = require('../utils/auditLogger');
// Controlador para crear un nuevo traslado
const createTraslado = async (req, res) => {
  try {
    const { tipoTraslado, concepto, sueldo } = req.body;

    if (!tipoTraslado || !concepto || !sueldo) {
      res.formatResponse('ok', 204, 'Faltan campos obligatorios', []);
      return;
    }

    const traslado = new Traslado({
      tipoTraslado,
      concepto,
      sueldo,
    });

    const nuevoTraslado = await traslado.save();
    res.formatResponse('ok', 200, 'Usuario registrado con éxito.', nuevoTraslado);
  } catch (error) {
    console.error(error);
    const uuid = generateUUID();
    const errorDescription = error;
    logAuditEvent(uuid, errorDescription);
    res.formatResponse(
      'ok',
      409,
      `Algo ocurrio favor de reportar al area de sistemas con el siguiente folio ${uuid}`,
      errorDescription,
    );
  }
};

// Controlador para obtener todos los traslados
const getTraslados = async (req, res) => {
  try {
    const traslado = await Traslado.find().select('-__v');
    if (traslado.length > 0) {
      res.formatResponse('ok', 200, 'request success', traslado);
    } else {
      res.formatResponse('ok', 204, 'data not found', []);
    }
  } catch (error) {
    const uuid = generateUUID();
    await logAuditEvent(uuid, error);
    res.formatResponse(
      'ok',
      409,
      `Algo ocurrio favor de reportar al area de sistemas con el siguiente folio ${uuid}`,
      [],
    );
  }
};

// Controlador para obtener un traslado por su ID
const getTrasladoById = async (req, res) => {
  try {
    const traslado = await Traslado.findById(req.params.id);
    if (!traslado) {
      res.formatResponse('ok', 204, 'data not found', []);
      return;
    }
    res.formatResponse('ok', 200, 'request success', traslado);
  } catch (error) {
    const uuid = generateUUID();
    await logAuditEvent(uuid, error);
    res.formatResponse(
      'ok',
      409,
      `Algo ocurrio favor de reportar al area de sistemas con el siguiente folio ${uuid}`,
      [],
    );
  }
};

// Controlador para actualizar un traslado por su ID
const updateTraslado = async (req, res) => {
  try {
    const { tipoTraslado, concepto, sueldo } = req.body;

    const traslado = await Traslado.findByIdAndUpdate(
      req.params.id,
      { tipoTraslado, concepto, sueldo },
      { new: true },
    );

    if (!traslado) {
      res.status(404).json({ message: 'Traslado no encontrado.' });
    }
    res.status(200).json(traslado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para eliminar un traslado por su ID
const deleteTraslado = async (req, res) => {
  try {
    const traslado = await Traslado.findByIdAndRemove(req.params.id);
    if (!traslado) {
      res.status(404).json({ message: 'Traslado no encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

module.exports = {
  createTraslado,
  getTraslados,
  getTrasladoById,
  updateTraslado,
  deleteTraslado,
};
