const express = require('express');

const router = express.Router({
  mergeParams: true,
});

const stateController = require('../controllers/stateController');

router.get('/states', stateController.getStates);
router.get('/countries', stateController.getCountry);

module.exports = {
  tollsRoutes: router,
};
