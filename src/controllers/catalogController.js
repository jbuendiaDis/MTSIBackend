const Catalog = require('../models/catalog');
const responseError = require('../functions/responseError');

const createCatalog = async (req, res) => {
  try {
    const { descripcion, idPadre, codigo } = req.body;

    // Verificar si el elemento padre existe
    if (idPadre) {
      const padre = await Catalog.findById(idPadre);
      if (!padre) {
        res.formatResponse('error', 404, 'Elemento padre no encontrado.', []);
      }
    }

    const newCatalog = new Catalog({
      codigo,
      descripcion,
      idPadre,
    });

    const resultado = await newCatalog.save();

    res.formatResponse('ok', 200, 'Elemento de catálogo registrado con éxito.', resultado);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getAllCatalogs = async (req, res) => {
  try {
    const catalogs = await Catalog.find();

    if (!catalogs || catalogs.length === 0) {
      res.formatResponse('ok', 204, 'No hay elementos en el catálogo.', []);
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', catalogs);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getCatalogById = async (req, res) => {
  try {
    const catalog = await Catalog.findById(req.params.id);

    if (!catalog) {
      res.formatResponse('ok', 204, 'Elemento de catálogo no encontrado.', []);
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', catalog);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const updateCatalog = async (req, res) => {
  try {
    const { codigo, descripcion, idPadre } = req.body;

    // Verificar si el elemento padre existe
    if (idPadre) {
      const padre = await Catalog.findById(idPadre);
      if (!padre) {
        res.formatResponse('error', 404, 'Elemento padre no encontrado.', []);
      }
    }

    const updatedCatalog = await Catalog.findByIdAndUpdate(
      req.params.id,
      {
        codigo,
        descripcion,
        idPadre,
        fechaActualizacion: new Date(),
      },
      { new: true },
    );

    if (!updatedCatalog) {
      res.formatResponse('ok', 204, 'Elemento de catálogo no encontrado.', []);
    }

    res.formatResponse('ok', 200, 'Elemento de catálogo actualizado con éxito.', updatedCatalog);
  } catch (error) {
    await responseError(409, error, res);
  }
};

const getAllChildrenByParentId = async (req, res) => {
  try {
    const parentId = req.params.id;

    // Busca todos los hijos del padre en base al idPadre
    const children = await Catalog.find({ idPadre: parentId });

    if (!children || children.length === 0) {
      res.formatResponse('ok', 204, 'No hay hijos para el padre especificado.', []);
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', children);
  } catch (error) {
    await responseError(409, error, res);
  }
};

module.exports = {
  createCatalog,
  getAllCatalogs,
  getCatalogById,
  updateCatalog,
  getAllChildrenByParentId,
};
