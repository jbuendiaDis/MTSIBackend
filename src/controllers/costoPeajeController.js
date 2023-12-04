// controllers/costoPeajeController.js
const CostoPeaje = require('../models/costoPeaje');
const responseError = require('../functions/responseError');

const createCostoPeaje = async (req, res) => {
  try {
    const { estadoId, nombreCaseta, monto } = req.body;

    const costoPeaje = new CostoPeaje({
      estadoId,
      nombreCaseta,
      monto,
    });

    const resultado = await costoPeaje.save();

    res.formatResponse('ok', 200, 'CostoPeaje registrado con éxito.', resultado);
  } catch (error) {
    await responseError(409,error,res);
  }
};

const getCostoPeajes = async (req, res) => {
  try {
    const costoPeajes = await CostoPeaje.find().select('-__v');
    if (costoPeajes.length > 0) {
      res.formatResponse('ok', 200, 'Consulta exitosa', costoPeajes);
    } else {
      res.formatResponse('ok', 204, 'No se encontraron datos', []);
    }
  } catch (error) {
    await responseError(409,error,res);
  }
};

const getCostoPeajeById = async (req, res) => {
  try {
    const costoPeaje = await CostoPeaje.findById(req.params.id);
    if (!costoPeaje) {
      res.formatResponse('ok', 204, 'CostoPeaje no encontrado.', []);
      return;
    }
    res.formatResponse('ok', 200, 'Consulta exitosa', costoPeaje);
  } catch (error) {
    await responseError(409,error,res);
  }
};

const updateCostoPeaje = async (req, res) => {
  try {
    const { estadoId, nombreCaseta, monto } = req.body;

    const costoPeajeActualizado = await CostoPeaje.findByIdAndUpdate(
      req.params.id,
      {
        estadoId,
        nombreCaseta,
        monto,
        fechaActualizacion: new Date(),
      },
      { new: true }
    );

    if (!costoPeajeActualizado) {
      res.formatResponse('ok', 204, 'CostoPeaje no encontrado.', []);
      return;
    }

    res.formatResponse('ok', 200, 'CostoPeaje actualizado con éxito.', costoPeajeActualizado);
  } catch (error) {
    await responseError(409,error,res);
  }
};

const deleteCostoPeaje = async (req, res) => {
  try {
    const costoPeaje = await CostoPeaje.findByIdAndRemove(req.params.id);
    if (!costoPeaje) {
      res.formatResponse('ok', 204, 'CostoPeaje no encontrado.', []);
    }
    res.formatResponse('ok', 200, 'CostoPeaje eliminado con éxito', [{ deleteID: req.params.id }]);
  } catch (error) {
    await responseError(409,error,res);
  }
};

module.exports = {
  createCostoPeaje,
  getCostoPeajes,
  getCostoPeajeById,
  updateCostoPeaje,
  deleteCostoPeaje,
};
