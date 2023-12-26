// functions/getDestinationName.js
const Country = require('../models/country');

const getDestinationIdEstado = async (codigo) => {
  try {
    const catalogEntry = await Country.findOne({ codigo });

    if (!catalogEntry) {
      return null;
    }

    return catalogEntry.estado;
  } catch (error) {
    console.error('Error al obtener el id del estado:', error);
    return null;
  }
};

module.exports = getDestinationIdEstado;
