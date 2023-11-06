const express = require('express');

const router = express.Router({
  mergeParams: true,
});

const UserController = require('../controllers/userController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/users', verifyToken, formatResponse, UserController.createUser);
router.get('/users', verifyToken, formatResponse, UserController.getUsers);
router.get('/users/:userId', verifyToken, formatResponse, UserController.getUserById);
router.put('/users/:userId', verifyToken, formatResponse, UserController.updateUser);
router.delete('/users/:userId', verifyToken, formatResponse, UserController.deleteUser);

module.exports = {
  usersRoutes: router,
};
