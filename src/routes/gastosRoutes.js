const express = require('express');

const router = express.Router();
const gastosController = require('../controllers/gastosController');

router.post('/gastos', gastosController.createGastos);

router.get('/gastos', gastosController.getGastos);

router.get('/gastosPeajes', gastosController.getGastosConPeajes);

router.get('/gastos/:id', gastosController.getGastosById);

router.put('/gastos/:id', gastosController.updateGastos);

router.delete('/gastos/:id', gastosController.deleteGastos);

module.exports = {
  gastosRoutes: router,
};
