const Quote = require('../models/quotes'); // Asegúrate de importar el modelo adecuadamente.

// Controlador para crear un nuevo registro
const generateUUID = require('../utils/generateUUID');
const logAuditEvent = require('../utils/auditLogger');
const enviarCorreo = require('../functions/sendMail');
// Controlador para crear un nuevo traslado
const createData = async (req, res) => {
  try {
    const { origen, destino, total } = req.body;

    if (!origen || !destino || !total) {
      res.formatResponse('ok', 204, 'Faltan campos obligatorios', []);
      return;
    }

    const quote = new Quote({ ...req.body });

    const newQuote = await quote.save();
    res.formatResponse('ok', 200, 'Cotizacion registrada con éxito.', newQuote);
  } catch (error) {
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

async function sendCotizacion(req, res) {
  try {
    const quotesData = await Quote.find();
    console.log(quotesData);
    await enviarCorreo(quotesData);
    res.formatResponse('ok', 200, 'se evnio la contizacion', []);
  } catch (error) {
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
}

// Controlador para obtener todos los registros
async function getAllData(req, res) {
  try {
    const quotesData = await Quote.find();
    res.formatResponse('ok', 200, 'request Success', quotesData);
  } catch (error) {
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
}

// Controlador para obtener un registro por ID
async function getDataById(req, res) {
  const { id } = req.params;
  try {
    const data = await Quote.findById(id);
    if (!data) {
      res.formatResponse('no Found', 204, 'Data not found', []);
    } else {
      res.formatResponse('ok', 200, 'Registro recuperado exitosamente', data);
    }
  } catch (error) {
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
}

// Controlador para actualizar un registro por ID
async function updateData(req, res) {
  const { id } = req.params;
  try {
    const updatedData = await Quote.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedData) {
      res.formatResponse('not found', 204, 'Registro no encontrado', []);
    } else {
      res.formatResponse('ok', 200, 'Registro actualizado exitosamente', updatedData);
    }
  } catch (error) {
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
}

// Controlador para eliminar un registro por ID
async function deleteData(req, res) {
  const { id } = req.params;
  try {
    const deletedData = await Quote.findByIdAndRemove(id);
    if (!deletedData) {
      res.formatResponse('not found', 204, 'Registro no encontrado');
    } else {
      res.formatResponse('ok', 200, 'Registro eliminado exitosamente', []);
    }
  } catch (error) {
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
}

module.exports = {
  createData,
  getAllData,
  getDataById,
  updateData,
  deleteData,
  sendCotizacion,
};
