const Bandera = require('../models/bandera');
const responseError = require('../functions/responseError');

const createBandera = async (req, res) => {
  try {
    console.log("req.body:",req.body)
    const { nombre, descripcion, valor } = req.body;

    // Verificar si ya existe una bandera con el mismo nombre
    const existingBandera = await Bandera.findOne({ nombre });

    if (existingBandera) {
      return res.formatResponse('error', 409, 'Ya existe una bandera con el mismo nombre.', []);
    }

    // Crear y guardar la nueva bandera
    const newBandera = new Bandera({
      nombre,
      descripcion,
      valor,
    });

    const savedBandera = await newBandera.save();

    res.formatResponse('ok', 200, 'Bandera registrada con éxito.', savedBandera);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getAllBanderas = async (req, res) => {
  try {
    const banderas = await Bandera.find();

    if (!banderas || banderas.length === 0) {
      return res.formatResponse('ok', 204, 'No hay banderas registradas.', []);
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', banderas);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getBanderaById = async (req, res) => {
  try {
    const bandera = await Bandera.findById(req.params.id);

    if (!bandera) {
      return res.formatResponse('ok', 204, 'Bandera no encontrada.', []);
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', bandera);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const updateBandera = async (req, res) => {
  try {
    const { nombre, descripcion, valor } = req.body;

    const updatedBandera = await Bandera.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        descripcion,
        valor,
      },
      { new: true }
    );

    if (!updatedBandera) {
      return res.formatResponse('ok', 204, 'Bandera no encontrada.', []);
    }

    res.formatResponse('ok', 200, 'Bandera actualizada con éxito.', updatedBandera);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const deleteBandera = async (req, res) => {
  try {
    const deletedBandera = await Bandera.findByIdAndDelete(req.params.id);

    if (!deletedBandera) {
      return res.formatResponse('ok', 204, 'Bandera no encontrada.', []);
    }

    res.formatResponse('ok', 200, 'Bandera eliminada con éxito.', deletedBandera);
  } catch (error) {
    await responseError(409, error, res);
  }
};

module.exports = {
  createBandera,
  getAllBanderas,
  getBanderaById,
  updateBandera,
  deleteBandera,
};
