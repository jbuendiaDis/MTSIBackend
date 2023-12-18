const express = require('express');
const router = express.Router();

const countryController = require('../controllers/countryController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/countries', verifyToken, formatResponse, countryController.createCountry);
router.get('/countries', verifyToken, formatResponse, countryController.getAllCountries);
router.get('/countries/:codigo', verifyToken, formatResponse, countryController.getCountryByCode);
router.get('/countries/by-estado/:estado', verifyToken, formatResponse, countryController.getCountryByEstado);
router.get('/countries/by-nombre/:nombre', verifyToken, formatResponse, countryController.getCountryByNombre);



router.put('/countries/:codigo', verifyToken, formatResponse, countryController.updateCountryByCode);
router.delete('/countries/:id', verifyToken, formatResponse, countryController.deleteCountryById);  // Agregado para eliminar por ID

router.post('/countries/save-points', verifyToken, formatResponse, countryController.savePointsAsCountries);


router.post('/countries/save-points', verifyToken, formatResponse, countryController.savePointsAsCountries);

router.get('/countries/estado/:estado/tipoUnidad/:tipoUnidad',  verifyToken, formatResponse, countryController.getCountryByEstadoYTipoUnidad);




module.exports = {
  countryRoutes: router,
};
