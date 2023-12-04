const express = require('express');

const router = express.Router();
const trasladoController = require('../controllers/trasladoController');

const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/traslados', verifyToken, formatResponse, trasladoController.createTraslado);
router.get('/traslados', verifyToken, formatResponse, trasladoController.getTraslados);
router.get('/traslados/:id', verifyToken, formatResponse, trasladoController.getTrasladoById);
router.put('/traslados/:id', verifyToken, formatResponse, trasladoController.updateTraslado);
router.delete('/traslados/:id', verifyToken, formatResponse, trasladoController.deleteTraslado);

module.exports = {
  trasladosRoutes: router,
};
