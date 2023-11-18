// Importar Express y el controlador de usuarios cliente
const express = require('express');
const userClientController = require('../controllers/userClientController');

const router = express.Router({
  mergeParams: true,
});

const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

// Definir las rutas y los métodos HTTP correspondientes
router.post('/userClient', verifyToken, formatResponse, userClientController.createUserClient);
router.get('/userClient', verifyToken, formatResponse, userClientController.getAllUserClients);
router.get('/userClient/:id', verifyToken, formatResponse, userClientController.getUserClientById);
router.put('/userClient/:id', verifyToken, formatResponse, userClientController.updateUserClient);
router.delete('/userClient/:id', verifyToken, formatResponse, userClientController.deleteUserClient);

module.exports = {
  userClientRoutes: router,
};
