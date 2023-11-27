const Rendimientos = require('../models/rednimiento');
const generateUUID = require('../utils/generateUUID');
const logAuditEvent = require('../utils/auditLogger');
const responseError = require('../functions/responseError');

const crearRendimiento = async (req, res) => {
  try {
    const nuevoRendimiento = new Rendimientos(req.body);
    const rendimientoGuardado = await nuevoRendimiento.save();
    res.status(201).json(rendimientoGuardado);
  } catch (error) {
    await responseError(409,error,res);
  }
};

// Obtener todos los rendimientos
const obtenerRendimientos = async (req, res) => {
  try {
    const rendimientos = await Rendimientos.find();
    res.formatResponse('ok', 200, 'Consulta exitosa', rendimientos);
  } catch (error) {
    await responseError(409,error,res);
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
    res.formatResponse('ok', 200, 'Consulta exitosa', rendimiento);
  } catch (error) {
    await responseError(409,error,res);
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
    await responseError(409,error,res);
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
    await responseError(409,error,res);
  }
};

module.exports = {
  crearRendimiento,
  obtenerRendimientos,
  obtenerRendimientoPorId,
  actualizarRendimiento,
  eliminarRendimiento,
};
