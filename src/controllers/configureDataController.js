const ConfigureData = require('../models/configureData');
const responseError = require('../functions/responseError');

/**
 * @swagger
 * tags:
 *   name: ConfigureData
 *   description: Operaciones relacionadas con la configuración de datos
 */

/**
 * @swagger
 * /api/configuredata:
 *   post:
 *     summary: Crear nueva ConfigureData
 *     tags: [ConfigureData]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rendimiento:
 *                 type: number
 *               combustible:
 *                 type: number
 *               inflacion:
 *                 type: number
 *               financiamiento:
 *                 type: number
 *               otros:
 *                 type: number
 *               sucontrato:
 *                 type: number
 *     responses:
 *       200:
 *         description: ConfigureData registrada con éxito.
 *       409:
 *         description: Error al intentar crear la ConfigureData.
 */
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
    await responseError(409, error, res);
  }
};

/**
 * @swagger
 * /api/configuredata/active:
 *   get:
 *     summary: Obtener la ConfigureData activa
 *     tags: [ConfigureData]
 *     responses:
 *       200:
 *         description: Consulta exitosa
 *       204:
 *         description: No hay ConfigureData activa.
 *       409:
 *         description: Error al intentar obtener la ConfigureData activa.
 */
const getActiveConfigureData = async (req, res) => {
  try {
    const activeConfigureData = await ConfigureData.findOne({ status: 'Activo' });

    if (!activeConfigureData) {
      res.formatResponse('ok', 204, 'No hay ConfigureData activa.', []);
    }

    // Verificar si ha pasado más de 24 horas
    const tiempoPasado = Date.now() - activeConfigureData.fechaCreacion.getTime();
    const horasPasadas = tiempoPasado / (1000 * 60 * 60);

    if (horasPasadas > 24) {
      // Configuración expirada
      activeConfigureData.status = 'Expirado';
      await activeConfigureData.save();
      res.formatResponse('ok', 204, 'ConfigureData expirada.', []);
    } else {
      res.formatResponse('ok', 200, 'Consulta exitosa', activeConfigureData);
    }
  } catch (error) {
    await responseError(409, error, res);
  }
};

/**
 * @swagger
 * /api/configuredata/{id}:
 *   get:
 *     summary: Obtener ConfigureData por ID
 *     tags: [ConfigureData]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Consulta exitosa
 *       204:
 *         description: ConfigureData no encontrada.
 *       409:
 *         description: Error al intentar obtener la ConfigureData por ID.
 */
const getConfigureDataById = async (req, res) => {
  try {
    const configureData = await ConfigureData.findById(req.params.id);

    if (!configureData) {
      res.formatResponse('ok', 204, 'ConfigureData no encontrada.', []);
    }

    res.formatResponse('ok', 200, 'Consulta exitosa', configureData);
  } catch (error) {
    await responseError(409, error, res);
  }
};

/**
 * @swagger
 * /api/configuredata/{id}:
 *   put:
 *     summary: Actualizar ConfigureData por ID
 *     tags: [ConfigureData]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rendimiento:
 *                 type: number
 *               combustible:
 *                 type: number
 *               inflacion:
 *                 type: number
 *               financiamiento:
 *                 type: number
 *               otros:
 *                 type: number
 *               sucontrato:
 *                 type: number
 *     responses:
 *       200:
 *         description: ConfigureData actualizada con éxito.
 *       204:
 *         description: ConfigureData no encontrada.
 *       409:
 *         description: Error al intentar actualizar la ConfigureData por ID.
 */
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
      { new: true },
    );

    if (!configureDataActualizada) {
      res.formatResponse('ok', 204, 'ConfigureData no encontrada.', []);
    }

    res.formatResponse('ok', 200, 'ConfigureData actualizada con éxito.', configureDataActualizada);
  } catch (error) {
    await responseError(409, error, res);
  }
};

module.exports = {
  createConfigureData,
  getActiveConfigureData,
  getConfigureDataById,
  updateConfigureData,
};
