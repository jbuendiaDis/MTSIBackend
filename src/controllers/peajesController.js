/* eslint-disable no-underscore-dangle */
const Peajes = require('../models/peajes');
const Gastos = require('../models/gastos');

// Controlador para crear un nuevo registro de peajes
const createPeaje = async (req, res) => {
  try {
    const peajeData = req.body;

    // Buscar el ID de "Gastos" en función de localidadOrigen y localidadDestino
    const gastosQuery = {
      localidadOrigen: peajeData.localidadOrigen,
      localidadDestino: peajeData.localidadDestino,
    };

    const gastos = await Gastos.findOne(gastosQuery);

    if (!gastos) {
      res.status(404).json({ message: 'Registro de gastos no encontrado para las localidades proporcionadas.' });
    }

    peajeData.idgasto = gastos._id; // Asignar el ID de "Gastos" a "idgasto" en "Peajes"
    peajeData.totalPeajes = peajeData.puntos.reduce((total, punto) => total + punto.costo, 0);

    const peaje = new Peajes(peajeData);
    await peaje.save();
    res.status(201).json(peaje);
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
