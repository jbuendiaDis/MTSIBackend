// routes/quote01Routes.js
const express = require('express');

const router = express.Router();

const quote01Controller = require('../controllers/quote01Controller');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/quotes01', verifyToken, formatResponse, quote01Controller.createQuote01);
router.get('/quotes01', verifyToken, formatResponse, quote01Controller.getQuotes01);
router.get('/quotes-01/all', verifyToken, formatResponse, quote01Controller.getSolicitudesSimples);
router.get('/quotes-01/byclienteId/:clientId', verifyToken, formatResponse, quote01Controller.getSolicitudesByClienteId);
router.get('/quotes-01/byUserId/:userId', verifyToken, formatResponse, quote01Controller.getSolicitudesByUserId);
router.get('/quotes01/:folio', verifyToken, formatResponse, quote01Controller.getQuoteDetailsByFolio);
router.get('/quoteHistory/:folio', verifyToken, formatResponse,  quote01Controller.getQuoteHistoryByFolio);
router.put('/quotes01/:id', verifyToken, formatResponse, quote01Controller.updateQuote01);
router.delete('/quotes01/:id', verifyToken, formatResponse, quote01Controller.deleteQuote01);
router.put('/quotes01/cancel/:folio', verifyToken,formatResponse, quote01Controller.cancelQuote);



router.post('/v2/solicitud/01', verifyToken, formatResponse, quote01Controller.createSolicitud);
router.get('/v2/cotizacion/:folio', verifyToken, formatResponse, quote01Controller.getCotizacionByFolio);
router.get('/v2/solicitud/detalle/:folio', verifyToken, formatResponse, quote01Controller.getSolicitudDetalleByFolio);



module.exports = {
  quote01Routes: router,
};
