/* eslint-disable no-underscore-dangle */
const Peajes = require('../models/peajes');
const Gastos = require('../models/gastos');
const responseError = require('../functions/responseError');
const getDestinationName = require('../functions/getDestinationName');
const getDestinationIdEstado = require('../functions/getDestinationIdEstado');
const getStateName = require('../functions/getStateName');

const createPeaje = async (req, res) => {
  try {
    const {
      localidadOrigen,
      localidadDestino,
      kms,
      tipoUnidad,
      puntos,
    } = req.body;

    // Verificar si ya existe un peaje con los mismos datos
    const existingPeaje = await Peajes.findOne({
      localidadOrigen,
      localidadDestino,
      tipoUnidad,
    });

    if (existingPeaje) {
      res.formatResponse('error', 204, 'Ya existe un peaje con los mismos datos.', []);
      return;
    }

    const totalPeajes = puntos.reduce((total, punto) => total + punto.costo, 0);

    const peajes = new Peajes({
      //idgasto: gastos._id,
      localidadOrigen,
      localidadDestino,
      kms,
      tipoUnidad,
      puntos,
      totalPeajes,
    });

    await peajes.save();
    res.formatResponse('ok', 200, 'Ruta registrada con éxito.', peajes);
  } catch (error) {
    await responseError(409, error, res);
  }
};


const getPeajes = async (req, res) => {
  try {
    const peajes = await Peajes.find();

    // Agrega los nombres de origen y destino al resultado
    const peajesWithDestinationNames = await Promise.all(
      peajes.map(async (peaje) => {
        const nombreOrigen = await getDestinationName(peaje.localidadOrigen);
        const nombreDestino = await getDestinationName(peaje.localidadDestino);

        const idEstadoOrigen = await getDestinationIdEstado(peaje.localidadOrigen);
        const idEstadoDestino = await getDestinationIdEstado(peaje.localidadDestino);

        const estadoNombreOrigen = await getStateName(idEstadoOrigen);
        const estadoNombreDestino = await getStateName(idEstadoDestino);

        getDestinationIdEstado

        return {
          ...peaje.toObject(),
          nombreOrigen,
          nombreDestino,
          idEstadoOrigen,
          idEstadoDestino,
          estadoNombreOrigen,
          estadoNombreDestino
        };
      }),
    );

    res.formatResponse('ok', 200, 'Consulta exitosa', peajesWithDestinationNames);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para obtener un registro de peaje por su ID
const getPeajeById = async (req, res) => {
  try {
    const peaje = await Peajes.findById(req.params.id);

    if (!peaje) {
      await responseError(204, 'Registro de peaje no encontrado.', res);
    }

    const nombreOrigen = await getDestinationName(peaje.localidadOrigen);
    const nombreDestino = await getDestinationName(peaje.localidadDestino);
    const idEstadoOrigen = await getDestinationIdEstado(peaje.localidadOrigen);
    const idEstadoDestino = await getDestinationIdEstado(peaje.localidadDestino);

    const peajeWithDestinationNames = {
      ...peaje.toObject(),
      nombreOrigen,
      nombreDestino,
      idEstadoOrigen,
      idEstadoDestino,
    };

    res.formatResponse('ok', 200, 'request success', peajeWithDestinationNames);
  } catch (error) {
    await responseError(409, error, res);
  }
};


// Controlador para actualizar un registro de peaje por su ID
const updatePeaje = async (req, res) => {
  try {
    const peajeData = req.body;
    const peaje = await Peajes.findByIdAndUpdate(req.params.id, peajeData, { new: true });
    if (!peaje) {
      await responseError(204, 'Registro de peaje no encontrado.', res);
    }
    res.formatResponse('ok', 200, 'request success', peaje);
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Controlador para eliminar un registro de peaje por su ID
const deletePeaje = async (req, res) => {
  console.info('ID a borrar', req.params.id);
  try {
    // const peaje = await Peajes.findByIdAndRemove(req.params.id);
    const peaje = await Peajes.findByIdAndDelete(req.params.id);
    if (!peaje) {
      res.formatResponse('ok', 204, 'Peaje no encontrado.', []);
    }

    await res.formatResponse('ok', 200, 'Peaje eliminado con éxito.', peaje);
  } catch (error) {
    await responseError(409, error, res);
  }
};


const GastosModel = require('../models/gastos'); // Asume que este es tu modelo de gastos
 
const listarRutasSinGasto_old = async (req, res) => {
  try {
    // Obtener todos los IDs de ruta que están ligados a algún gasto
    const gastos = await GastosModel.find().select('rutaId -_id');
    const rutaIdsConGasto = gastos.map(gasto => gasto.rutaId);

    // Buscar todas las rutas que NO están en la lista de IDs obtenida
    const rutasSinGasto = await Peajes.find({
      _id: { $nin: rutaIdsConGasto }
    });

    res.formatResponse('ok', 200, 'Rutas sin gastos encontradas', rutasSinGasto);
  } catch (error) {
    console.error('Error al buscar rutas sin gastos:', error);
    // Asume que responseError es una función de manejo de errores
    await responseError(409, error, res);
  }
};


const listarRutasSinGasto = async (req, res) => {
  try {
    // Obtener todos los IDs de ruta que están ligados a algún gasto
    const gastos = await GastosModel.find().select('rutaId -_id');
    const rutaIdsConGasto = gastos.map(gasto => gasto.rutaId);

    // Buscar todas las rutas que NO están en la lista de IDs obtenida
    let rutasSinGasto = await Peajes.find({
      _id: { $nin: rutaIdsConGasto }
    });

    // Enriquecer cada ruta con nombreOrigen y nombreDestino
    rutasSinGasto = await Promise.all(rutasSinGasto.map(async (ruta) => {
      const nombreOrigen = await getDestinationName(ruta.localidadOrigen);
      const nombreDestino = await getDestinationName(ruta.localidadDestino);
      
      return {
        ...ruta.toObject(), // Asume que ruta es un documento de Mongoose y necesitas convertirlo a objeto
        nombreOrigen,
        nombreDestino,
      };
    }));

    res.formatResponse('ok', 200, 'Rutas sin gastos encontradas', rutasSinGasto);
  } catch (error) {
    console.error('Error al buscar rutas sin gastos:', error);
    // Asume que responseError es una función de manejo de errores
    await responseError(409, error, res);
  }
};


module.exports = {
  createPeaje,
  getPeajes,
  getPeajeById,
  updatePeaje,
  deletePeaje,
  listarRutasSinGasto,
};
