const express = require('express');
const router = express.Router();

const banderaController = require('../controllers/banderaController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/bandera', verifyToken, formatResponse, banderaController.createBandera);
router.get('/banderas', verifyToken, formatResponse, banderaController.getAllBanderas);
router.get('/bandera/:id', verifyToken, formatResponse, banderaController.getBanderaById);
router.put('/bandera/:id', verifyToken, formatResponse, banderaController.updateBandera);
router.delete('/bandera/:id', verifyToken, formatResponse, banderaController.deleteBandera);

module.exports = {
  banderaRoutes: router,
};
