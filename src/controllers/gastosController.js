const Gastos = require('../models/gastos');
const Peajes = require('../models/peajes');
const responseError = require('../functions/responseError');

// Controlador para crear un nuevo registro de gastos
const createGastos = async (req, res) => {
  try {
    const gastosData = req.body;
    const gastos = new Gastos(gastosData);
    await gastos.save();
    res.formatResponse('ok', 200, 'Consulta exitosa', gastos);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para obtener todos los registros de gastos
const getGastos = async (req, res) => {
  try {
    const gastos = await Gastos.find();
    res.formatResponse('ok', 200, 'Consulta exitosa', gastos);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para obtener un registro de gastos por su ID
const getGastosById = async (req, res) => {
  try {
    const gastos = await Gastos.findById(req.params.id);
    if (!gastos) {
      await responseError(204, 'Registro de gastos no encontrado.', res);
    }
    res.formatResponse('ok', 200, 'Consulta exitosa', gastos);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador gastos con peages
const getGastosConPeajes = async (req, res) => {
  try {
    const gastos = await Gastos.find();

    for (const gasto of gastos) {
      const peajesRelacionados = await Peajes.find({ idgasto: gasto._id });
      gasto.peajes = peajesRelacionados;
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', gastos);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para actualizar un registro de gastos por su ID
const updateGastos = async (req, res) => {
  try {
    const gastosData = req.body;
    const gastos = await Gastos.findByIdAndUpdate(req.params.id, gastosData, { new: true });
    if (!gastos) {
      return await responseError(204, 'Registro de gastos no encontrado.', res);
    }
    res.formatResponse('ok', 200, 'Consulta exitosa', gastos);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para eliminar un registro de gastos por su ID
const deleteGastos = async (req, res) => {
  try {
    const gastos = await Gastos.findByIdAndRemove(req.params.id);
    if (!gastos) {
      return await responseError(204, 'Registro de gastos no encontrado.', res);
    }
    res.formatResponse('ok', 200, 'Consulta exitosa', gastos);
  } catch (error) {
    await responseError(409, error, res);
  }
};

module.exports = {
  createGastos,
  getGastos,
  getGastosById,
  updateGastos,
  deleteGastos,
  getGastosConPeajes,
};
