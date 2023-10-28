const express = require('express');

const router = express.Router();
const trasladoController = require('../controllers/trasladoController');

// Ruta POST para crear un nuevo traslado
router.post('/traslados', trasladoController.createTraslado);

// Ruta GET para obtener todos los traslados
router.get('/traslados', trasladoController.getTraslados);

// Ruta GET para obtener un traslado por su ID
router.get('/traslados/:id', trasladoController.getTrasladoById);

// Ruta PUT para actualizar un traslado por su ID
router.put('/traslados/:id', trasladoController.updateTraslado);

// Ruta DELETE para eliminar un traslado por su ID
router.delete('/traslados/:id', trasladoController.deleteTraslado);

module.exports = {
  trasladosRoutes: router,
};
