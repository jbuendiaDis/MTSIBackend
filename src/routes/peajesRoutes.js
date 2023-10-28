const express = require('express');

const router = express.Router();
const peajesController = require('../controllers/peajesController');

router.post('/peajes', peajesController.createPeaje);

router.get('/peajes', peajesController.getPeajes);

router.get('/peajes/:id', peajesController.getPeajeById);

router.put('/peajes/:id', peajesController.updatePeaje);

router.delete('/peajes/:id', peajesController.deletePeaje);

module.exports = {
  peajesRoutes: router,
};
