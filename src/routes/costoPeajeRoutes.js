const express = require('express');

const router = express.Router();

const costoPeajeController = require('../controllers/costoPeajeController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/costoPeajes', verifyToken, formatResponse, costoPeajeController.createCostoPeaje);
router.get('/costoPeajes', verifyToken, formatResponse, costoPeajeController.getCostoPeajes);
router.get('/costoPeajes/:id', verifyToken, formatResponse, costoPeajeController.getCostoPeajeById);
router.put('/costoPeajes/:id', verifyToken, formatResponse, costoPeajeController.updateCostoPeaje);
router.delete('/costoPeajes/:id', verifyToken, formatResponse, costoPeajeController.deleteCostoPeaje);

module.exports = {
  costoPeajeRoutes: router,
};
