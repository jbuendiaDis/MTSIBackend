// routes/quote01Routes.js
const express = require('express');
const router = express.Router();

const quote01Controller = require('../controllers/quote01Controller');
const { verifyToken } = require('../utils/verifyToken');
const formatResponse = require('../utils/formatResponse');

router.post('/quotes01', verifyToken, formatResponse, quote01Controller.createQuote01);
router.get('/quotes01', verifyToken, formatResponse, quote01Controller.getQuotes01);
router.get('/quotes01/:id', verifyToken, formatResponse, quote01Controller.getQuote01ById);
router.put('/quotes01/:id', verifyToken, formatResponse, quote01Controller.updateQuote01);
router.delete('/quotes01/:id', verifyToken, formatResponse, quote01Controller.deleteQuote01);

module.exports = {
  quote01Routes: router,
};
