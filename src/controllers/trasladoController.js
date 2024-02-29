const Traslado = require('../models/trasladoModel');
const responseError = require('../functions/responseError');

// Controlador para crear un nuevo traslado
const createTraslado = async (req, res) => {
  try {
    const { tipoTraslado, concepto, sueldo } = req.body;

    if (!tipoTraslado || !concepto || !sueldo) {
      // res.formatResponse('ok', 204, 'Faltan campos obligatorios', []);
      await responseError(204, 'Faltan campos obligatorios', res);
      return;
    }

    const traslado = new Traslado({
      tipoTraslado,
      concepto,
      sueldo,
    });

    const nuevoTraslado = await traslado.save();
    res.formatResponse('ok', 200, 'Traslado registrado con éxito.', nuevoTraslado);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para obtener todos los traslados
const getTraslados = async (req, res) => {
  try {
    const traslado = await Traslado.find().select('-__v');
    if (traslado.length > 0) {
      res.formatResponse('ok', 200, 'Consulta exitosa', traslado);
    } else {
      await responseError(204, 'Traslado no encontrado', res);
    }
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para obtener un traslado por su ID
const getTrasladoById = async (req, res) => {
  try {
    const traslado = await Traslado.findById(req.params.id);
    if (!traslado) {
      await responseError(204, 'Traslado no encontrado', res);
      return;
    }
    res.formatResponse('ok', 200, 'Consulta exitosa', traslado);
  } catch (error) {
    await responseError(409, error, res);
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
      res.status(204).json({ message: 'Traslado no encontrado.' });
    }
    res.formatResponse('ok', 200, 'Actualización exitosa', traslado);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para eliminar un traslado por su ID
const deleteTraslado = async (req, res) => {
  try {
    const traslado = await Traslado.findByIdAndRemove(req.params.id);
    if (!traslado) {
      res.status(204).json({ message: 'Traslado no encontrado.' });
    }
    // res.status(204).send();
    res.formatResponse('ok', 200, 'Traslado eliminado', traslado);
  } catch (error) {
    await responseError(409, error, res);
  }
};

module.exports = {
  createTraslado,
  getTraslados,
  getTrasladoById,
  updateTraslado,
  deleteTraslado,
};
