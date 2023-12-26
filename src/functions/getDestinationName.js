// functions/getDestinationName.js
const Country = require('../models/country');

const getDestinationName = async (codigo) => {
  try {
    const catalogEntry = await Country.findOne({ codigo });

    if (!catalogEntry) {
      return null;
    }

    return catalogEntry.nombre;
  } catch (error) {
    console.error('Error al obtener el nombre del destino/origen:', error);
    return null;
  }
};
module.exports = getDestinationName;
 