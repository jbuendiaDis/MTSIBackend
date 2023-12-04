const express = require('express');

const router = express.Router();
const CostoController = require('../controllers/quotesController'); // Asegúrate de importar el controlador adecuado

const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/cotizacion', verifyToken, formatResponse, CostoController.createData);
router.get('/cotizacion', verifyToken, formatResponse, CostoController.getAllData);
router.get('/cotizacion/enviar', verifyToken, formatResponse, CostoController.sendCotizacion);
router.get('/cotizacion/:costoId', verifyToken, formatResponse, CostoController.getDataById);
router.put('/cotizacion/:costoId', verifyToken, formatResponse, CostoController.updateData);
router.delete('/cotizacion/:costoId', verifyToken, formatResponse, CostoController.deleteData);

module.exports = {
  quotesRoutes: router,
};
