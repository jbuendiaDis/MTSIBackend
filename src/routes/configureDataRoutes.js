const express = require('express');
const router = express.Router();

const configureDataController = require('../controllers/configureDataController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/configureData', verifyToken, formatResponse, configureDataController.createConfigureData);
router.get('/configureData/active', verifyToken, formatResponse, configureDataController.getActiveConfigureData);
router.get('/configureData/:id', verifyToken, formatResponse, configureDataController.getConfigureDataById);
router.put('/configureData/:id', verifyToken, formatResponse, configureDataController.updateConfigureData);


// ... (otras rutas)

module.exports = {
  configureDataRoutes: router,
};
