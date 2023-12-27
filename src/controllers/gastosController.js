const Gastos = require('../models/gastos');
const Peajes = require('../models/peajes');
const responseError = require('../functions/responseError');

const getDestinationName = require('../functions/getDestinationName');
const getDestinationIdEstado = require('../functions/getDestinationIdEstado');
const getStateName = require('../functions/getStateName');

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
const getGastosConPeajesOld = async (req, res) => {
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


const getGastosConPeajes = async (req, res) => {
  try {
    const gastos = await Gastos.find();

    const gastosConPeajes = await Promise.all(gastos.map(async (gasto) => {
      let nombreOrigen, nombreDestino, idEstadoOrigen, idEstadoDestino;  

      const peajesRelacionados = await Peajes.find({ idgasto: gasto._id });
      const peajesWithDestinationNames = await Promise.all(
        peajesRelacionados.map(async (peaje) => {
          nombreOrigen = await getDestinationName(peaje.localidadOrigen);
          nombreDestino = await getDestinationName(peaje.localidadDestino);
          idEstadoOrigen = await getDestinationIdEstado(peaje.localidadOrigen);
          idEstadoDestino = await getDestinationIdEstado(peaje.localidadDestino);

          console.log("nombreOrigen->", nombreOrigen);
          console.log("nombreDestino->", nombreDestino);
          console.log("idEstadoOrigen->", idEstadoOrigen);
          console.log("idEstadoDestino->", idEstadoDestino);

          return {
            ...peaje.toObject(),
          };
        })
      );

      return {
        ...gasto.toObject(),
        nombreOrigen: nombreOrigen,
        nombreDestino: nombreDestino,
        idEstadoOrigen: idEstadoOrigen,
        idEstadoDestino: idEstadoDestino,
        peajes: peajesWithDestinationNames,
      };
    }));

    res.formatResponse('ok', 200, 'Consulta exitosa', gastosConPeajes);
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
