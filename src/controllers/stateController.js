const State = require('../models/states');
const Country = require('../models/country');

async function getStates(req, res) {
  try {
    const states = await State.find();

    if (!states || states.length === 0) {
      res.status(404).json({ message: 'No se encontraron estados.' });
    }

    res.status(200).json(states);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
}

async function getCountry(req, res) {
  try {
    const states = await Country.find();

    if (!states || states.length === 0) {
      res.status(404).json({ message: 'No se encontraron localidades.' });
    }

    res.status(200).json(states);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
}

module.exports = {
  getStates,
  getCountry,
};
