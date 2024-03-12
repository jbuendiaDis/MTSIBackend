// routes/municipiosRoutes.js
const express = require('express');

const router = express.Router();

const municipiosController = require('../controllers/municipiosController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');


router.get('/municipios', verifyToken, formatResponse, municipiosController.getAllMunicipios );
router.get('/municipios/by-estado/:estado', verifyToken, formatResponse, municipiosController.getMunicipiosByEstado );


router.get('/:id', municipiosController.getMunicipioById);
router.post('/', municipiosController.createMunicipio);
router.put('/:id', municipiosController.updateMunicipio);
router.delete('/:id', municipiosController.deleteMunicipio);

module.exports = {
    municipiosRoutes: router,
  };
  
 