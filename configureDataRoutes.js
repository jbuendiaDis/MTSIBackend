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
    // Lógica para crear ConfigureData
    res.status(200).json({ message: 'ConfigureData registrada con éxito.' });
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
 *         description: No hay Configur eData activa.
 *       409:
 *         description: Error al intentar obtener la ConfigureData activa.
 */
const getActiveConfigureData = async (req, res) => {
  try {
    // Lógica para obtener la ConfigureData activa
    res.status(200).json({ message: 'Consulta exitosa' });
  } catch (error) {
    await responseError(409, error, res);
  }
};

// Otros controladores con comentarios Swagger...

module.exports = {
  createConfigureData,
  getActiveConfigureData,
  // Otros controladores exportados...
};
