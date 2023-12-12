const express = require('express');

const router = express.Router();
const authController = require('../controllers/auth');

router.post('/login', authController.login);
router.post('/login/client', authController.loginclient);

module.exports = {
  authRoutes: router,
};
