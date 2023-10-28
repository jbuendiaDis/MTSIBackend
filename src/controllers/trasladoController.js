const Traslado = require('../models/trasladoModel');

// Controlador para crear un nuevo traslado
const createTraslado = async (req, res) => {
  try {
    const { tipoTraslado, concepto, sueldo } = req.body;

    const traslado = new Traslado({
      tipoTraslado,
      concepto,
      sueldo,
    });

    const nuevoTraslado = await traslado.save();
    res.status(201).json(nuevoTraslado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para obtener todos los traslados
const getTraslados = async (req, res) => {
  try {
    const traslados = await Traslado.find();
    res.status(200).json(traslados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para obtener un traslado por su ID
const getTrasladoById = async (req, res) => {
  try {
    const traslado = await Traslado.findById(req.params.id);
    if (!traslado) {
      res.status(404).json({ message: 'Traslado no encontrado.' });
    }
    res.status(200).json(traslado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
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
