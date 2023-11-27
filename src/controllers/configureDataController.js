const ConfigureData = require('../models/configureData');
const responseError = require('../functions/responseError');


const createConfigureData = async (req, res) => {
  try {
    const {
      rendimiento,
      combustible,
      inflacion,
      financiamiento,
      otros,
      sucontrato,
    } = req.body;

    // Desactivar todas las configuraciones existentes que estén activas
    await ConfigureData.updateMany({ status: 'Activo' }, { $set: { status: 'Inactivo' } });

    // Crear la nueva configuración
    const configureData = new ConfigureData({
      rendimiento,
      combustible,
      inflacion,
      financiamiento,
      otros,
      sucontrato,
    });

    const resultado = await configureData.save();

    res.formatResponse('ok', 200, 'ConfigureData registrada con éxito.', resultado);
  } catch (error) {
    await responseError(409,error,res);
  }
};

const getActiveConfigureData = async (req, res) => {
  try {
    const activeConfigureData = await ConfigureData.findOne({ status: 'Activo' });

    if (!activeConfigureData) {
      res.formatResponse('ok', 204, 'No hay ConfigureData activa.', []);
      return;
    }

    // Verificar si ha pasado más de 24 horas
    const tiempoPasado = Date.now() - activeConfigureData.fechaCreacion.getTime();
    const horasPasadas = tiempoPasado / (1000 * 60 * 60);

    if (horasPasadas > 24) {
      // Configuración expirada
      activeConfigureData.status = 'Expirado';
      await activeConfigureData.save();
      res.formatResponse('ok', 409, 'ConfigureData expirada.', []);
    } else {
      res.formatResponse('ok', 200, 'Consulta exitosa', activeConfigureData);
    }
  } catch (error) {
    await responseError(409,error,res);
  }
};

const getConfigureDataById = async (req, res) => {
    try {
      const configureData = await ConfigureData.findById(req.params.id);
  
      if (!configureData) {
        res.formatResponse('ok', 204, 'ConfigureData no encontrada.', []);
        return;
      }
  
      res.formatResponse('ok', 200, 'Consulta exitosa', configureData);
    } catch (error) {
      await responseError(409,error,res);
    }
  };
  
  const updateConfigureData = async (req, res) => {
    try {
      const {
        rendimiento,
        combustible,
        inflacion,
        financiamiento,
        otros,
        sucontrato,
      } = req.body;
  
      const configureDataActualizada = await ConfigureData.findByIdAndUpdate(
        req.params.id,
        {
          rendimiento,
          combustible,
          inflacion,
          financiamiento,
          otros,
          sucontrato,
          fechaActualizacion: new Date(),
        },
        { new: true }
      );
  
      if (!configureDataActualizada) {
        res.formatResponse('ok', 204, 'ConfigureData no encontrada.', []);
        return;
      }
  
      res.formatResponse('ok', 200, 'ConfigureData actualizada con éxito.', configureDataActualizada);
    } catch (error) {
      await responseError(409,error,res);
    }
  };


module.exports = {
  createConfigureData,
  getActiveConfigureData,
  getConfigureDataById,
  updateConfigureData,
};
