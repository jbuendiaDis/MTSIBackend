const express = require('express');

const router = express.Router({
  mergeParams: true,
});

const UserController = require('../controllers/userController');

router.post('/users', UserController.createUser);
router.get('/users', UserController.getUsers);
router.get('/users/:userId', UserController.getUserById);
router.put('/users/:userId', UserController.updateUser);
router.delete('/users/:userId', UserController.deleteUser);

module.exports = {
  usersRoutes: router,
};
