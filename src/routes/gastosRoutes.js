const express = require('express');

const router = express.Router();

const gastosController = require('../controllers/gastosController');
const respaldosController = require('../controllers/respaldosController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/gastos', verifyToken, formatResponse, gastosController.createGastos);
router.get('/gastos', verifyToken, formatResponse, gastosController.getGastos);
router.get('/gastosPeajes', verifyToken, formatResponse, gastosController.getGastosConPeajes);
router.get('/gastos/:id', verifyToken, formatResponse, gastosController.getGastosById);
router.put('/gastos/:id', verifyToken, formatResponse, gastosController.updateGastos);
router.delete('/gastos/:id', verifyToken, formatResponse, gastosController.deleteGastos);

router.get('/respaldar-db', verifyToken, formatResponse, respaldosController.respaldarDB);
router.get('/restaurar-db', verifyToken, formatResponse, respaldosController.cargarRespaldoADB);


module.exports = {
  gastosRoutes: router,
};
