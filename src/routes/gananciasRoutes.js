const express = require('express');
const router = express.Router();

const gananciasController = require('../controllers/gananciasController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/ganancias', verifyToken, formatResponse, gananciasController.createGanancia);
router.get('/ganancias', verifyToken, formatResponse, gananciasController.getGanancias);
router.put('/ganancias/:id', verifyToken, formatResponse, gananciasController.updateGanancia);
router.get('/ganancias/:id', verifyToken, formatResponse, gananciasController.getGananciaById);

module.exports = {
  gananciasRoutes: router,
};
