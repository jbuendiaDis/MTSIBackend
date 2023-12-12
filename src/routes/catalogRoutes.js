const express = require('express');
const router = express.Router();

const catalogController = require('../controllers/catalogController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/catalog', verifyToken, formatResponse, catalogController.createCatalog);
router.get('/catalogs', verifyToken, formatResponse, catalogController.getAllCatalogs);
router.get('/catalog/:id', verifyToken, formatResponse, catalogController.getCatalogById);
router.put('/catalog/:id', verifyToken, formatResponse, catalogController.updateCatalog);
router.get('/catalog/children/:id', verifyToken, formatResponse, catalogController.getAllChildrenByParentId);


module.exports = {
  catalogRoutes: router,
};
