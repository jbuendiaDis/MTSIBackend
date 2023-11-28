const express = require('express');

const router = express.Router({
  mergeParams: true,
});

const stateController = require('../controllers/stateController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.get('/states', verifyToken, formatResponse, stateController.getStates);
router.get('/countries', verifyToken, formatResponse, stateController.getCountry);

module.exports = {
  tollsRoutes: router,
};
