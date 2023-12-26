const express = require('express');

const router = express.Router();

const countryController = require('../controllers/countryController');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/countrie', verifyToken, formatResponse, countryController.createCountry);
router.post('/countries/save-points', verifyToken, formatResponse, countryController.savePointsAsCountries);

router.get('/countries/all', verifyToken, formatResponse, countryController.getAllCountries);
router.get('/countries/by-id/:id', verifyToken, formatResponse, countryController.getCountryById);
router.get('/countries/by-codigo/:codigo', verifyToken, formatResponse, countryController.getCountryByCode);
router.get('/countries/by-estado/:estado', verifyToken, formatResponse, countryController.getCountryByEstado);
router.get('/countries/by-nombre/:nombre', verifyToken, formatResponse, countryController.getCountryByNombre);
router.get('/countries/estado/:estado/tipoUnidad/:tipoUnidad', verifyToken, formatResponse, countryController.getCountryByEstadoYTipoUnidad);

//router.put('/countries/:codigo', verifyToken, formatResponse, countryController.updateCountryByCode);
router.put('/countries/:id', verifyToken, formatResponse, countryController.updateCountryById);



router.delete('/countries/:id', verifyToken, formatResponse, countryController.deleteCountryById);

module.exports = {
  countryRoutes: router,
};
