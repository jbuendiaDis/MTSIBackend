const express = require('express');

const router = express.Router();

const clienteController = require('../controllers/clientController');

router.post('/clientes', clienteController.createCliente);
router.get('/clientes', clienteController.getClientes);
router.get('/clientes/razonSocial/:razonSocialQuery', clienteController.getClienteLike);
router.get('/clientes/id/:id', clienteController.getClienteById);
router.put('/clientes/:id', clienteController.updateCliente);
router.delete('/clientes/:id', clienteController.deleteCliente);

module.exports = {
  clientRoutes: router,
};
