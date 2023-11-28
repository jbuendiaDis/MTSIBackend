const State = require('../models/states');
const Country = require('../models/country');
const responseError = require('../functions/responseError');

async function getStates(req, res) {
  try {
    const states = await State.find();

    if (!states || states.length === 0) {
      await responseError(204,'No se encontraron estados.',res);
    }

    //res.status(200).json(states);
    res.formatResponse('ok', 200, 'Consulta exitosa', states);
  } catch (error) {
    await responseError(409,error,res);
  }
}

async function getCountry(req, res) {
  try {
    const states = await Country.find();

    if (!states || states.length === 0) {
      await responseError(204,'No se encontraron localidades.',res);
    }

    //res.status(200).json(states);
    res.formatResponse('ok', 200, 'Consulta exitosa', states);
  } catch (error) {
    await responseError(409,error,res);
  }
}

module.exports = {
  getStates,
  getCountry,
};
