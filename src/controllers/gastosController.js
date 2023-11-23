const Gastos = require('../models/gastos');
const Peajes = require('../models/peajes');

// Controlador para crear un nuevo registro de gastos
const createGastos = async (req, res) => {
  try {
    const gastosData = req.body;
    const gastos = new Gastos(gastosData);
    await gastos.save();
    res.status(201).json(gastos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para obtener todos los registros de gastos
const getGastos = async (req, res) => {
  try {
    const gastos = await Gastos.find();
    res.status(200).json(gastos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para obtener un registro de gastos por su ID
const getGastosById = async (req, res) => {
  try {
    const gastos = await Gastos.findById(req.params.id);
    if (!gastos) {
      res.status(404).json({ message: 'Registro de gastos no encontrado.' });
    }
    res.status(200).json(gastos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

const getGastosConPeajes = async (req, res) => {
  try {
    const gastos = await Gastos.find();

    for (const gasto of gastos) {
      const peajesRelacionados = await Peajes.find({ idgasto: gasto._id });
      gasto.peajes = peajesRelacionados;
    }

    res.status(200).json(gastos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

module.exports = {
  getGastosConPeajes,
};

// Controlador para actualizar un registro de gastos por su ID
const updateGastos = async (req, res) => {
  try {
    const gastosData = req.body;
    const gastos = await Gastos.findByIdAndUpdate(req.params.id, gastosData, { new: true });
    if (!gastos) {
      res.status(404).json({ message: 'Registro de gastos no encontrado.' });
    }
    res.status(200).json(gastos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para eliminar un registro de gastos por su ID
const deleteGastos = async (req, res) => {
  try {
    const gastos = await Gastos.findByIdAndRemove(req.params.id);
    if (!gastos) {
      res.status(404).json({ message: 'Registro de gastos no encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
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
