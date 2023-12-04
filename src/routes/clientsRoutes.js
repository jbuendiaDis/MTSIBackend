const express = require('express');

const router = express.Router();

const clienteController = require('../controllers/clientController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/clientes', verifyToken, formatResponse, clienteController.createCliente);
router.get('/clientes', verifyToken, formatResponse, clienteController.getClientes);
router.get('/clientes/razonSocial/:razonSocialQuery', verifyToken, formatResponse, clienteController.getClienteLike);
router.get('/clientes/id/:id', verifyToken, formatResponse, clienteController.getClienteById);
router.put('/clientes/:id', verifyToken, formatResponse, clienteController.updateCliente);
router.delete('/clientes/:id', verifyToken, formatResponse, clienteController.deleteCliente);

module.exports = {
  clientRoutes: router,
};
