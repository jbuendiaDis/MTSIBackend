/* eslint-disable no-underscore-dangle */
const Peajes = require('../models/peajes');
const Gastos = require('../models/gastos');

// Controlador para crear un nuevo registro de peajes
const createPeaje = async (req, res) => {
  try {
    const {
      localidadOrigen,
      localidadDestino,
      kms,
      tipoUnidad,
      puntos,
    } = req.body;

    const gastosQuery = {
      localidadOrigen,
      localidadDestino,
    };

    const gastos = await Gastos.findOne(gastosQuery);

    if (!gastos) {
      res.formatResponse('ok', 404, 'Registro de gastos no encontrado para las localidades proporcionadas.', []);
      return;
    }

    const totalPeajes = puntos.reduce((total, punto) => total + punto.costo, 0);

    const peajes = new Peajes({
      idgasto: gastos._id,
      localidadOrigen,
      localidadDestino,
      kms,
      tipoUnidad,
      puntos,
      totalPeajes,
    });

 
    await peajes.save();
    res.status(201).json(peajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};


// Controlador para obtener todos los registros de peajes
const getPeajes = async (req, res) => {
  try {
    const peajes = await Peajes.find();
    res.status(200).json(peajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para obtener un registro de peaje por su ID
const getPeajeById = async (req, res) => {
  try {
    const peaje = await Peajes.findById(req.params.id);
    if (!peaje) {
      res.status(404).json({ message: 'Registro de peaje no encontrado.' });
    }
    res.status(200).json(peaje);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para actualizar un registro de peaje por su ID
const updatePeaje = async (req, res) => {
  try {
    const peajeData = req.body;
    const peaje = await Peajes.findByIdAndUpdate(req.params.id, peajeData, { new: true });
    if (!peaje) {
      res.status(404).json({ message: 'Registro de peaje no encontrado.' });
    }
    res.status(200).json(peaje);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

// Controlador para eliminar un registro de peaje por su ID
const deletePeaje = async (req, res) => {
  try {
    const peaje = await Peajes.findByIdAndRemove(req.params.id);
    if (!peaje) {
      res.status(404).json({ message: 'Registro de peaje no encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

module.exports = {
  createPeaje,
  getPeajes,
  getPeajeById,
  updatePeaje,
  deletePeaje,
};
