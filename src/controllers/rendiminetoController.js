const Rendimientos = require('../models/rednimiento');

const crearRendimiento = async (req, res) => {
  try {
    const nuevoRendimiento = new Rendimientos(req.body);
    const rendimientoGuardado = await nuevoRendimiento.save();
    res.status(201).json(rendimientoGuardado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el rendimiento.' });
  }
};

// Obtener todos los rendimientos
const obtenerRendimientos = async (req, res) => {
  try {
    const rendimientos = await Rendimientos.find();
    res.status(200).json(rendimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los rendimientos.' });
  }
};

// Obtener un rendimiento por ID
const obtenerRendimientoPorId = async (req, res) => {
  const rendimientoId = req.params.id;
  try {
    const rendimiento = await Rendimientos.findById(rendimientoId);
    if (!rendimiento) {
      res.status(404).json({ message: 'Rendimiento no encontrado.' });
    }
    res.status(200).json(rendimiento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el rendimiento.' });
  }
};

// Actualizar un rendimiento por ID
const actualizarRendimiento = async (req, res) => {
  const rendimientoId = req.params.id;
  try {
    const rendimientoActualizado = await
    Rendimientos.findByIdAndUpdate(rendimientoId, req.body, { new: true });
    if (!rendimientoActualizado) {
      res.status(404).json({ message: 'Rendimiento no encontrado.' });
    }
    res.status(200).json(rendimientoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el rendimiento.' });
  }
};

// Eliminar un rendimiento por ID
const eliminarRendimiento = async (req, res) => {
  const rendimientoId = req.params.id;
  try {
    const rendimientoEliminado = await Rendimientos.findByIdAndRemove(rendimientoId);
    if (!rendimientoEliminado) {
      res.status(404).json({ message: 'Rendimiento no encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el rendimiento.' });
  }
};

module.exports = {
  crearRendimiento,
  obtenerRendimientos,
  obtenerRendimientoPorId,
  actualizarRendimiento,
  eliminarRendimiento,
};
