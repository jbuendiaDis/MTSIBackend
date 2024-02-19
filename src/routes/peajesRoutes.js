const express = require('express');

const router = express.Router();

const peajesController = require('../controllers/peajesController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/peajes', verifyToken, formatResponse, peajesController.createPeaje);
router.get('/peajes', verifyToken, formatResponse, peajesController.getPeajes);
router.get('/peajes/:id', verifyToken, formatResponse, peajesController.getPeajeById);
router.put('/peajes/:id', verifyToken, formatResponse, peajesController.updatePeaje);
router.delete('/peajes/:id', verifyToken, formatResponse, peajesController.deletePeaje);
router.get('/peajessingastos', verifyToken, formatResponse, peajesController.listarRutasSinGasto);


module.exports = {
  peajesRoutes: router,
};
