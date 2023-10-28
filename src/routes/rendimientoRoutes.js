const express = require('express');

const router = express.Router();
const rendimientosController = require('../controllers/rendiminetoController');

router.post('/rendimientos', rendimientosController.crearRendimiento);
router.get('/rendimientos', rendimientosController.obtenerRendimientos);
router.get('/rendimientos/:id', rendimientosController.obtenerRendimientoPorId);
router.put('/rendimientos/:id', rendimientosController.actualizarRendimiento);
router.delete('/rendimientos/:id', rendimientosController.eliminarRendimiento);

module.exports = {
  rendimientoRoutes: router,
};
