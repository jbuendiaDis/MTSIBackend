const express = require('express');

const router = express.Router({
  mergeParams: true,
});

const UserController = require('../controllers/userController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/users', verifyToken, UserController.createUser);
router.get('/users', verifyToken, formatResponse, UserController.getUsers);
router.get('/users/:userId', verifyToken, UserController.getUserById);
router.put('/users/:userId', verifyToken, UserController.updateUser);
router.delete('/users/:userId', verifyToken, UserController.deleteUser);

module.exports = {
  usersRoutes: router,
};
