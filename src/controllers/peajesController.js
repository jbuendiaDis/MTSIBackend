/* eslint-disable no-underscore-dangle */
const Peajes = require('../models/peajes');
const Gastos = require('../models/gastos');
const responseError = require('../functions/responseError');

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
      await responseError(204,'Registro de gastos no encontrado para las localidades proporcionadas.',res);
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
    res.formatResponse('ok', 200, 'Gastos registrado con éxito.', peajes);
  } catch (error) {
    await responseError(409,error,res);
  }
};


// Controlador para obtener todos los registros de peajes
const getPeajes = async (req, res) => {
  try {
    const peajes = await Peajes.find();
    res.formatResponse('ok', 200, 'Consulta exitosa', peajes);
  } catch (error) {
    await responseError(409,error,res);
  }
};

// Controlador para obtener un registro de peaje por su ID
const getPeajeById = async (req, res) => {
  try {
    const peaje = await Peajes.findById(req.params.id);
    if (!peaje) {
      await responseError(204,'Registro de peaje no encontrado.',res);
    }
    res.formatResponse('ok', 200, 'request success', peaje);
  } catch (error) {
    await responseError(409,error,res);
  }
};

// Controlador para actualizar un registro de peaje por su ID
const updatePeaje = async (req, res) => {
  try {
    const peajeData = req.body;
    const peaje = await Peajes.findByIdAndUpdate(req.params.id, peajeData, { new: true });
    if (!peaje) {
      await responseError(204,'Registro de peaje no encontrado.',res);
    }
    res.formatResponse('ok', 200, 'request success', peaje);
  } catch (error) {
    await responseError(409,error,res);
  }
};

// Controlador para eliminar un registro de peaje por su ID
const deletePeaje = async (req, res) => {
  try {
    //const peaje = await Peajes.findByIdAndRemove(req.params.id);
    const peaje = await Peajes.findByIdAndDelete(req.params.id);
    if (!peaje) {
      return res.formatResponse('ok', 204, 'Peaje no encontrado.', []);
    }
     
    await res.formatResponse('ok', 200, 'Peaje eliminado con éxito.', peaje);
  } catch (error) {
    await responseError(409,error,res);
  }
};

module.exports = {
  createPeaje,
  getPeajes,
  getPeajeById,
  updatePeaje,
  deletePeaje,
};
