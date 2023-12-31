const express = require('express');
const router = express.Router();

const rendimientosController = require('../controllers/rendiminetoController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/rendimientos', verifyToken, formatResponse, rendimientosController.crearRendimiento);
router.get('/rendimientos', verifyToken, formatResponse, rendimientosController.obtenerRendimientos);
router.get('/rendimientos/:id', verifyToken, formatResponse, rendimientosController.obtenerRendimientoPorId);
router.put('/rendimientos/:id', verifyToken, formatResponse, rendimientosController.actualizarRendimiento);
router.delete('/rendimientos/:id', verifyToken, formatResponse, rendimientosController.eliminarRendimiento);

module.exports = {
  rendimientoRoutes: router,
};
