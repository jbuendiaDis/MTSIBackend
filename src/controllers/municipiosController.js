// controllers/municipiosController.js
const Municipio = require('../models/Municipio');
const responseError = require('../functions/responseError');

// Obtener todos los municipios
async function getAllMunicipios(req, res) {
  try {
    const municipios = await Municipio.find();
    if (!municipios || municipios.length === 0) {
      await responseError(204, 'No se encontraron municipios.', res);
    }
    res.formatResponse('ok', 200, 'Consulta exitosa', municipios);
  } catch (error) {
    await responseError(409, error, res);
  }
}

// Obtener un municipio por ID
async function getMunicipioById(req, res) {
  try {
    const municipio = await Municipio.findById(req.params.id);
    if (!municipio) {
      await responseError(404, 'Municipio no encontrado.', res);
    }
    res.formatResponse('ok', 200, 'Consulta exitosa', municipio);
  } catch (error) {
    await responseError(409, error, res);
  }
}

// Crear un nuevo municipio
async function createMunicipio(req, res) {
  try {
    const newMunicipio = new Municipio({
      _id: new mongoose.Types.ObjectId(),
      ...req.body,
    });
    const savedMunicipio = await newMunicipio.save();
    res.formatResponse('ok', 201, 'Municipio creado exitosamente', savedMunicipio);
  } catch (error) {
    await responseError(409, error, res);
  }
}

// Actualizar un municipio por ID
async function updateMunicipio(req, res) {
  try {
    const updatedMunicipio = await Municipio.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMunicipio) {
      await responseError(404, 'Municipio no encontrado para actualizar.', res);
    }
    res.formatResponse('ok', 200, 'Municipio actualizado exitosamente', updatedMunicipio);
  } catch (error) {
    await responseError(409, error, res);
  }
}

// Eliminar un municipio por ID
async function deleteMunicipio(req, res) {
  try {
    const deletedMunicipio = await Municipio.findByIdAndRemove(req.params.id);
    if (!deletedMunicipio) {
      await responseError(404, 'Municipio no encontrado para eliminar.', res);
    }
    res.formatResponse('ok', 200, 'Municipio eliminado exitosamente', deletedMunicipio);
  } catch (error) {
    await responseError(409, error, res);
  }
}

// Función para obtener municipios por estado
async function getMunicipiosByEstado(req, res) {
  try {
    const estado = req.params.estado;
    console.log('estado:', estado);

    const municipios = await Municipio.find({ estadoId: parseInt(estado, 10) }, '_id municipio');

    if (municipios.length === 0) {
      return res.formatResponse('ok', 204, 'No se encontraron municipios para el estado proporcionado.', []);
    }

    const resultado = municipios.map(({ _id, municipio }) => ({
      _id,
      nombre: municipio,
    }));

    res.formatResponse('ok', 200, 'Consulta exitosa', resultado);
  } catch (error) {
    console.error(error);
    res.status(409).json({ message: error.message });
  }
}

module.exports = {
  getAllMunicipios,
  getMunicipioById,
  createMunicipio,
  updateMunicipio,
  deleteMunicipio,
  getMunicipiosByEstado,
};
