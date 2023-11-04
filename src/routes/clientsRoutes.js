const express = require('express');

const router = express.Router();

const clienteController = require('../controllers/clientController');
const { verifyToken } = require('../utils/verifyToken');

router.post('/clientes', verifyToken, clienteController.createCliente);
router.get('/clientes', verifyToken, clienteController.getClientes);
router.get('/clientes/razonSocial/:razonSocialQuery', verifyToken, clienteController.getClienteLike);
router.get('/clientes/id/:id', verifyToken, clienteController.getClienteById);
router.put('/clientes/:id', verifyToken, clienteController.updateCliente);
router.delete('/clientes/:id', verifyToken, clienteController.deleteCliente);

module.exports = {
  clientRoutes: router,
};
